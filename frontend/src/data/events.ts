export type EventType =
  | "conference"
  | "workshop"
  | "webinar"
  | "call-for-papers"
  | "chapter-meeting";

export interface Event {
  id: string;
  title: string;
  type: EventType;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  url: string;
  organizer: string;
  tags: string[];
}

export const EVENT_TYPES: { value: EventType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "call-for-papers", label: "Call for Papers" },
  { value: "chapter-meeting", label: "Chapter Meeting" },
];

export const TYPE_LABELS: Record<EventType, string> = {
  conference: "Conference",
  workshop: "Workshop",
  webinar: "Webinar",
  "call-for-papers": "Call for Papers",
  "chapter-meeting": "Chapter Meeting",
};

export const TYPE_COLORS: Record<EventType, string> = {
  conference: "bg-blue-50 text-blue-700 border-blue-200",
  workshop: "bg-violet-50 text-violet-700 border-violet-200",
  webinar: "bg-teal-50 text-teal-700 border-teal-200",
  "call-for-papers": "bg-amber-50 text-amber-700 border-amber-200",
  "chapter-meeting": "bg-slate-100 text-slate-700 border-slate-200",
};

export const EVENTS: Event[] = [
  {
    id: "incose-is-2026",
    title: "INCOSE International Symposium 2026",
    type: "conference",
    description:
      "The premier global gathering for systems engineering professionals. INCOSE IS 2026 features technical sessions, workshops, and plenary talks covering the full spectrum of SE practice — from MBSE and digital engineering to complex system architecting and SE education.",
    location: "San Diego, CA",
    startDate: "2026-07-18",
    endDate: "2026-07-23",
    url: "https://www.incose.org/symp2026",
    organizer: "INCOSE",
    tags: ["systems engineering", "MBSE", "digital engineering", "architecting"],
  },
  {
    id: "ieee-syscon-2026",
    title: "IEEE International Systems Conference (SysCon) 2026",
    type: "conference",
    description:
      "IEEE SysCon brings together researchers and practitioners in systems engineering, systems science, and related disciplines. The 2026 edition focuses on resilient systems design, model-based approaches, and emerging challenges in defence and civil infrastructure.",
    location: "Montreal, Canada",
    startDate: "2026-04-20",
    endDate: "2026-04-23",
    url: "https://www.ieeesyscon.org",
    organizer: "IEEE Systems Council",
    tags: ["IEEE", "resilience", "defence", "infrastructure", "systems science"],
  },
  {
    id: "sae-aerotech-2026",
    title: "SAE AeroTech 2026",
    type: "conference",
    description:
      "AeroTech is SAE International's flagship aerospace and defence engineering conference. It covers avionics, propulsion, structures, manufacturing, and the increasing role of model-based systems engineering across the aerospace product lifecycle.",
    location: "Long Beach, CA",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    url: "https://www.sae.org/attend/aerotech",
    organizer: "SAE International",
    tags: ["aerospace", "avionics", "MBSE", "defence", "manufacturing"],
  },
  {
    id: "esc-2026",
    title: "Embedded Systems Conference (ESC) 2026",
    type: "conference",
    description:
      "ESC covers the full embedded systems development stack — from real-time OS and hardware design to functional safety, cybersecurity, and the intersection of embedded engineering with systems engineering practices in automotive and industrial applications.",
    location: "Boston, MA",
    startDate: "2026-05-04",
    endDate: "2026-05-06",
    url: "https://www.embeddedconf.com",
    organizer: "AspenCore",
    tags: ["embedded", "RTOS", "functional safety", "automotive", "industrial"],
  },
  {
    id: "modelsward-2026",
    title: "MODELSWARD 2026 — Model-Driven Engineering",
    type: "conference",
    description:
      "International conference on model-driven engineering languages and systems. Covers advances in SysML, UML, domain-specific modelling, model transformation, and integration of model-based approaches in safety-critical systems.",
    location: "Porto, Portugal",
    startDate: "2026-04-22",
    endDate: "2026-04-24",
    url: "https://modelsward.scitevents.org",
    organizer: "SCITEPRESS",
    tags: ["SysML", "UML", "model-driven", "DSL", "safety-critical"],
  },
  {
    id: "mbse-workshop-may-2026",
    title: "MBSE Practitioner Workshop — SysML v2 in Practice",
    type: "workshop",
    description:
      "A two-day intensive workshop for systems engineers transitioning from SysML v1 to SysML v2. Hands-on sessions cover the new KerML kernel, parametric modelling, allocations, and practical migration strategies from Cameo and Rhapsody environments.",
    location: "Online",
    startDate: "2026-05-12",
    endDate: "2026-05-13",
    url: "https://www.omg.org/events",
    organizer: "OMG",
    tags: ["SysML v2", "KerML", "MBSE", "Cameo", "Rhapsody"],
  },
  {
    id: "safecomp-2026",
    title: "SAFECOMP 2026 — Safety-Critical Systems",
    type: "conference",
    description:
      "The leading international conference on computer safety and reliability, covering IEC 61508, ISO 26262, DO-178C, and EN 50128 compliance methodologies. Special tracks on AI safety certification and formal verification in safety-critical domains.",
    location: "Vienna, Austria",
    startDate: "2026-09-09",
    endDate: "2026-09-11",
    url: "https://www.safecomp2026.org",
    organizer: "EWICS TC7 / TU Wien",
    tags: ["safety", "IEC 61508", "ISO 26262", "formal verification", "AI safety"],
  },
  {
    id: "cfp-systems-journal-2026",
    title: "Call for Papers — IEEE Systems Journal Special Issue",
    type: "call-for-papers",
    description:
      "The IEEE Systems Journal invites submissions for a special issue on 'Digital Twins and Model-Based Systems Engineering for Cyber-Physical Systems'. Papers due by 30 June 2026. Topics include DT architecture, model fidelity, V&V for digital twins, and industrial case studies.",
    location: "Online",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    url: "https://ieeesystemsjournal.org",
    organizer: "IEEE Systems Journal",
    tags: ["digital twin", "MBSE", "cyber-physical", "journal", "V&V"],
  },
  {
    id: "cfp-incose-insights-2026",
    title: "Call for Papers — INCOSE Insight Q3 2026",
    type: "call-for-papers",
    description:
      "INCOSE Insight quarterly publication seeks practitioner articles on SE methods, tools, and case studies. Theme: Applying model-based systems engineering on real programmes. Abstracts due 1 May 2026; full papers by 15 June 2026.",
    location: "Online",
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    url: "https://www.incose.org/publications/insight",
    organizer: "INCOSE Publications",
    tags: ["INCOSE", "publication", "case study", "MBSE", "SE methods"],
  },
  {
    id: "ndia-se-division-2026",
    title: "NDIA Systems Engineering Division Annual Conference",
    type: "conference",
    description:
      "NDIA's SE Division conference addresses systems engineering challenges in defence acquisition. Tracks cover digital engineering transformation, DoD MBE adoption, JCIDS reform, and sustainment SE. Significant emphasis on SysML v2 adoption across DoD programmes.",
    location: "Arlington, VA",
    startDate: "2026-10-05",
    endDate: "2026-10-07",
    url: "https://www.ndia.org/events",
    organizer: "NDIA",
    tags: ["defence", "DoD", "digital engineering", "JCIDS", "acquisition"],
  },
  {
    id: "robotics-se-webinar-apr-2026",
    title: "Webinar: Systems Engineering for Autonomous Robotics",
    type: "webinar",
    description:
      "A 90-minute technical webinar on applying SE practices — requirement modelling, FMEA, and V&V — to autonomous robotic systems. Features a case study from a warehouse logistics deployment, with discussion of ROS 2 integration in an MBSE workflow.",
    location: "Online",
    startDate: "2026-04-17",
    url: "https://www.incose.org/events",
    organizer: "INCOSE Robotics Working Group",
    tags: ["robotics", "autonomous", "ROS2", "FMEA", "V&V"],
  },
  {
    id: "digital-twin-workshop-jun-2026",
    title: "Digital Twin Integration Workshop",
    type: "workshop",
    description:
      "Practical workshop on connecting SysML v2 models to live digital twins. Covers model synchronisation patterns, real-time data ingestion from operational assets, and fidelity calibration. Suitable for aerospace, defence, and industrial participants.",
    location: "Online",
    startDate: "2026-06-09",
    endDate: "2026-06-10",
    url: "https://www.digitaltwinconsortium.org/events",
    organizer: "Digital Twin Consortium",
    tags: ["digital twin", "SysML v2", "model synchronisation", "aerospace", "industrial"],
  },
  {
    id: "bcs-se-sg-q2-2026",
    title: "BCS Systems Engineering Specialist Group — Q2 Meeting",
    type: "chapter-meeting",
    description:
      "Quarterly meeting of the BCS Systems Engineering Specialist Group, open to all BCS members and guests. Presentation on 'SE Competency Frameworks in 2026 — INCOSE CESE vs ECSS' followed by a discussion panel. Hybrid format.",
    location: "London, UK",
    startDate: "2026-05-21",
    url: "https://www.bcs.org/membership-and-registrations/member-communities/systems-engineering-specialist-group",
    organizer: "BCS SESG",
    tags: ["BCS", "competency", "INCOSE CESE", "ECSS", "professional development"],
  },
  {
    id: "ieee-uk-ireland-se-chapter-2026",
    title: "IEEE UK & Ireland Systems Council Chapter Meeting",
    type: "chapter-meeting",
    description:
      "Technical evening hosted by the IEEE UK & Ireland Systems Council chapter. Speakers present on model-based safety analysis techniques, with a focus on STPA integration into SysML models. Open to IEEE members and students.",
    location: "Manchester, UK",
    startDate: "2026-06-18",
    url: "https://www.ieeesystems.org/chapters",
    organizer: "IEEE UK & Ireland Systems Council",
    tags: ["IEEE", "STPA", "safety analysis", "SysML", "chapter"],
  },
  {
    id: "space-systems-webinar-jul-2026",
    title: "Webinar: SE Challenges in Small Satellite Programmes",
    type: "webinar",
    description:
      "A technical webinar exploring how SE practices scale to constrained NewSpace programmes. Topics include requirements traceability on lean budgets, rapid V&V cycles, and lessons learned from constellation deployment. Presented by practitioners from two LEO programmes.",
    location: "Online",
    startDate: "2026-07-09",
    url: "https://www.incose.org/events",
    organizer: "INCOSE Space Systems Working Group",
    tags: ["space", "small satellite", "NewSpace", "V&V", "traceability"],
  },
  {
    id: "cfp-refsq-2027",
    title: "Call for Papers — REFSQ 2027 (Requirements Engineering)",
    type: "call-for-papers",
    description:
      "REFSQ 2027 invites research and industry papers on requirements engineering foundations, techniques, and tools. Topics include natural language processing for requirements, formal specification, requirements traceability, and RE for AI systems. Abstracts due September 2026.",
    location: "Online",
    startDate: "2026-07-01",
    endDate: "2026-09-15",
    url: "https://refsq.org",
    organizer: "REFSQ Steering Committee",
    tags: ["requirements engineering", "NLP", "traceability", "formal specification", "AI"],
  },
  {
    id: "automotive-se-summit-2026",
    title: "Automotive Systems Engineering Summit 2026",
    type: "conference",
    description:
      "A focused industry conference on the application of systems engineering in automotive product development. Sessions cover ISO 26262 workflows, SOTIF, AUTOSAR adaptive platform, and the transition from component-based to system-level V&V in EV and ADAS programmes.",
    location: "Stuttgart, Germany",
    startDate: "2026-10-20",
    endDate: "2026-10-21",
    url: "https://automotive-se-summit.com",
    organizer: "dSPACE / Altair",
    tags: ["automotive", "ISO 26262", "SOTIF", "AUTOSAR", "ADAS"],
  },
  {
    id: "mbse-medical-webinar-aug-2026",
    title: "Webinar: MBSE for IEC 62304 Medical Device Software",
    type: "webinar",
    description:
      "This webinar demonstrates how model-based SE techniques can streamline IEC 62304 compliance for medical device software. Topics include hazard analysis traceability from SysML to test evidence, configuration management, and documentation automation.",
    location: "Online",
    startDate: "2026-08-20",
    url: "https://www.incose.org/events",
    organizer: "INCOSE Healthcare Working Group",
    tags: ["medical devices", "IEC 62304", "safety", "traceability", "documentation"],
  },
  {
    id: "formal-methods-workshop-nov-2026",
    title: "Formal Methods for Systems Engineering Workshop",
    type: "workshop",
    description:
      "Two-day workshop co-located with FM 2026 exploring the practical integration of formal methods in systems engineering workflows. Sessions on SysML v2 and Alloy integration, Z notation for interface contracts, and automated theorem proving for MBSE model consistency.",
    location: "Oslo, Norway",
    startDate: "2026-11-03",
    endDate: "2026-11-04",
    url: "https://www.fmeurope.org/events",
    organizer: "Formal Methods Europe",
    tags: ["formal methods", "Alloy", "Z notation", "theorem proving", "SysML v2"],
  },
  {
    id: "incose-uk-2026",
    title: "INCOSE UK Annual Symposium 2026",
    type: "conference",
    description:
      "The annual gathering of the UK systems engineering community. INCOSE UK 2026 includes a full day of technical papers, panel discussions on SE workforce development, and an evening awards ceremony recognising outstanding contributions to the profession.",
    location: "Bristol, UK",
    startDate: "2026-11-24",
    endDate: "2026-11-25",
    url: "https://www.incoseuk.org/symposium",
    organizer: "INCOSE UK",
    tags: ["INCOSE UK", "workforce", "SE community", "awards", "professional"],
  },
];
