export interface Group {
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  tags: string[];
  resources: { title: string; url: string }[];
}

export const GROUP_META: Record<string, Group> = {
  mbse: {
    slug: "mbse",
    name: "Model-Based Systems Engineering",
    description: "SysML, Capella, DOORS, and the transition from documents to models.",
    memberCount: 1240,
    postCount: 450,
    tags: ["SysML", "Capella", "DOORS", "MBSE"],
    resources: [
      { title: "OMG SysML Specification", url: "https://www.omg.org/spec/SysML/" },
      { title: "INCOSE MBSE Guide", url: "https://www.incose.org/incose-member-resources/working-groups/transformational/mbse-initiative" },
      { title: "Capella Workbench", url: "https://www.eclipse.org/capella/" }
    ]
  },
  aerospace: {
    slug: "aerospace",
    name: "Aerospace & Defense",
    description: "Safety-critical systems, DO-178C, and mission planning.",
    memberCount: 890,
    postCount: 310,
    tags: ["DO-178C", "ARP4754A", "MIL-STD-882E"],
    resources: [
      { title: "FAA DO-178C Resource", url: "https://www.faa.gov/" },
      { title: "NASA Systems Engineering Handbook", url: "https://www.nasa.gov/connect/ebooks/nasa-systems-engineering-handbook/" }
    ]
  },
  embedded: {
    slug: "embedded",
    name: "Embedded Systems",
    description: "Hardware/software integration, RTOS, and physical interfaces.",
    memberCount: 1560,
    postCount: 620,
    tags: ["RTOS", "C/C++", "FPGA", "HAL"],
    resources: [
      { title: "FreeRTOS Documentation", url: "https://www.freertos.org/" },
      { title: "Embedded Systems Conference", url: "https://www.embeddedconf.com/" }
    ]
  },
  medical: {
    slug: "medical",
    name: "Medical Devices",
    description: "Regulated environments, risk management, and ISO 13485.",
    memberCount: 640,
    postCount: 180,
    tags: ["ISO 13485", "IEC 62304", "Risk Management"],
    resources: [
      { title: "ISO 13485 Standard", url: "https://www.iso.org/standard/59752.html" },
      { title: "FDA Software as a Medical Device", url: "https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd" }
    ]
  },
  robotics: {
    slug: "robotics",
    name: "Robotics & Autonomy",
    description: "Perception, planning, safety envelopes, and sensor fusion.",
    memberCount: 1100,
    postCount: 420,
    tags: ["ROS 2", "SLAM", "Control Systems"],
    resources: [
      { title: "ROS 2 Documentation", url: "https://docs.ros.org/" },
      { title: "IEEE Robotics & Automation Society", url: "https://www.ieee-ras.org/" }
    ]
  },
  safety: {
    slug: "safety",
    name: "Functional Safety",
    description: "Functional safety, fault analysis, FMEA, and hazard identification across domains.",
    memberCount: 760,
    postCount: 240,
    tags: ["IEC 61508", "FMEA", "FTA", "Hazard Analysis"],
    resources: [
      { title: "IEC 61508 Overview", url: "https://www.iec.ch/functionalsafety/" },
      { title: "MISRA Guidelines", url: "https://www.misra.org.uk/" }
    ]
  },
  verification: {
    slug: "verification",
    name: "Verification & Validation",
    description: "V&V methods, test planning, coverage analysis, and requirements traceability.",
    memberCount: 830,
    postCount: 290,
    tags: ["V&V", "Test Planning", "Requirements Traceability"],
    resources: [
      { title: "INCOSE Verification Guide", url: "https://www.incose.org/" },
      { title: "IEEE 829 Test Documentation", url: "https://standards.ieee.org/" }
    ]
  },
  automotive: {
    slug: "automotive",
    name: "Automotive Systems",
    description: "ISO 26262, AUTOSAR, SOTIF, and vehicle systems architecture.",
    memberCount: 980,
    postCount: 290,
    tags: ["ISO 26262", "AUTOSAR", "SOTIF"],
    resources: [
      { title: "ISO 26262 Functional Safety", url: "https://www.iso.org/standard/68383.html" },
      { title: "AUTOSAR Standard", url: "https://www.autosar.org/" }
    ]
  },
  standards: {
    slug: "standards",
    name: "Standards & Governance",
    description: "IEEE, ISO, INCOSE standards review, discussion, and implementation guidance.",
    memberCount: 450,
    postCount: 120,
    tags: ["IEEE", "ISO", "INCOSE"],
    resources: [
      { title: "ISO/IEC/IEEE 42010", url: "http://www.iso-architecture.org/42010/" },
      { title: "NIST Systems Engineering", url: "https://www.nist.gov/" }
    ]
  },
  "digital-twin": {
    slug: "digital-twin",
    name: "Digital Twin",
    description: "Digital twin architectures, model fidelity, and live system integration.",
    memberCount: 730,
    postCount: 210,
    tags: ["Digital Twin", "Co-simulation", "FMI/FMU"],
    resources: [
      { title: "Digital Twin Consortium", url: "https://www.digitaltwinconsortium.org/" },
      { title: "Modelica Association", url: "https://modelica.org/" }
    ]
  },
  architecture: {
    slug: "architecture",
    name: "System Architecture",
    description: "System architecture methods, patterns, trade studies, and decision records.",
    memberCount: 1340,
    postCount: 510,
    tags: ["ADRs", "Trade Studies", "TOGAF", "Patterns"],
    resources: [
      { title: "Architecture Decision Records", url: "https://adr.github.io/" },
      { title: "The Open Group (TOGAF)", url: "https://www.opengroup.org/togaf" }
    ]
  },
  space: {
    slug: "space",
    name: "Space Systems",
    description: "Space systems engineering, mission design, CubeSat, and on-orbit operations.",
    memberCount: 580,
    postCount: 160,
    tags: ["CubeSat", "Mission Design", "On-Orbit", "ECSS"],
    resources: [
      { title: "NASA Systems Engineering Handbook", url: "https://www.nasa.gov/connect/ebooks/nasa-systems-engineering-handbook/" },
      { title: "ECSS Standards", url: "https://ecss.nl/" }
    ]
  }
};

export const GROUPS = Object.values(GROUP_META);
