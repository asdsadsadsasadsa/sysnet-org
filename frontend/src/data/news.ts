export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  topic: string;
  publishedAt: string;
  authorName?: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "1",
    headline: "NASA Updates Systems Engineering Handbook for MBSE Integration",
    summary: "NASA's latest revision of SP-6105 provides new guidance on integrating Model-Based Systems Engineering (MBSE) into the project lifecycle, focusing on digital twins and authoritative source of truth.",
    sourceUrl: "https://www.nasa.gov/offices/oce/functions/models-and-data-interoperability/",
    topic: "MBSE",
    publishedAt: "2026-03-20T10:00:00Z",
    authorName: "NASA OCE"
  },
  {
    id: "2",
    headline: "ISO/IEC 15288:2026 Draft Released for Public Comment",
    summary: "The upcoming revision of the international standard for systems life cycle processes includes enhanced focus on software-intensive systems and agile systems engineering methods.",
    sourceUrl: "https://www.iso.org/standard/15288",
    topic: "Standards",
    publishedAt: "2026-03-18T14:30:00Z",
    authorName: "ISO/IEC JTC 1/SC 7"
  },
  {
    id: "3",
    headline: "Digital Twin Consortium Announces New Interoperability Framework",
    summary: "A new framework aims to standardize how digital twins communicate across different platforms in the aerospace and defense sectors, reducing integration costs by up to 30%.",
    sourceUrl: "https://www.digitaltwinconsortium.org/news/",
    topic: "Digital Twin",
    publishedAt: "2026-03-15T09:15:00Z",
    authorName: "DTC Press"
  },
  {
    id: "4",
    headline: "SysML v2 Final Adoption by OMG",
    summary: "The Object Management Group has officially adopted SysML v2, marking a major milestone in the evolution of systems modeling with its new kernel and API/Services.",
    sourceUrl: "https://www.omg.org/sysml-v2/",
    topic: "MBSE",
    publishedAt: "2026-03-10T16:45:00Z",
    authorName: "OMG News"
  },
  {
    id: "5",
    headline: "INCOSE Announces 2026 International Symposium Theme",
    summary: "The theme for IS2026 will be 'Systems Engineering for a Sustainable Future', highlighting the role of SE in addressing climate change and resource scarcity.",
    sourceUrl: "https://www.incose.org/symposium2026",
    topic: "Events",
    publishedAt: "2026-03-05T11:20:00Z",
    authorName: "INCOSE"
  },
  {
    id: "6",
    headline: "Boeing Expands Digital Thread Initiatives Across Commercial Programs",
    summary: "Boeing is scaling its digital thread capabilities to improve engineering efficiency and reduce rework in the 777X and future aircraft programs.",
    sourceUrl: "https://www.boeing.com/features/2026/03/digital-thread.page",
    topic: "Aerospace",
    publishedAt: "2026-03-01T13:10:00Z",
    authorName: "Engineering Weekly"
  },
  {
    id: "7",
    headline: "Airbus Implements AI-Driven Requirements Verification",
    summary: "Using natural language processing, Airbus is automating the verification of thousands of requirements for its next-generation zero-emission aircraft.",
    sourceUrl: "https://www.airbus.com/en/newsroom/press-releases/2026-03-ai-verification",
    topic: "Verification",
    publishedAt: "2026-02-25T08:50:00Z",
    authorName: "Aviation Tech"
  },
  {
    id: "8",
    headline: "Tesla's New Systems Architecture for Level 4 Autonomy",
    summary: "Leaked documents suggest a radical redesign of Tesla's vehicle control architecture to support true Level 4 autonomy with redundant power and data paths.",
    sourceUrl: "https://www.teslarati.com/tesla-fsd-v14-architecture/",
    topic: "Automotive",
    publishedAt: "2026-02-20T17:30:00Z",
    authorName: "Auto Insider"
  },
  {
    id: "9",
    headline: "Lockheed Martin Achieves Milestone in Open Mission Systems (OMS)",
    summary: "The latest flight tests demonstrated seamless integration of third-party sensors into an F-35 via the Open Mission Systems standard.",
    sourceUrl: "https://news.lockheedmartin.com/2026-02-oms-milestone",
    topic: "Defense",
    publishedAt: "2026-02-15T12:00:00Z",
    authorName: "Defense News"
  },
  {
    id: "10",
    headline: "Medical Device Manufacturers Pivot to Systems-Based Risk Management",
    summary: "A shift from component-level to system-level risk analysis is helping medical device firms meet stricter EU MDR requirements.",
    sourceUrl: "https://www.medtechdive.com/news/systems-engineering-risk-management-mdr/",
    topic: "Medical",
    publishedAt: "2026-02-10T10:40:00Z",
    authorName: "MedTech Report"
  },
  {
    id: "11",
    headline: "New Open-Source MBSE Tool Gaining Traction in Academic Circles",
    summary: "SysFlow, a new open-source modeling tool designed for education, is being adopted by several top-tier engineering universities.",
    sourceUrl: "https://github.com/sysflow-org/sysflow",
    topic: "MBSE",
    publishedAt: "2026-02-05T15:20:00Z",
    authorName: "Academic SE"
  },
  {
    id: "12",
    headline: "The Rise of the Systems Engineer in Silicon Valley",
    summary: "As software products grow in complexity, tech giants are hiring systems engineers to manage cross-functional dependencies and architectural integrity.",
    sourceUrl: "https://www.wired.com/story/silicon-valley-hiring-systems-engineers/",
    topic: "Careers",
    publishedAt: "2026-01-30T09:00:00Z",
    authorName: "Wired Business"
  },
  {
    id: "13",
    headline: "Cyber-Physical Systems Safety: A New Framework for 2026",
    summary: "Researchers have proposed a new safety-theoretic approach to analyzing autonomous cyber-physical systems under adversarial conditions.",
    sourceUrl: "https://ieeexplore.ieee.org/document/2026-cps-safety",
    topic: "Safety",
    publishedAt: "2026-01-25T14:15:00Z",
    authorName: "IEEE Spectrum"
  },
  {
    id: "14",
    headline: "SpaceX Starship Integration: Lessons in Iterative Systems Engineering",
    summary: "A deep dive into how SpaceX uses rapid prototyping and hardware-in-the-loop testing to accelerate systems integration for the Starship program.",
    sourceUrl: "https://www.space.com/spacex-starship-systems-integration-lessons",
    topic: "Aerospace",
    publishedAt: "2026-01-20T11:45:00Z",
    authorName: "Space Tech"
  },
  {
    id: "15",
    headline: "Digital Twins for Infrastructure: Singapore's Virtual City Model",
    summary: "Singapore has completed its most detailed digital twin to date, allowing systems engineers to simulate the impact of new urban developments on traffic and energy.",
    sourceUrl: "https://www.smartcitiesworld.net/news/singapore-virtual-city-digital-twin",
    topic: "Digital Twin",
    publishedAt: "2026-01-15T13:30:00Z",
    authorName: "Smart City News"
  },
  {
    id: "16",
    headline: "Model-Based Design in Automotive: Reducing Time-to-Market by 25%",
    summary: "A consortium of European automakers reports significant gains from adopting end-to-end model-based design for electric drivetrain development.",
    sourceUrl: "https://www.automotiveworld.com/articles/mbd-automotive-efficiency-2026/",
    topic: "Automotive",
    publishedAt: "2026-01-10T10:10:00Z",
    authorName: "Auto World"
  },
  {
    id: "17",
    headline: "Agile Systems Engineering: Success Stories from the Field",
    summary: "A new whitepaper from INCOSE's Agile SE Working Group highlights successful applications of Scrum and Kanban in hardware development environments.",
    sourceUrl: "https://www.incose.org/resources/agile-se-whitepaper",
    topic: "Agile",
    publishedAt: "2026-01-05T16:00:00Z",
    authorName: "INCOSE Agile"
  },
  {
    id: "18",
    headline: "Requirements Engineering in the Age of LLMs",
    summary: "Exploring how large language models are being used to improve the quality of requirements and detect inconsistencies in large-scale projects.",
    sourceUrl: "https://www.requirements-engineering.org/llm-quality-check/",
    topic: "Requirements",
    publishedAt: "2025-12-20T09:40:00Z",
    authorName: "RE Journal"
  },
  {
    id: "19",
    headline: "Functional Safety Standard for Industrial Robots (ISO 10218:2026)",
    summary: "The updated safety standard for industrial robots introduces new requirements for collaborative operations and AI-driven path planning.",
    sourceUrl: "https://www.iso.org/standard/robot-safety-2026",
    topic: "Safety",
    publishedAt: "2025-12-15T14:50:00Z",
    authorName: "Safety First"
  },
  {
    id: "20",
    headline: "Northrop Grumman's Digital Transformation: A Multi-Year Retrospective",
    summary: "CEO Kathy Warden reflects on the company's shift toward a fully digital engineering environment and its impact on program performance.",
    sourceUrl: "https://news.northropgrumman.com/2025-12-digital-retrospective",
    topic: "Defense",
    publishedAt: "2025-12-10T11:20:00Z",
    authorName: "Defense Executive"
  }
];
