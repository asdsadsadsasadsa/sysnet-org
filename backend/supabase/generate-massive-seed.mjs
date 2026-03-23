import fs from 'node:fs/promises';
import path from 'node:path';

const PACK_PATH = path.resolve('backend/supabase/seed-content-pack-2026-03-19.json');
const OUTPUT_PATH = path.resolve('backend/supabase/massive-seed-pack.json');

const NAMES = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const TOPICS = [
  {
    topic: "Model-Based Systems Engineering",
    titles: [
      "Why SysML v2 won't fix your broken organizational culture",
      "MBSE: The difference between a model and a diagram",
      "Transitioning from documents to models: A 12-month retrospective",
      "How to avoid building a 'shelfware' architecture model",
      "SysML vs Capella: Practical differences in aerospace workflows",
      "The hidden cost of poorly structured MBSE ontologies"
    ],
    bodies: [
      "We spent 6 months building a beautiful SysML model, only to realize the hardware team was still using their own disconnected Excel sheets. The lesson? MBSE is 10% tool, 90% cultural change management. If you don't mandate model-in-the-loop design reviews, the model just becomes an expensive drawing board.",
      "A diagram is just a picture. A model is a database of relationships. If I can't query your 'architecture' to tell me exactly which requirements fail when component X loses power, you don't have a model. You have Visio with extra steps.",
      "The biggest hurdle we faced was convincing senior engineers that the model *is* the source of truth, not a byproduct of the design process. We had to literally ban Word documents for interface definitions before people took it seriously."
    ]
  },
  {
    topic: "Requirements Engineering",
    titles: [
      "Stop writing 'shall' statements for things you can't verify",
      "Requirements traceability: When is it too much?",
      "The anatomy of a good interface requirement",
      "Why DOORS is still alive (and why that's okay)",
      "Agile requirements in hardware: Not an oxymoron"
    ],
    bodies: [
      "I see this constantly: 'The system shall be robust.' How do you test 'robust'? If a requirement doesn't have a corresponding verification method (Test, Analysis, Demonstration, Inspection) written at the exact same time, throw it out.",
      "We chased 100% bidirectional traceability on a commercial product and ground development to a halt. Not every software unit test needs to trace back to a user need. Learn to define your criticality boundaries and trace accordingly.",
      "A good interface requirement specifies the physical connector, the protocol, the data rate, and the failure state. If you leave any of those four out, you are guaranteeing an integration failure later down the line."
    ]
  },
  {
    topic: "Verification and Validation",
    titles: [
      "Verification is building it right. Validation is building the right thing.",
      "Automated HIL testing saved our launch schedule",
      "When analysis isn't enough: The limits of simulation",
      "Test like you fly, fly like you test: A post-mortem",
      "Writing test plans that don't make engineers want to quit"
    ],
    bodies: [
      "You can perfectly verify that a system meets all its requirements, and still build a product that the user hates. Verification proves the math works. Validation proves the concept works. You need both, and they require completely different mindsets.",
      "Moving to automated Hardware-in-the-Loop (HIL) testing allowed us to run 10,000 edge-case scenarios every night. We caught three race conditions in the motor controller firmware that would have been impossible to find via manual bench testing.",
      "Simulations are only as good as their assumptions. We modeled thermal dissipation perfectly, but forgot to account for the physical wiring harness blocking airflow. The physical test failed instantly. Always anchor your models with empirical data."
    ]
  },
  {
    topic: "Safety and Reliability",
    titles: [
      "FMEA vs FTA: Which one should you use?",
      "Designing for graceful degradation",
      "The myth of the 'single point of failure'",
      "Software safety in critical systems (DO-178C lessons)",
      "Redundancy isn't always the answer"
    ],
    bodies: [
      "Failure Mode and Effects Analysis (FMEA) is bottom-up (what happens if this part breaks?). Fault Tree Analysis (FTA) is top-down (the system exploded, how could that happen?). You need FMEA for component selection and FTA for system architecture.",
      "When the primary sensor fails, the system shouldn't just crash. It should fall back to a less accurate sensor, alert the operator, and restrict its operational envelope. Graceful degradation is a core principle of robust systems.",
      "Adding a redundant component often adds a common-mode failure point (like a shared power bus or voting logic) that is less reliable than the original component. Sometimes, making one component incredibly robust is better than having two mediocre ones."
    ]
  },
  {
    topic: "Systems Architecture",
    titles: [
      "Conway's Law in hardware design",
      "Defining clean system boundaries",
      "The role of the Systems Architect in 2026",
      "Trade studies: How to actually make decisions",
      "Modularity: The good, the bad, and the over-engineered"
    ],
    bodies: [
      "If you have three teams working on a robot, you will get a robot with three main subsystems, regardless of whether that's the optimal physical architecture. You have to design the organization to match the desired system architecture.",
      "A system boundary is an interface. Every time data, power, or physical force crosses a boundary, you need an ICD (Interface Control Document). If you have too many boundaries, the ICD overhead will kill you.",
      "A good trade study isn't just a weighted matrix in Excel. It's a formalized argument for why we are accepting specific technical debt in exchange for a specific capability. If the loser of the trade study isn't slightly angry, you didn't evaluate hard enough."
    ]
  }
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProfile(index) {
  const firstName = randomChoice(NAMES);
  const lastName = randomChoice(LAST_NAMES);
  const handle = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${index}`;
  const domains = [randomChoice(["aerospace", "robotics", "automotive", "medical devices", "consumer electronics"])];
  
  return {
    handle,
    display_name: `${firstName} ${lastName}`,
    visibility: "public",
    headline: `Systems Engineer working in ${domains[0]}`,
    bio: `Passionate about building complex systems. Focus on architecture, integration, and testing.`,
    location: randomChoice(["San Francisco, CA", "Seattle, WA", "Austin, TX", "Boston, MA", "Denver, CO", "Remote"]),
    timezone: "America/Los_Angeles",
    domains,
    tags: ["systems engineering", "architecture", "integration"],
    open_to: ["networking"],
    organization: `${lastName} Engineering Corp`,
    avatar_url: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}%20${lastName}`
  };
}

async function run() {
  const existingPack = JSON.parse(await fs.readFile(PACK_PATH, 'utf8'));
  
  const newProfiles = [];
  const newPosts = [];
  const newComments = [];
  
  // Generate 50 new profiles
  for (let i = 0; i < 50; i++) {
    newProfiles.push(generateProfile(i));
  }
  
  const allProfiles = [...existingPack.profiles, ...newProfiles];
  
  // Generate 150 new posts (3 per new profile)
  for (let i = 0; i < 150; i++) {
    const author = randomChoice(allProfiles);
    const topic = randomChoice(TOPICS);
    const title = randomChoice(topic.titles) + ` (Case Study #${i})`;
    const body = randomChoice(topic.bodies);
    
    newPosts.push({
      author_handle: author.handle,
      group_slug: null,
      title: title,
      body: body
    });
  }
  
  // Generate 300 comments (2 per post)
  for (let i = 0; i < 300; i++) {
    const post = randomChoice(newPosts);
    const commenter = randomChoice(allProfiles);
    
    // Don't comment on own post
    if (post.author_handle === commenter.handle) continue;
    
    newComments.push({
      post_author_handle: post.author_handle,
      post_title: post.title,
      author_handle: commenter.handle,
      body: randomChoice([
        "This is exactly what we experienced on our last project. Great writeup.",
        "I disagree slightly - I think the tool matters just as much as the culture.",
        "How did you handle the documentation overhead?",
        "Spot on. It's amazing how many organizations still struggle with this.",
        "Could you elaborate more on the specific metrics you tracked?",
        "We tried this approach but had issues getting buy-in from the electrical team.",
        "Thanks for sharing. This is a very pragmatic view.",
        "I'd love to see a deeper dive into the specific interface definitions.",
        "This is why I always mandate an architecture review board before PDR."
      ])
    });
  }
  
  const massivePack = {
    profiles: allProfiles,
    posts: [...existingPack.posts, ...newPosts],
    comments: [...existingPack.comments, ...newComments]
  };
  
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(massivePack, null, 2));
  console.log(`Generated massive pack: ${allProfiles.length} profiles, ${massivePack.posts.length} posts, ${massivePack.comments.length} comments.`);
}

run().catch(console.error);
