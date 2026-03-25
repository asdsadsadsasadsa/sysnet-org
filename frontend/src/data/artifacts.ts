export interface Artifact {
  id: string;
  title: string;
  abstract: string;
  artifact_type: 'paper' | 'spec' | 'standards-summary' | 'reference-design' | 'case-study';
  group_slug: string;
  tags: string[];
  author_handle: string;
  published_year: number;
  external_url?: string;
}

export const ARTIFACTS: Artifact[] = [
  {
    id: "art-001",
    title: "Formal Verification of Distributed Consensus in Embedded Systems",
    abstract: "This paper presents a rigorous formal verification approach for distributed consensus algorithms operating under strict timing constraints in embedded environments. We utilize TLA+ to model-check safety and liveness properties, specifically focusing on the Raft protocol implementation in low-power microcontrollers.",
    artifact_type: "paper",
    group_slug: "embedded",
    tags: ["Formal Methods", "TLA+", "Consensus"],
    author_handle: "j_systems",
    published_year: 2025
  },
  {
    id: "art-002",
    title: "SysML v2 Language Profile Reference for Aerospace Avionics",
    abstract: "A comprehensive reference guide for applying SysML v2 to aerospace avionics architecture. This specification defines standard stereotypes, value types, and modeling patterns optimized for ARINC 653 partitioned environments.",
    artifact_type: "spec",
    group_slug: "aerospace",
    tags: ["SysML v2", "Avionics", "ARINC 653"],
    author_handle: "orbit_admin",
    published_year: 2026
  },
  {
    id: "art-003",
    title: "ISO 26262:2018 Functional Safety Summary for Software Engineers",
    abstract: "An executive summary of the ISO 26262:2018 standard, specifically Part 6: Product development at the software level. This document highlights key requirements for ASIL-D software components and verification methods.",
    artifact_type: "standards-summary",
    group_slug: "automotive",
    tags: ["ISO 26262", "ASIL", "Functional Safety"],
    author_handle: "safe_drive",
    published_year: 2024
  },
  {
    id: "art-004",
    title: "Reference Design: High-Availability Edge Gateway for Industrial IoT",
    abstract: "A detailed reference architecture for an industrial edge gateway capable of 99.999% availability. Includes block diagrams, hardware selection criteria, and software stack recommendations for redundancy management.",
    artifact_type: "reference-design",
    group_slug: "robotics",
    tags: ["IIoT", "High Availability", "Edge Computing"],
    author_handle: "factory_auto",
    published_year: 2025
  },
  {
    id: "art-005",
    title: "Case Study: Transitioning to MBSE in a Legacy Medical Device Firm",
    abstract: "A deep dive into the 2-year journey of a Tier-1 medical device manufacturer as they moved from document-centric requirements management to a full MBSE approach using Capella. Lessons learned in culture shift and tool integration.",
    artifact_type: "case-study",
    group_slug: "medical",
    tags: ["MBSE", "Transformation", "Capella"],
    author_handle: "med_dev_lead",
    published_year: 2025
  },
  {
    id: "art-006",
    title: "Microservices Decomposition Patterns for Highly Regulated Systems",
    abstract: "This paper explores architectural patterns for decomposing monolithic systems in highly regulated domains. We propose a 'Regulatory-First' boundary definition that isolates safety-critical logic from non-critical services.",
    artifact_type: "paper",
    group_slug: "software-architecture",
    tags: ["Microservices", "Regulated Systems", "Decomposition"],
    author_handle: "arch_guru",
    published_year: 2026
  },
  {
    id: "art-007",
    title: "FMEA Workbench: A Standardized Template for Reliability Analysis",
    abstract: "A standardized template and workflow for conducting Failure Mode and Effects Analysis (FMEA) in complex systems. Includes Risk Priority Number (RPN) calculation models and mitigation tracking schemas.",
    artifact_type: "spec",
    group_slug: "reliability",
    tags: ["FMEA", "Reliability", "Risk"],
    author_handle: "uptime_expert",
    published_year: 2025
  },
  {
    id: "art-008",
    title: "Digital Twin Synchronization Protocols: A Comparative Analysis",
    abstract: "This study compares different protocols for synchronizing physical asset data with its digital twin. We evaluate MQTT, OPC UA, and DDS in terms of latency, bandwidth efficiency, and state consistency.",
    artifact_type: "paper",
    group_slug: "digital-twin",
    tags: ["Digital Twin", "MQTT", "OPC UA"],
    author_handle: "sim_master",
    published_year: 2026
  },
  {
    id: "art-009",
    title: "ISO/IEC 42010 Architecture Description Framework Implementation",
    abstract: "A guide to implementing the ISO/IEC 42010 standard within a corporate architecture practice. Defines the structure of Architecture Descriptions, Viewpoints, and Stakeholder mapping.",
    artifact_type: "standards-summary",
    group_slug: "standards",
    tags: ["ISO 42010", "Architecture", "Framework"],
    author_handle: "standard_bear",
    published_year: 2024
  },
  {
    id: "art-010",
    title: "Scalable Sensor Fusion Architecture for Level 4 Autonomous Vehicles",
    abstract: "A reference design for a modular sensor fusion engine supporting Lidar, Radar, and Camera inputs. Focuses on late-fusion strategies and uncertainty estimation in dynamic environments.",
    artifact_type: "reference-design",
    group_slug: "automotive",
    tags: ["Sensor Fusion", "Autonomous", "Lidar"],
    author_handle: "auto_pilot",
    published_year: 2025
  },
  {
    id: "art-011",
    title: "Probabilistic Risk Assessment in Space Mission Planning",
    abstract: "Explores the application of Bayesian networks to quantify risk in complex space missions. Includes a case study on orbital insertion maneuvers for deep-space probes.",
    artifact_type: "paper",
    group_slug: "aerospace",
    tags: ["Risk Assessment", "Bayesian", "Space"],
    author_handle: "mars_rover",
    published_year: 2025
  },
  {
    id: "art-012",
    title: "MBSE Pattern Catalog v1.4: Common System Interactions",
    abstract: "A curated catalog of 25 MBSE patterns for modeling common system interactions, such as master-slave synchronization, heartbeat monitors, and circuit breakers.",
    artifact_type: "spec",
    group_slug: "mbse",
    tags: ["Patterns", "MBSE", "Modeling"],
    author_handle: "model_pro",
    published_year: 2026
  },
  {
    id: "art-013",
    title: "IEC 62304 Compliance Guide for Agile Software Teams",
    abstract: "Practical strategies for maintaining IEC 62304 compliance while using Agile and DevOps methodologies. Focuses on automated documentation and continuous verification.",
    artifact_type: "standards-summary",
    group_slug: "medical",
    tags: ["IEC 62304", "Agile", "DevOps"],
    author_handle: "agile_med",
    published_year: 2025
  },
  {
    id: "art-014",
    title: "Real-Time Scheduling for Multicore Embedded Systems",
    abstract: "Technical paper discussing partitioning and scheduling strategies for RTOS on multicore SoCs. Addresses the challenges of shared resource contention and cache interference.",
    artifact_type: "paper",
    group_slug: "embedded",
    tags: ["RTOS", "Multicore", "Scheduling"],
    author_handle: "kern_dev",
    published_year: 2026
  },
  {
    id: "art-015",
    title: "Reference Design: Modular Cobot Controller Architecture",
    abstract: "Architecture blueprint for a collaborative robot (cobot) controller focusing on safety-rated monitored stop (SMS) and power/force limiting (PFL) functions.",
    artifact_type: "reference-design",
    group_slug: "robotics",
    tags: ["Cobots", "Safety", "Control"],
    author_handle: "robot_safety",
    published_year: 2025
  },
  {
    id: "art-016",
    title: "AUTOSAR Adaptive Platform Architecture Overview",
    abstract: "An introduction to the AUTOSAR Adaptive Platform for high-performance computing in vehicles. Covers service-oriented communication (SOME/IP) and POSIX-based operating systems.",
    artifact_type: "standards-summary",
    group_slug: "automotive",
    tags: ["AUTOSAR", "Adaptive", "SOME/IP"],
    author_handle: "sdv_dev",
    published_year: 2025
  },
  {
    id: "art-017",
    title: "Evaluating FMI 3.0 for Cross-Domain Co-Simulation",
    abstract: "A performance study evaluating the Functional Mock-up Interface (FMI) 3.0 standard for large-scale co-simulation between thermal, mechanical, and control models.",
    artifact_type: "paper",
    group_slug: "digital-twin",
    tags: ["FMI", "Co-simulation", "Modelica"],
    author_handle: "sim_scientist",
    published_year: 2026
  },
  {
    id: "art-018",
    title: "Architecture Decision Records (ADR) Standard for Large Projects",
    abstract: "This specification defines a standardized format and governance process for recording architecture decisions in projects with over 50 engineers.",
    artifact_type: "spec",
    group_slug: "software-architecture",
    tags: ["ADRs", "Governance", "Architecture"],
    author_handle: "cto_office",
    published_year: 2024
  },
  {
    id: "art-019",
    title: "FTA in Practice: Analyzing Common Mode Failures in Avionics",
    abstract: "A case study on using Fault Tree Analysis (FTA) to identify and mitigate common mode failures in redundant avionics systems.",
    artifact_type: "case-study",
    group_slug: "reliability",
    tags: ["FTA", "Avionics", "Redundancy"],
    author_handle: "safe_sky",
    published_year: 2025
  },
  {
    id: "art-020",
    title: "INCOSE Systems Engineering Handbook v5 Summary",
    abstract: "A condensed version of the latest INCOSE handbook, focusing on the new lifecycle processes and the integration of Agile Systems Engineering.",
    artifact_type: "standards-summary",
    group_slug: "standards",
    tags: ["INCOSE", "Lifecycle", "Handbook"],
    author_handle: "systems_thinker",
    published_year: 2024
  },
  {
    id: "art-021",
    title: "Deep Reinforcement Learning for Dynamic Path Planning",
    abstract: "Research paper on using DRL for autonomous navigation in unpredictable environments. Proposes a new reward function that prioritizes safety over speed.",
    artifact_type: "paper",
    group_slug: "robotics",
    tags: ["DRL", "Path Planning", "AI"],
    author_handle: "ai_bot",
    published_year: 2026
  },
  {
    id: "art-022",
    title: "Reference Design: Low-Power LoRaWAN Sensor Node",
    abstract: "Hardware and software reference design for a LoRaWAN node capable of 5+ years of battery life. Includes PCB layout and energy-aware firmware patterns.",
    artifact_type: "reference-design",
    group_slug: "embedded",
    tags: ["LoRaWAN", "Low Power", "IoT"],
    author_handle: "iot_pioneer",
    published_year: 2025
  },
  {
    id: "art-023",
    title: "DO-178C Tool Qualification Strategy for Modern Compilers",
    abstract: "A comprehensive strategy for qualifying modern LLVM-based compilers for use in DAL-A aerospace software development.",
    artifact_type: "spec",
    group_slug: "aerospace",
    tags: ["DO-178C", "LLVM", "Qualification"],
    author_handle: "aero_coder",
    published_year: 2026
  },
  {
    id: "art-024",
    title: "Predictive Maintenance using LSTM Networks in Railway Systems",
    abstract: "Case study on deploying Long Short-Term Memory (LSTM) networks to predict wheelset failures in high-speed rail networks.",
    artifact_type: "case-study",
    group_slug: "reliability",
    tags: ["LSTM", "Predictive Maintenance", "Rail"],
    author_handle: "train_brain",
    published_year: 2025
  },
  {
    id: "art-025",
    title: "System Decomposition for Cybersecurity: A Zero-Trust Approach",
    abstract: "Explores how to decompose complex systems into 'Security Domains' to implement Zero-Trust principles at the architecture level.",
    artifact_type: "paper",
    group_slug: "software-architecture",
    tags: ["Cybersecurity", "Zero Trust", "Decomposition"],
    author_handle: "secure_arch",
    published_year: 2026
  },
  {
    id: "art-026",
    title: "Physics-Based Modeling of Battery Degradation for Digital Twins",
    abstract: "A technical specification for modeling Li-ion battery chemistry within a vehicle's digital twin to predict State-of-Health (SoH).",
    artifact_type: "spec",
    group_slug: "digital-twin",
    tags: ["Battery", "Physics Modeling", "SoH"],
    author_handle: "energy_sim",
    published_year: 2025
  },
  {
    id: "art-027",
    title: "IEEE 829 Software Test Documentation Summary",
    abstract: "A quick-reference guide to the IEEE 829 standard for software test documentation, covering Test Plans, Designs, and Summary Reports.",
    artifact_type: "standards-summary",
    group_slug: "standards",
    tags: ["IEEE 829", "Testing", "Documentation"],
    author_handle: "test_lead",
    published_year: 2024
  },
  {
    id: "art-028",
    title: "Model-Based Safety Analysis (MBSA) with SysML and AltaRica",
    abstract: "This paper proposes an integrated workflow for performing safety analysis directly on SysML models using the AltaRica language.",
    artifact_type: "paper",
    group_slug: "mbse",
    tags: ["MBSA", "SysML", "AltaRica"],
    author_handle: "safety_first",
    published_year: 2026
  },
  {
    id: "art-029",
    title: "Reference Design: Wearable Vital Sign Monitor",
    abstract: "Design for a Class II medical wearable. Includes sensor selection (ECG, SpO2), Bluetooth LE stack, and ISO 14971 risk file snippets.",
    artifact_type: "reference-design",
    group_slug: "medical",
    tags: ["Wearable", "ECG", "ISO 14971"],
    author_handle: "health_tech",
    published_year: 2025
  },
  {
    id: "art-030",
    title: "Scaling Systems Engineering in Startups: A Lean Case Study",
    abstract: "Observations on how to apply 'Just-Enough' Systems Engineering in fast-growing technology startups without stifling innovation.",
    artifact_type: "case-study",
    group_slug: "standards",
    tags: ["Lean", "Startup", "Scaling"],
    author_handle: "lean_lead",
    published_year: 2026
  }
];
