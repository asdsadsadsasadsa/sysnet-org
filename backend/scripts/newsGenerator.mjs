#!/usr/bin/env node
/**
 * SYLEN News Generator
 *
 * Fetches top HN stories (>50 comments), classifies relevance for systems engineers,
 * synthesizes a 1-2 page article using Claude CLI, generates an AI image, saves to Supabase.
 *
 * Run: node generate-news.mjs [--dry-run]
 */

import https from 'https';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL = 'https://fxtzbsgyallzcwznxztv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dHpic2d5YWxsemN3em54enR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODQwMywiZXhwIjoyMDg4MDg0NDAzfQ.9CHufTKTq4Y4PDfkz5niSxMgwBKFNqAcRoDK1ZSukMc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const SE_KEYWORDS = [
  'systems engineering','mbse','sysml','safety-critical','safety critical',
  'formal methods','formal verification','requirements engineering','distributed systems',
  'reliability','fault tolerance','aerospace','avionics','defense','automotive','embedded',
  'real-time','rtos','verification','validation','system architecture','digital twin',
  'cyber-physical','incident','post-mortem','outage','failure analysis','hardware design',
  'semiconductor','signal integrity','spacecraft','satellite','robotics','autonomous',
  'ai safety','ml systems','observability','chaos engineering','resilience engineering',
  'engineering leadership','systems thinking','complexity','infrastructure reliability',
  'operating system','kernel','compiler','networking protocol','hardware software',
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout: ' + url)));
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : null;
    if (!mod) { resolve(''); return; }
    const req = mod.get(url, { timeout: 20000, headers: { 'User-Agent': 'SYLEN-News/1.0 (+https://sylen.org)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location).then(resolve).catch(resolve.bind(null, ''));
        return;
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 10000);
}

function claudeAsk(prompt) {
  // Use the local Claude CLI which already has auth
  const claudeBin = `${process.env.HOME}/.claude/local/claude`;
  const escaped = prompt.replace(/'/g, `'"'"'`);
  try {
    const result = execSync(`${claudeBin} --print --permission-mode bypassPermissions -p '${escaped}'`, {
      timeout: 120000,
      maxBuffer: 1024 * 1024 * 10,
      env: { ...process.env },
    });
    return result.toString().trim();
  } catch (e) {
    throw new Error('Claude CLI failed: ' + (e.message || e).slice(0, 200));
  }
}

async function getHnStories() {
  console.log('Fetching HN stories...');
  const resp = await fetchJson(
    'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=60&numericFilters=num_comments%3E50&attributesToRetrieve=objectID,title,url,num_comments,points&query='
  );
  return (resp.hits || []).filter(s => s.url && s.num_comments > 50).sort((a, b) => b.num_comments - a.num_comments);
}

async function getAlreadyWritten() {
  const { data } = await supabase.from('news_articles').select('hn_story_id').limit(500);
  return new Set((data || []).map(r => r.hn_story_id));
}

function isRelevant(story) {
  const t = (story.title || '').toLowerCase();
  return SE_KEYWORDS.some(k => t.includes(k));
}

async function run() {
  console.log(`SYLEN News Generator — ${DRY_RUN ? 'DRY RUN' : 'LIVE'} — ${new Date().toISOString()}`);

  const [stories, alreadyWritten] = await Promise.all([getHnStories(), getAlreadyWritten()]);
  console.log(`${stories.length} HN stories, ${alreadyWritten.size} already covered`);

  const candidates = stories.filter(s => !alreadyWritten.has(s.objectID));
  if (!candidates.length) { console.log('Nothing new to write about.'); return; }

  // Keyword filter first, then let Claude pick from top candidates
  const relevant = candidates.filter(isRelevant);
  const pool = (relevant.length > 0 ? relevant : candidates).slice(0, 20);

  const storyList = pool.map((s, i) =>
    `${i + 1}. [ID:${s.objectID}] "${s.title}" (${s.num_comments} comments, ${s.points} pts) — ${s.url}`
  ).join('\n');

  console.log('Asking Claude to pick the best story...');
  const pickResponse = claudeAsk(
    `You are a content editor for SYLEN — a professional network for systems engineers (MBSE, safety-critical, reliability, embedded, aerospace, formal methods, distributed systems, etc).

Here are top HN stories right now:

${storyList}

Pick the SINGLE most relevant and interesting story for systems engineers. Return exactly:
PICK: [number 1-${pool.length}]
ID: [objectID number]
TOPIC: [one of: Reliability Engineering / Systems Architecture / Safety-Critical / Embedded Systems / Formal Methods / Aerospace & Defense / Engineering Leadership / Distributed Systems / Infrastructure / General SE]
REASON: [one sentence]`
  );

  const pickMatch = pickResponse.match(/PICK:\s*(\d+)/);
  const idMatch = pickResponse.match(/ID:\s*(\d+)/);
  const topicMatch = pickResponse.match(/TOPIC:\s*(.+)/);

  const idx = pickMatch ? parseInt(pickMatch[1]) - 1 : 0;
  const story = (idMatch && pool.find(s => s.objectID === idMatch[1])) || pool[Math.min(idx, pool.length - 1)];
  const topic = topicMatch ? topicMatch[1].trim() : 'Systems Engineering';

  console.log(`Selected: "${story.title}"`);
  console.log(`Topic: ${topic}`);

  // Fetch original content
  let originalContent = '';
  try {
    const html = await fetchText(story.url);
    originalContent = stripHtml(html);
    console.log(`Original content: ${originalContent.length} chars`);
  } catch (e) {
    console.warn('Could not fetch original:', e.message);
    originalContent = story.title;
  }

  console.log('Synthesizing article...');
  const articleResponse = claudeAsk(
    `You are a technical writer for SYLEN — a professional network for systems engineers.

Write a 1-2 page article about this for systems engineers:

Story: "${story.title}"
URL: ${story.url}
Comments: ${story.num_comments} | Points: ${story.points}
Topic: ${topic}

Original content:
---
${originalContent.slice(0, 6000)}
---

Write:
1. A HEADLINE — flashy, clickbaity, technically accurate, specific to why SE practitioners should care
2. A SUMMARY — 2-3 sentences for the article card preview
3. BODY — 800-1000 words in markdown:
   - Lead with why this matters to systems engineers specifically
   - Technical substance, concrete details
   - Connect to SE practices (reliability, V&V, architecture, safety, etc.)
   - Final paragraph: End with a clear attribution link to the original article: "Read the original article at [source domain](${story.url})."

Format:
HEADLINE: [headline]
SUMMARY: [summary]
BODY:
[markdown body]`
  );

  const headlineMatch = articleResponse.match(/HEADLINE:\s*(.+)/);
  const summaryMatch = articleResponse.match(/SUMMARY:\s*([\s\S]+?)(?=\nBODY:|$)/);
  const bodyMatch = articleResponse.match(/BODY:\n([\s\S]+)/);

  const headline = headlineMatch ? headlineMatch[1].trim() : story.title;
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const body = bodyMatch ? bodyMatch[1].trim() : articleResponse;

  console.log(`Headline: ${headline}`);

  // Pollinations.ai free image
  const imagePrompt = encodeURIComponent(
    `Professional technical illustration for systems engineering article: ${headline.slice(0, 80)}. Dark blue, white, clean architectural diagram style, modern, no text`
  );
  const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`;

  if (DRY_RUN) {
    console.log('\n--- DRY RUN ---');
    console.log('Headline:', headline);
    console.log('Summary:', summary);
    console.log('Topic:', topic);
    console.log('Image:', imageUrl);
    console.log('Body preview:', body.slice(0, 400));
    return;
  }

  const { data, error } = await supabase.from('news_articles').insert({
    hn_story_id: story.objectID,
    hn_url: `https://news.ycombinator.com/item?id=${story.objectID}`,
    original_url: story.url,
    headline,
    summary,
    body,
    image_url: imageUrl,
    topic,
    source_title: story.title,
    source_domain: (() => { try { return new URL(story.url).hostname.replace('www.',''); } catch { return ''; } })(),
    hn_points: story.points || 0,
    hn_comments: story.num_comments || 0,
    published_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error('Failed to save:', error.message);
    process.exit(1);
  }

  console.log(`✅ Saved article: ${data.id}`);
  console.log(`   "${headline}"`);
}

run().catch(err => { console.error(err); process.exit(1); });
