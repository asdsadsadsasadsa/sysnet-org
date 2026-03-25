export type ArtifactType = "template" | "pattern" | "case-study" | "standard-ref" | "tool-guide";

export interface Artifact {
  id: string;
  title: string;
  description: string;
  type: ArtifactType;
  domain: string;
  author: string;
  publishedAt: string;
  downloadUrl: string;
  tags: string[];
}

export const ARTIFACTS: Artifact[] = [
  {
    id: "mbse-sysml-context-template",
    title: "SysML System Context Diagram Template",
    description: "A ready-to-use SysML BDD template for capturing system context, actors, and external interfaces. Includes annotated example with actor stereotypes and flow ports.",
    type: "template",
    domain: "MBSE",
    author: "Maya Chen",
    publishedAt: "2025-11-12",
    downloadUrl: "#",
    tags: ["SysML", "BDD", "Context Diagram", "Capella"]
  },
  {
    id: "mbse-requirements-traceability-matrix",
    title: "Requirements Traceability Matrix (RTM) Template",
    description: "Spreadsheet template for bidirectional requirements traceability from stakeholder needs through system, subsystem, and component requirements to verification events.",
    type: "template",
    domain: "MBSE",
    author: "Ethan Brooks",
    publishedAt: "2025-09-04",
    downloadUrl: "#",
    tags: ["Requirements", "Traceability", "RTM", "DOORS"]
  },
  {
    id: "fmea-template-automotive",
    title: "Design FMEA Template (ISO 26262 aligned)",
    description: "DFMEA worksheet with severity, occurrence, and detection ratings for the automotive domain. Includes action priority (AP) column per the AIAG/VDA 2019 harmonised format.",
    type: "template",
    domain: "Automotive",
    author: "Noah Kim",
    publishedAt: "2025-10-21",
    downloadUrl: "#",
    tags: ["FMEA", "ISO 26262", "Risk Analysis", "Automotive"]
  },
  {
    id: "adr-template",
    title: "Architecture Decision Record (ADR) Template",
    description: "Lightweight Markdown ADR template capturing context, decision drivers, considered options, outcome, and consequences. Includes a worked example from a satellite on-board software project.",
    type: "template",
    domain: "Architecture",
    author: "Rhea Banerjee",
    publishedAt: "2025-08-17",
    downloadUrl: "#",
    tags: ["ADR", "Architecture", "Decision Records", "Documentation"]
  },
  {
    id: "vv-test-plan-template",
    title: "V&V Test Plan Template (IEEE 829)",
    description: "Systems-level test plan skeleton following IEEE 829 structure: test objectives, scope, approach, entry/exit criteria, schedule, and pass/fail criteria.",
    type: "template",
    domain: "Verification",
    author: "Irene Volkov",
    publishedAt: "2025-07-30",
    downloadUrl: "#",
    tags: ["V&V", "Test Plan", "IEEE 829", "Verification"]
  },
  {
    id: "hazard-log-template",
    title: "Hazard Log Template (IEC 61508 / EN 50128)",
    description: "Structured hazard log spreadsheet for tracking identified hazards, causation chains, risk classification, mitigation measures, and residual risk acceptance rationale.",
    type: "template",
    domain: "Safety",
    author: "Noah Kim",
    publishedAt: "2025-12-03",
    downloadUrl: "#",
    tags: ["Hazard Log", "IEC 61508", "Safety", "FMEA"]
  },
  {
    id: "conops-template",
    title: "Concept of Operations (ConOps) Template",
    description: "User-oriented document template describing the operational concept, operational environment, stakeholder needs, and system-level use cases. Based on IEEE 1362.",
    type: "template",
    domain: "Systems Engineering",
    author: "Diego Alvarez",
    publishedAt: "2025-06-14",
    downloadUrl: "#",
    tags: ["ConOps", "IEEE 1362", "Use Cases", "Stakeholders"]
  },
  {
    id: "interface-control-document-template",
    title: "Interface Control Document (ICD) Template",
    description: "ICD template for hardware/software interfaces: interface definitions, signal descriptions, electrical characteristics, timing diagram placeholders, and change log.",
    type: "template",
    domain: "Systems Engineering",
    author: "Omar Rahman",
    publishedAt: "2025-05-28",
    downloadUrl: "#",
    tags: ["ICD", "Interfaces", "Hardware/Software", "Aerospace"]
  },
  {
    id: "trade-study-template",
    title: "Trade Study Template with Weighted Criteria Matrix",
    description: "Structured trade study template with normalised scoring, sensitivity analysis, and decision rationale capture. Includes a worked example for a spacecraft pointing mechanism actuator selection.",
    type: "template",
    domain: "Architecture",
    author: "Rhea Banerjee",
    publishedAt: "2025-12-10",
    downloadUrl: "#",
    tags: ["Trade Study", "Decision Analysis", "Architecture", "Weighted Criteria"]
  },
  {
    id: "digital-twin-architecture-template",
    title: "Digital Twin Architecture Reference Template",
    description: "Architecture reference document covering physical asset layer, communication, data ingestion, twin model, and analytics tiers. Completed example: a pumping station digital twin.",
    type: "template",
    domain: "Digital Twin",
    author: "Ethan Brooks",
    publishedAt: "2025-03-27",
    downloadUrl: "#",
    tags: ["Digital Twin", "Architecture", "IoT", "Reference Architecture"]
  },
  {
    id: "sysml-ibd-pattern",
    title: "SysML Internal Block Diagram Composition Pattern",
    description: "Reusable IBD pattern for hierarchical system decomposition with typed ports and connectors. Demonstrates flow port directionality and proxy port usage in Cameo Systems Modeler.",
    type: "pattern",
    domain: "MBSE",
    author: "Maya Chen",
    publishedAt: "2025-10-08",
    downloadUrl: "#",
    tags: ["SysML", "IBD", "Composition", "Cameo"]
  },
  {
    id: "observer-pattern-embedded",
    title: "Observer Pattern for Embedded Event Systems",
    description: "C implementation of a static observer pattern for resource-constrained embedded systems with no dynamic allocation. Includes an interrupt-safe variant using message queues.",
    type: "pattern",
    domain: "Embedded",
    author: "Omar Rahman",
    publishedAt: "2025-09-19",
    downloadUrl: "#",
    tags: ["Embedded", "C", "Design Patterns", "RTOS"]
  },
  {
    id: "state-machine-pattern-safety",
    title: "Hierarchical State Machine Pattern for Safety-Critical Systems",
    description: "C++ implementation skeleton for HSMs with entry/exit/transition guards, targeting IEC 61508 SIL 2 contexts. Includes unit test harness and coding guideline notes.",
    type: "pattern",
    domain: "Safety",
    author: "Irene Volkov",
    publishedAt: "2025-11-25",
    downloadUrl: "#",
    tags: ["State Machine", "HSM", "Safety-Critical", "C++"]
  },
  {
    id: "digital-twin-sync-pattern",
    title: "Digital Twin State Synchronisation Pattern",
    description: "Pattern for maintaining consistency between a physical asset and its twin, covering event-driven updates, conflict resolution on reconnection, and shadow model design.",
    type: "pattern",
    domain: "Digital Twin",
    author: "Ethan Brooks",
    publishedAt: "2025-08-05",
    downloadUrl: "#",
    tags: ["Digital Twin", "State Sync", "IoT", "Architecture"]
  },
  {
    id: "operational-concept-pattern",
    title: "Operational Concept Decomposition Pattern",
    description: "Pattern for structuring operational scenarios from mission objectives down to operator tasks and system responses. Includes SysML activity diagram template.",
    type: "pattern",
    domain: "Systems Engineering",
    author: "Diego Alvarez",
    publishedAt: "2025-04-03",
    downloadUrl: "#",
    tags: ["ConOps", "Operational Analysis", "SysML", "Activity Diagrams"]
  },
  {
    id: "iso26262-implementation-case-study",
    title: "ISO 26262 Part 6 Implementation — AUTOSAR Classic Case Study",
    description: "Full ASIL-B software development lifecycle on AUTOSAR Classic: safety analysis, design, coding guidelines, unit tests, and integration testing evidence package.",
    type: "case-study",
    domain: "Automotive",
    author: "Noah Kim",
    publishedAt: "2025-07-11",
    downloadUrl: "#",
    tags: ["ISO 26262", "AUTOSAR", "ASIL-B", "Case Study"]
  },
  {
    id: "cubesat-se-case-study",
    title: "3U CubeSat Systems Engineering Case Study",
    description: "End-to-end systems engineering for a 3U CubeSat mission: mission analysis, requirements decomposition, interface definition, V&V planning, and launch lessons.",
    type: "case-study",
    domain: "Space",
    author: "Rhea Banerjee",
    publishedAt: "2025-04-22",
    downloadUrl: "#",
    tags: ["CubeSat", "Space", "Mission Design", "V&V"]
  },
  {
    id: "medical-device-risk-management-case-study",
    title: "ISO 14971 Risk Management — Class IIa Infusion Pump",
    description: "Worked ISO 14971:2019 risk management example for a software-controlled infusion pump: risk management plan, risk assessment, control measures, and residual risk rationale.",
    type: "case-study",
    domain: "Medical",
    author: "Lina Park",
    publishedAt: "2025-06-30",
    downloadUrl: "#",
    tags: ["ISO 14971", "Medical Devices", "Risk Management", "IEC 62304"]
  },
  {
    id: "mbse-transition-case-study",
    title: "MBSE Transition Case Study — Legacy Avionics Programme",
    description: "Two-year programme-level case study moving a legacy avionics programme from Word/Excel to SysML in Cameo. Covers toolchain integration, model governance, and quality improvements.",
    type: "case-study",
    domain: "MBSE",
    author: "Maya Chen",
    publishedAt: "2025-02-14",
    downloadUrl: "#",
    tags: ["MBSE", "Transition", "Avionics", "Cameo"]
  },
  {
    id: "do178c-reference",
    title: "DO-178C Objectives Quick Reference Card",
    description: "Summary of all 71 DO-178C objectives by software level (A-D), with applicable activities, independence requirements, and typical evidence artefacts per objective.",
    type: "standard-ref",
    domain: "Aerospace",
    author: "Rhea Banerjee",
    publishedAt: "2025-03-15",
    downloadUrl: "#",
    tags: ["DO-178C", "Aerospace", "Aviation", "Software Levels"]
  },
  {
    id: "iso26262-asil-decomposition-ref",
    title: "ISO 26262 ASIL Decomposition Reference",
    description: "Reference sheet covering ASIL decomposition rules, dependent failure analysis requirements, and hardware/software ASIL allocation. Includes a worked ASIL-D to ASIL-B + ASIL-B example.",
    type: "standard-ref",
    domain: "Automotive",
    author: "Noah Kim",
    publishedAt: "2025-02-18",
    downloadUrl: "#",
    tags: ["ISO 26262", "ASIL", "Decomposition", "Functional Safety"]
  },
  {
    id: "incose-se-handbook-summary",
    title: "INCOSE SE Handbook v5 — Process Summary Reference",
    description: "Condensed reference of INCOSE SE Handbook v5 technical processes: inputs, outputs, and key activities from stakeholder needs through operations and maintenance.",
    type: "standard-ref",
    domain: "Systems Engineering",
    author: "Diego Alvarez",
    publishedAt: "2025-01-09",
    downloadUrl: "#",
    tags: ["INCOSE", "SE Handbook", "Processes", "ISO/IEC 15288"]
  },
  {
    id: "iec61508-sil-determination-ref",
    title: "IEC 61508 SIL Determination Reference",
    description: "Reference card for SIL determination via risk graph, LOPA, and consequence/likelihood matrix. Includes mapping between SIL and probability of failure on demand (PFD).",
    type: "standard-ref",
    domain: "Safety",
    author: "Irene Volkov",
    publishedAt: "2025-05-07",
    downloadUrl: "#",
    tags: ["IEC 61508", "SIL", "LOPA", "Risk Graph"]
  },
  {
    id: "ecss-space-standards-ref",
    title: "ECSS Space Engineering Standards Overview",
    description: "Reference guide to ECSS engineering standards: document hierarchy, applicable standards by mission phase, and mapping to NASA NPR equivalents.",
    type: "standard-ref",
    domain: "Space",
    author: "Rhea Banerjee",
    publishedAt: "2025-09-30",
    downloadUrl: "#",
    tags: ["ECSS", "Space", "Standards", "ESA"]
  },
  {
    id: "capella-getting-started-guide",
    title: "Capella Workbench Getting Started Guide",
    description: "Practical guide to Eclipse Capella: installation, workspace setup, Operational Analysis layer, System Analysis, and first model walkthrough.",
    type: "tool-guide",
    domain: "MBSE",
    author: "Maya Chen",
    publishedAt: "2025-10-01",
    downloadUrl: "#",
    tags: ["Capella", "MBSE", "Tutorial", "Eclipse"]
  },
  {
    id: "ros2-systems-engineering-guide",
    title: "ROS 2 for Systems Engineers — Architecture Guide",
    description: "ROS 2 from a systems engineering perspective: node decomposition, interface definition via IDL, QoS policies, lifecycle management, and integration testing with ros2_launch.",
    type: "tool-guide",
    domain: "Robotics",
    author: "Diego Alvarez",
    publishedAt: "2025-08-29",
    downloadUrl: "#",
    tags: ["ROS 2", "Robotics", "Architecture", "DDS"]
  },
  {
    id: "doors-next-requirements-guide",
    title: "DOORS Next — Requirements Authoring Best Practices",
    description: "Practical guide to structured requirements authoring in IBM DOORS Next: module configuration, link types, baseline management, view definitions, and export.",
    type: "tool-guide",
    domain: "MBSE",
    author: "Ethan Brooks",
    publishedAt: "2025-07-03",
    downloadUrl: "#",
    tags: ["DOORS", "Requirements", "IBM", "MBSE"]
  },
  {
    id: "matlab-simulink-hil-guide",
    title: "Simulink Hardware-in-the-Loop Testing Guide",
    description: "Step-by-step guide to HiL testing with MATLAB/Simulink and dSPACE SCALEXIO: model preparation, I/O mapping, test automation with EXAM, and coverage measurement.",
    type: "tool-guide",
    domain: "Embedded",
    author: "Omar Rahman",
    publishedAt: "2025-09-12",
    downloadUrl: "#",
    tags: ["Simulink", "HiL", "dSPACE", "Embedded Testing"]
  },
  {
    id: "enterprise-architect-sysml-guide",
    title: "Enterprise Architect SysML Profile Setup Guide",
    description: "Configuration guide for SysML modelling in Sparx EA: profile import, diagram toolbox customisation, MDG technologies, and generating reports from SysML models.",
    type: "tool-guide",
    domain: "MBSE",
    author: "Maya Chen",
    publishedAt: "2025-06-22",
    downloadUrl: "#",
    tags: ["Enterprise Architect", "SysML", "Sparx", "MBSE"]
  },
  {
    id: "vv-coverage-analysis-guide",
    title: "Requirements Coverage Analysis — Tools and Techniques",
    description: "Guide to measuring and improving requirements coverage: mapping to test cases, identifying gaps, and reporting metrics for a DO-178C DAL-B project.",
    type: "tool-guide",
    domain: "Verification",
    author: "Irene Volkov",
    publishedAt: "2025-11-08",
    downloadUrl: "#",
    tags: ["Coverage", "V&V", "Requirements", "DO-178C"]
  }
];

export const ARTIFACT_TYPES: { value: ArtifactType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "template", label: "Template" },
  { value: "pattern", label: "Pattern" },
  { value: "case-study", label: "Case Study" },
  { value: "standard-ref", label: "Standard Reference" },
  { value: "tool-guide", label: "Tool Guide" },
];

export const ARTIFACT_DOMAINS = [
  "",
  "MBSE",
  "Systems Engineering",
  "Architecture",
  "Safety",
  "Verification",
  "Automotive",
  "Aerospace",
  "Embedded",
  "Medical",
  "Robotics",
  "Digital Twin",
  "Space",
];

export const TYPE_LABELS: Record<ArtifactType, string> = {
  template: "Template",
  pattern: "Pattern",
  "case-study": "Case Study",
  "standard-ref": "Standard Ref",
  "tool-guide": "Tool Guide",
};

export const TYPE_COLORS: Record<ArtifactType, string> = {
  template: "bg-blue-50 text-blue-700 border-blue-200",
  pattern: "bg-violet-50 text-violet-700 border-violet-200",
  "case-study": "bg-amber-50 text-amber-700 border-amber-200",
  "standard-ref": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "tool-guide": "bg-slate-100 text-slate-700 border-slate-200",
};
