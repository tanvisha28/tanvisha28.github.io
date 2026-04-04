/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProfileSlug = "dataengineer" | "softwareengineer" | "datascientist" | "datanalyst";
export type ProjectType = "AI" | "DE" | "DS";
export type ProjectIcon = "trend" | "pipeline" | "monitoring" | "application" | "translation" | "risk";

export interface ProjectDecision {
  title: string;
  detail: string;
}

export interface ProjectImpactMetric {
  label: string;
  value: string;
  detail: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  typeLabel: string;
  icon: ProjectIcon;
  summary: string;
  role: string;
  domain: string;
  techStack: string[];
  problem: string;
  context: string;
  stakes: string;
  ownership: string[];
  goals: string[];
  architecture: string;
  implementation: string[];
  decisions: ProjectDecision[];
  flow: string;
  challenges: string[];
  impactMetrics: ProjectImpactMetric[];
  outcomes: string[];
  lessons: string[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string[];
  skills: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  location: string;
  details: string[];
}

export interface SectionIntro {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ContactSectionCopy extends SectionIntro {
  chips: string[];
  reachLabel: string;
}

export interface PortfolioData {
  personal: {
    name: string;
    headline: string;
    about: string[];
    focusAreas: string[];
    email: string;
    linkedin: string;
    github: string;
    resume: string;
    location: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  sectionCopy: {
    about: {
      eyebrow: string;
      title: string;
      impactLabel: string;
      focusLabel: string;
    };
    skills: SectionIntro;
    projects: SectionIntro;
    experience: SectionIntro;
    education: SectionIntro;
    contact: ContactSectionCopy;
  };
  footer: {
    tagline: string;
  };
}

export const profileSlugs: ProfileSlug[] = ["dataengineer", "softwareengineer", "datascientist", "datanalyst"];
export const defaultProfileSlug: ProfileSlug = "dataengineer";

const basePublicPath =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

function withPublicAsset(path: string) {
  const normalizedBase = basePublicPath.endsWith("/") ? basePublicPath : `${basePublicPath}/`;
  return `${normalizedBase}${path.replace(/ /g, "%20")}`;
}

export function isProfileSlug(value: string | undefined): value is ProfileSlug {
  return Boolean(value && profileSlugs.includes(value as ProfileSlug));
}

const sharedIdentity = {
  name: "Tanvisha Kose",
  email: "tankose411@gmail.com",
  linkedin: "https://www.linkedin.com/in/tanvisha-kose411/",
  github: "https://github.com/tanvisha28",
  location: "New Brunswick, NJ",
};

const sharedEducation: Education[] = [
  {
    school: "Rutgers University - New Brunswick",
    degree: "Master of Science in Data Science",
    period: "Sep 2024 - May 2026",
    location: "New Brunswick, USA",
    details: [
      "GPA: 3.5",
      "Coursework: Regression & Time Series, Probability & Statistics, Advanced Database Management, Data Wrangling, Financial Data Mining",
    ],
  },
  {
    school: "Ramrao Adik Institute of Technology",
    degree: "Bachelor of Engineering in Electronics",
    period: "Aug 2019 - May 2023",
    location: "Mumbai, India",
    details: ["GPA: 3.87"],
  },
];

const dataEngineerProfile: PortfolioData = {
  personal: {
    ...sharedIdentity,
    headline: "Data Engineer | Cloud ETL Platforms | Warehousing & Reliability",
    about: [
      "I build production data platforms that turn fragmented operational signals into governed, analytics-ready datasets on AWS and Azure.",
      "My work centers on ETL and ELT pipelines, orchestration, warehousing, and data quality, with an emphasis on dependable delivery instead of one-off analysis.",
      "Across manufacturing systems, research data, and forecasting workflows, I focus on platform decisions that make downstream reporting and model work easier to trust.",
    ],
    focusAreas: [
      "ETL and ELT pipelines",
      "Cloud orchestration",
      "Warehousing and governance",
      "Reliability and monitoring",
    ],
    resume: withPublicAsset("resume.pdf"),
  },
  metrics: [
    { label: "Industry Experience", value: "1+ Years" },
    { label: "Flight Records", value: "2.15M+" },
    { label: "Reaction Markers", value: "15" },
    { label: "Forecast Lift", value: "+15%" },
  ],
  skills: [
    {
      category: "Programming & Databases",
      skills: ["Python", "SQL", "NoSQL", "Scala", "Java", "REST APIs"],
    },
    {
      category: "Cloud & Orchestration",
      skills: ["AWS", "Azure Data Factory", "Airflow", "Step Functions", "Azure DevOps", "GitHub Actions"],
    },
    {
      category: "Warehousing & Streaming",
      skills: ["Databricks", "PySpark", "Snowflake", "Redshift", "Kafka", "Kinesis"],
    },
    {
      category: "Governance & Delivery",
      skills: ["dbt", "Data Quality Rules", "Metadata Management", "Audit Checks", "Power BI", "Tableau"],
    },
  ],
  projects: [
    {
      id: "agentic-orchestrator",
      title: "Market Signal Forecasting Data Pipeline",
      type: "DE",
      typeLabel: "Data Engineering",
      icon: "trend",
      summary: "A repeatable ingestion and transformation pipeline that combined market indicators with Reddit and NYT sentiment feeds into a validated forecasting dataset for downstream analysis.",
      role: "Data Engineering Graduate Project",
      domain: "Financial Forecasting / Data Pipeline",
      techStack: ["Python", "SQL", "Reddit API", "NYT API", "Plotly", "Walk-Forward Testing"],
      problem: "Forecasting inputs lived across disconnected market, indicator, and sentiment sources, making feature preparation slow, inconsistent, and hard to validate before analysis.",
      context: "Adapted from the Tesla forecasting project on the data engineering resume to emphasize ingestion design, transformation reliability, and monitored dataset delivery rather than model tuning alone.",
      stakes: "If the dataset assembly stayed manual, every forecasting run would inherit inconsistent source timing, weak lineage, and unclear validation, which would make any downstream signal analysis harder to trust.",
      ownership: [
        "Defined the ingestion boundaries for market history, technical indicators, and external sentiment feeds.",
        "Built the validation-first transformation path that turned raw source pulls into a forecast-ready feature layer.",
        "Packaged the outputs into dashboard-friendly views so the same pipeline served both analysis and stakeholder review.",
      ],
      goals: [
        "Automate ingestion across price history, technical indicators, and external sentiment sources.",
        "Add validation and monitoring so feature datasets could be trusted before forecasting work began.",
        "Package the output in a format suitable for both stakeholder dashboards and repeatable analytical experiments.",
      ],
      architecture: "A multi-source ingestion workflow collecting market data plus Reddit and New York Times sentiment, transforming them into a unified feature layer with validation checkpoints and dashboard-ready outputs.",
      implementation: [
        "Built ingestion and transformation logic in Python and SQL to merge market indicators with sentiment data from Reddit and NYT APIs.",
        "Added walk-forward validation checks and pipeline monitoring so data quality issues surfaced before forecast experiments consumed the dataset.",
        "Published the resulting signals into Plotly dashboards that exposed both market trends and pipeline quality indicators for broader review.",
      ],
      decisions: [
        {
          title: "Validation before modeling",
          detail: "Placed validation checkpoints inside the dataset pipeline rather than after model training so feature issues were caught before they polluted downstream experiments.",
        },
        {
          title: "Source cadence alignment",
          detail: "Aligned sentiment pulls to market intervals instead of treating external feeds as free-form text inputs, which kept the engineered features analytically comparable over time.",
        },
        {
          title: "Dual-use delivery",
          detail: "Published the output in a form that worked for both technical forecasting experiments and stakeholder-facing dashboards so the pipeline did not fork into separate reporting logic.",
        },
      ],
      flow: "Market Data + Sentiment APIs -> Ingestion & Validation -> Feature Layer -> Forecast-Ready Dataset -> Plotly Dashboards",
      challenges: [
        "Aligning sentiment collection windows with market intervals so engineered features remained analytically meaningful.",
        "Keeping the pipeline reproducible while handling different source refresh cadences and validation steps.",
      ],
      impactMetrics: [
        {
          label: "Source Footprint",
          value: "3 feeds",
          detail: "Unified market, Reddit, and New York Times signals inside one monitored ingestion path.",
        },
        {
          label: "Delivery Focus",
          value: "Validation-first",
          detail: "Checks were embedded in the pipeline before forecasting workflows consumed the dataset.",
        },
        {
          label: "Output Shape",
          value: "Dashboard-ready",
          detail: "The same pipeline produced analyst-friendly features and review-friendly signal views.",
        },
      ],
      outcomes: [
        "Replaced ad hoc dataset assembly with a reusable, validated forecasting data pipeline.",
        "Made multi-source feature preparation easier to audit and rerun as new market data arrived.",
        "Delivered dashboard views that exposed data quality and signal behavior to technical and non-technical audiences.",
      ],
      lessons: [
        "Forecasting teams move faster when feature pipelines are explicit, monitored, and easy to rerun.",
        "Validation has to be part of ingestion design, not bolted on after the dataset is already consumed.",
      ],
    },
    {
      id: "lakehouse-platform",
      title: "Manufacturing Telemetry Lakehouse",
      type: "DE",
      typeLabel: "Data Engineering",
      icon: "pipeline",
      summary: "AWS and Databricks data platform that unified telemetry, ERP, and finance data into Bronze, Silver, and Gold layers for plant reporting and operational analytics.",
      role: "Data Engineer",
      domain: "Manufacturing Analytics / Data Platform",
      techStack: ["Python", "SQL", "AWS", "Databricks", "Airflow", "Snowflake"],
      problem: "Operational telemetry, ERP records, and finance data lived in separate systems, which slowed reporting and reduced trust in shared performance metrics.",
      context: "Built from the Sonaflex data engineer experience to center the platform work: ETL and ELT on AWS, layered warehousing, and production-grade pipeline reliability.",
      stakes: "Without a shared platform layer, every plant and business review depended on delayed extracts, inconsistent definitions, and fragile reporting logic that could not scale across operations and finance.",
      ownership: [
        "Built the ingestion and transformation path that connected telemetry, ERP, and finance datasets into one platform.",
        "Owned the medallion-style warehouse progression from raw landing zones to curated consumption models.",
        "Added the monitoring, testing, and quality controls that made the platform dependable for recurring operational use.",
      ],
      goals: [
        "Unify batch and near-real-time ingestion across machine, ERP, and business systems.",
        "Create Bronze, Silver, and Gold models that standardized downstream reporting inputs.",
        "Increase production trust through testing, quality checks, and monitoring.",
      ],
      architecture: "AWS ingestion and Databricks transformation stack moving source data through layered models before publishing curated warehouse tables in Snowflake and Redshift for reporting consumption.",
      implementation: [
        "Built ETL and ELT pipelines with Python, SQL, S3, Glue, Databricks, Airflow, and PySpark to centralize telemetry, ERP, and financial datasets.",
        "Designed Bronze, Silver, and Gold layers plus curated warehouse models in Snowflake and Redshift to standardize schemas and analytics readiness.",
        "Implemented data quality checks, automated testing, and monitoring to reduce failures and simplify troubleshooting in production.",
      ],
      decisions: [
        {
          title: "Layered warehouse contract",
          detail: "Used Bronze, Silver, and Gold boundaries so raw ingestion, standardized transformation, and business-facing consumption each had clear ownership and quality expectations.",
        },
        {
          title: "Mixed-latency design",
          detail: "Balanced batch and near-real-time source handling inside one platform instead of forcing all systems into a single refresh cadence that would underserve operations.",
        },
        {
          title: "Observability as adoption work",
          detail: "Treated testing and monitoring as product features for the platform because downstream teams would not rely on the data without visible quality signals.",
        },
      ],
      flow: "Telemetry + ERP + Finance Sources -> AWS Ingestion -> Databricks Transformations -> Bronze/Silver/Gold Models -> Snowflake/Redshift Consumption",
      challenges: [
        "Balancing batch and near-real-time ingestion needs across operational and business systems.",
        "Maintaining trustworthy schemas and quality rules across heterogeneous plant and finance inputs.",
      ],
      impactMetrics: [
        {
          label: "Source Domains",
          value: "3 streams",
          detail: "Unified machine telemetry, ERP records, and finance data in one governed platform flow.",
        },
        {
          label: "Warehouse Shape",
          value: "Bronze to Gold",
          detail: "Standardized the progression from raw ingestion to trusted reporting tables.",
        },
        {
          label: "Platform Trust",
          value: "Production-grade",
          detail: "Monitoring, automated tests, and explicit quality checks increased downstream confidence.",
        },
      ],
      outcomes: [
        "Improved data freshness for equipment monitoring, downtime tracking, and production reporting.",
        "Created shared curated models for operations, finance, and recurring business reviews.",
        "Raised trust in production data through monitoring, testing, and explicit quality checks.",
      ],
      lessons: [
        "Layered warehouse design makes it easier for multiple teams to consume the same data platform confidently.",
        "Production data platforms earn adoption through observability and schema discipline as much as raw throughput.",
      ],
    },
    {
      id: "anomaly-detection",
      title: "Airline Resilience & Drift Monitoring Pipeline",
      type: "DS",
      typeLabel: "Data Platform Monitoring",
      icon: "monitoring",
      summary: "A distributed PySpark workflow over 2.15M+ flight records that paired delay analysis with automated drift detection to keep forecasting and reporting inputs current across seasonal changes.",
      role: "Data Science Graduate Project",
      domain: "Transportation Analytics / Monitored Pipeline",
      techStack: ["PySpark", "SQL", "MLflow", "Evidently AI", "Python", "Window Functions"],
      problem: "Route-level delay behavior changed across seasons, leaving analytical workflows stale and making it difficult to know when data and model assumptions no longer held.",
      context: "Framed from the airline drift monitoring project to emphasize the distributed data workflow, monitored feature processing, and retraining signals built into the pipeline.",
      stakes: "If seasonal changes went undetected, route analytics and downstream forecasting would keep operating on stale assumptions, creating false confidence in both reporting and model performance.",
      ownership: [
        "Built the distributed feature-processing workflow over the historical flight record set.",
        "Connected monitoring signals to the analytical pipeline so drift became visible inside the operating workflow instead of after the fact.",
        "Framed the outputs around retraining readiness and reporting reliability, not only around raw model metrics.",
      ],
      goals: [
        "Process 2.15M+ flight records in a distributed workflow suited to route and season analysis.",
        "Automate drift checks so data and model degradation became visible earlier.",
        "Reduce manual reporting effort while keeping monitored analytical inputs reliable over time.",
      ],
      architecture: "A PySpark feature pipeline using SQL window functions for route-level analytics, with MLflow experiment tracking and Evidently AI drift checks layered onto seasonal monitoring workflows.",
      implementation: [
        "Built a distributed PySpark pipeline over 2.15M+ flight records and used SQL window functions to analyze delay behavior across 50+ routes.",
        "Integrated MLflow and Evidently AI to surface performance degradation and sentiment drift across seasonal data changes.",
        "Structured the workflow to reduce manual reporting effort and generate clearer retraining signals for downstream forecasting.",
      ],
      decisions: [
        {
          title: "Route-aware monitoring",
          detail: "Tracked behavior at route and seasonal levels rather than relying on one global aggregate, which made drift interpretation more defensible.",
        },
        {
          title: "Monitoring inside the data path",
          detail: "Attached drift checks to the feature-processing workflow so they became part of routine delivery instead of an after-the-fact report.",
        },
        {
          title: "Retraining as an explicit outcome",
          detail: "Designed the monitoring output to answer when intervention was needed, not just whether variance existed.",
        },
      ],
      flow: "Flight Records -> PySpark Processing -> Route Features -> Drift Monitoring -> Performance Review -> Retraining Signals",
      challenges: [
        "Separating true drift from normal seasonal variance across airline routes and operating periods.",
        "Keeping the monitoring workflow useful for both analytics and model lifecycle decisions.",
      ],
      impactMetrics: [
        {
          label: "Record Volume",
          value: "2.15M+",
          detail: "Processed enough historical flight data to reason about route and seasonal behavior at scale.",
        },
        {
          label: "Reporting Lift",
          value: "-40%",
          detail: "Reduced manual reporting effort by embedding monitoring and review into the pipeline.",
        },
        {
          label: "Retraining Lag",
          value: "-30%",
          detail: "Earlier drift visibility shortened the time to act on changing model behavior.",
        },
      ],
      outcomes: [
        "Processed 2.15M+ flight records in a pipeline that reduced manual reporting effort by 40%.",
        "Reduced model retraining lag by 30% through automated seasonal drift detection.",
        "Improved confidence in downstream forecasting by pairing feature processing with ongoing monitoring.",
      ],
      lessons: [
        "Monitoring belongs in the data workflow itself, not only in a later model ops layer.",
        "Temporal context matters when deciding whether operational data has truly drifted.",
      ],
    },
  ],
  experience: [
    {
      company: "Rutgers University",
      role: "Graduate Research Assistant",
      period: "Sep 2025 - Present",
      description: [
        "Architected high-integrity biochemical data lakes with automated schema enforcement and metadata management to improve data quality.",
        "Engineered Python transformation pipelines to extract 15 reaction markers from multi-terabyte datasets for downstream analysis.",
        "Orchestrated Azure Data Factory ingestion workflows and connected GitHub Actions CI/CD for version-controlled delivery across environments.",
      ],
      skills: ["Python", "Azure Data Factory", "GitHub Actions", "Metadata Management", "Schema Validation"],
    },
    {
      company: "Sonaflex Industries",
      role: "Data Engineer",
      period: "Jun 2023 - Jun 2024",
      description: [
        "Built ETL and ELT pipelines on AWS using Python, SQL, S3, Glue, Databricks, Airflow, and PySpark to centralize telemetry, ERP, and finance data.",
        "Developed batch and near-real-time ingestion workflows that improved freshness for equipment monitoring, downtime tracking, and production reporting.",
        "Designed Bronze, Silver, and Gold models plus curated Snowflake and Redshift warehouse layers for cross-functional analytics.",
        "Improved pipeline reliability through data quality checks, automated testing, and monitoring across production workflows.",
      ],
      skills: ["AWS", "Airflow", "Databricks", "PySpark", "Snowflake"],
    },
    {
      company: "Maharashtra State Electricity Board",
      role: "Data Analyst Intern",
      period: "Jun 2022 - Dec 2022",
      description: [
        "Implemented distributed time-series forecasting workflows in Databricks and integrated weather API data to improve demand prediction accuracy by 15%.",
        "Automated SQL reconciliation scripts with audit logic and Power BI connectivity to support capacity planning and grid operations.",
        "Kept analytical delivery aligned with operational priorities through JIRA-driven sprint execution and bi-weekly stakeholder reporting.",
      ],
      skills: ["Databricks", "SQL", "Power BI", "Forecasting", "Agile Delivery"],
    },
  ],
  education: sharedEducation,
  certifications: [
    { name: "AWS Certified Data Engineer", issuer: "Amazon Web Services", date: "Listed on resume" },
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Listed on resume" },
  ],
  sectionCopy: {
    about: {
      eyebrow: "About Me",
      title: "Building reliable data platforms from raw signals to usable decisions.",
      impactLabel: "Platform Snapshot",
      focusLabel: "Focus Areas",
    },
    skills: {
      eyebrow: "Capabilities",
      title: "Production data delivery across pipelines, platforms, and monitoring.",
      description:
        "Experience spanning ingestion, warehousing, orchestration, quality controls, and governed analytics delivery across AWS and Azure environments.",
    },
    projects: {
      eyebrow: "Case Studies",
      title: "Selected Data Platform Work",
      description:
        "Resume-backed projects focused on pipeline design, monitored delivery, and the systems work required to keep operational and analytical data trustworthy.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experience shaped by shipped data systems.",
      description:
        "Work across manufacturing, research, and forecasting pipelines built a practical approach to data delivery, quality, and production reliability.",
    },
    education: {
      eyebrow: "Education",
      title: "Graduate study that sharpened the engineering foundation.",
      description:
        "Coursework in data science and databases supports the platform decisions behind warehousing, validation, and monitored analytical workflows.",
    },
    contact: {
      eyebrow: "Get in Touch",
      title: "Let's talk about data platforms that need to run reliably.",
      description:
        "Open to data engineering and analytics platform roles where ETL, warehousing, orchestration, and dependable delivery all matter.",
      chips: ["Data Engineering", "Cloud Pipelines", "Warehouse Reliability"],
      reachLabel: "Best Way To Reach Me",
    },
  },
  footer: {
    tagline: "Building scalable data platforms, governed pipelines, and reliable warehouse layers.",
  },
};

const softwareEngineerProfile: PortfolioData = {
  personal: {
    ...sharedIdentity,
    headline: "Software Engineer | Backend Systems | Cloud Data Products",
    about: [
      "I build backend systems, cloud workflows, and end-to-end software products that turn requirements into dependable shipped behavior.",
      "My experience spans REST APIs, database design, ETL and ELT services, CI/CD, and the application logic that connects data platforms to real user workflows.",
      "I am strongest when translating messy operational needs into maintainable Python, React, Flask, and cloud infrastructure that teams can extend safely.",
    ],
    focusAreas: [
      "Backend services and APIs",
      "System design and delivery",
      "Cloud platform engineering",
      "CI/CD and reliability",
    ],
    resume: withPublicAsset("Resume_Software_Engineer.pdf"),
  },
  metrics: [
    { label: "Engineering Experience", value: "2+ Years" },
    { label: "Data Access Lift", value: "+40%" },
    { label: "Deploy Time Cut", value: "-35%" },
    { label: "Response Delay Cut", value: "-50%+" },
  ],
  skills: [
    {
      category: "Languages",
      skills: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "Bash"],
    },
    {
      category: "Frameworks & APIs",
      skills: ["React", "Flask", "Spring Boot", "REST APIs", "PostgreSQL", "TimescaleDB"],
    },
    {
      category: "Cloud & DevOps",
      skills: ["AWS", "Azure Data Factory", "GitHub Actions", "Azure DevOps", "Docker", "Kubernetes"],
    },
    {
      category: "Platform Concepts",
      skills: ["System Design", "Distributed Systems", "CI/CD", "ETL/ELT", "Object-Oriented Design", "dbt"],
    },
  ],
  projects: [
    {
      id: "bloodbridge",
      title: "BloodBridge Real-Time Operations Platform",
      type: "AI",
      typeLabel: "Software Engineering",
      icon: "application",
      summary: "A full-stack React and Flask application for blood inventory, donor records, and emergency request workflows, built to reduce response delays through reliable operational software.",
      role: "Software Engineer",
      domain: "Healthcare Operations / Full-Stack Application",
      techStack: ["React", "Flask", "PostgreSQL", "TimescaleDB", "REST APIs", "Python"],
      problem: "Hospitals and blood banks needed a single operational system for donor records, inventory visibility, and emergency request handling instead of fragmented manual tracking.",
      context: "Built directly from the software engineering resume project to showcase application architecture, API design, relational modeling, and delivery of a user-facing operations workflow.",
      stakes: "When inventory state, donor records, and emergency requests live in separate workflows, response time slows down and operators lose the shared context needed to act confidently during urgent fulfillment.",
      ownership: [
        "Built the full-stack workflow spanning React dashboards, Flask APIs, and relational data design.",
        "Modeled the operational entities and request lifecycle so the application tracked state transitions clearly.",
        "Connected time-aware persistence and request handling into one system that prioritized traceability during urgent use.",
      ],
      goals: [
        "Create a full-stack system that tracked inventory, requests, donors, and transaction history in one application.",
        "Model the core entities and workflows clearly enough to support traceability and fast emergency handling.",
        "Ship a frontend and backend that remained maintainable as roles, requests, and inventory events changed over time.",
      ],
      architecture: "A React frontend backed by Flask REST APIs and PostgreSQL with TimescaleDB, centered on inventory, request, donor, and transaction services that supported real-time operational updates.",
      implementation: [
        "Built React dashboards and Flask APIs for request creation, compatibility validation, inventory updates, and fulfillment tracking.",
        "Modeled donors, organizations, blood units, inventory events, and transactions in PostgreSQL with TimescaleDB to support traceability and time-based querying.",
        "Organized the workflow so frontend views, backend logic, and persistent data all aligned around operational request handling instead of isolated screens.",
      ],
      decisions: [
        {
          title: "Domain-first data model",
          detail: "Defined donors, requests, inventory units, and transactions as explicit entities before refining the UI so state changes stayed traceable throughout the application.",
        },
        {
          title: "REST workflow boundaries",
          detail: "Separated validation, request handling, and persistence concerns behind API endpoints that matched the operational workflow instead of mirroring database tables one-to-one.",
        },
        {
          title: "Time-based history retention",
          detail: "Used PostgreSQL with TimescaleDB support so inventory and request histories stayed queryable as real operational timelines rather than flattened snapshots.",
        },
      ],
      flow: "React Dashboards -> Flask APIs -> Validation & Workflow Logic -> PostgreSQL/TimescaleDB -> Inventory & Request Tracking",
      challenges: [
        "Keeping inventory state, compatibility rules, and request fulfillment logic synchronized across multiple user actions.",
        "Designing schemas and APIs that stayed understandable while still supporting traceability and time-based history.",
      ],
      impactMetrics: [
        {
          label: "Response Delays",
          value: "-50%+",
          detail: "Faster visibility into requests and inventory status cut the operational lag during urgent handling.",
        },
        {
          label: "Core Domains",
          value: "4 workflows",
          detail: "Tracked donors, inventory, requests, and transactions inside one aligned application model.",
        },
        {
          label: "System Shape",
          value: "Full-stack",
          detail: "Frontend dashboards, backend APIs, and relational history were designed as one product flow.",
        },
      ],
      outcomes: [
        "Reduced emergency blood-response delays by more than 50% through faster request tracking and inventory visibility.",
        "Delivered a maintainable full-stack workflow spanning frontend dashboards, backend APIs, and relational data design.",
        "Created an operational system that made fulfillment status and blood availability easier to review in real time.",
      ],
      lessons: [
        "Operational software works best when the domain model is explicit before the UI and APIs grow around it.",
        "Traceable workflows depend on aligning validation rules, persistence, and user-facing status changes from the start.",
      ],
    },
    {
      id: "speech-translation-connector",
      title: "Speech-to-Speech Connector Architecture",
      type: "AI",
      typeLabel: "Software Engineering",
      icon: "translation",
      summary: "A modular speech translation pipeline that standardized interfaces across ASR, translation, and TTS components so the system stayed reproducible, debuggable, and extensible.",
      role: "Research Software Engineer",
      domain: "Multilingual Systems / Modular AI Application",
      techStack: ["Python", "Whisper ASR", "Machine Translation", "TTS", "BLEU Evaluation", "Connector Modules"],
      problem: "An end-to-end speech translation stack can become brittle quickly when ASR, translation, and synthesis components are coupled too tightly and hard to evaluate independently.",
      context: "Adapted from the software engineering resume to emphasize modular system boundaries, connector design, evaluation workflows, and the engineering work that made the pipeline maintainable.",
      stakes: "If the speech stack remained tightly coupled, every model change would ripple across the full pipeline, raising retraining cost and making debugging far slower than the product could tolerate.",
      ownership: [
        "Defined the modular boundaries between ASR, connector logic, translation, and TTS stages.",
        "Built the intermediate connector layer that let the pipeline evolve without retraining every downstream component.",
        "Created the evaluation harness that kept multilingual quality and system behavior measurable as the architecture changed.",
      ],
      goals: [
        "Standardize the interfaces between ASR, translation, and TTS components.",
        "Reduce training and debugging cost by isolating the cross-model connector behavior.",
        "Support multilingual evaluation without turning the system into a single opaque training pipeline.",
      ],
      architecture: "A cascading connector architecture linking Whisper ASR, machine translation, and TTS through a dedicated representation-mapping module plus validation workflows for multilingual output quality.",
      implementation: [
        "Built a modular pipeline that separated ASR, translation, and TTS responsibilities into clearer, debuggable stages.",
        "Implemented the connector module that mapped ASR embeddings into the translation model representation space while keeping the rest of the stack stable.",
        "Defined multilingual evaluation and BLEU-based validation workflows so output quality could be measured consistently across datasets.",
      ],
      decisions: [
        {
          title: "Connector over end-to-end retraining",
          detail: "Introduced a dedicated representation-mapping stage so interface adaptation happened in one controlled layer instead of requiring full-stack retraining for every change.",
        },
        {
          title: "Pipeline modularity",
          detail: "Kept ASR, translation, and TTS as independently testable stages so failures and quality regressions were easier to localize.",
        },
        {
          title: "Evaluation as a system feature",
          detail: "Built BLEU-driven validation into the pipeline contract because extensibility only mattered if multilingual quality stayed visible and comparable.",
        },
      ],
      flow: "Speech Input -> Whisper ASR -> Connector Module -> Translation Model -> TTS Output -> BLEU Validation",
      challenges: [
        "Designing interfaces that preserved model quality without hardwiring every stage together.",
        "Keeping evaluation reproducible across multilingual datasets and varying utterance lengths.",
      ],
      impactMetrics: [
        {
          label: "Training Cost",
          value: "-90%",
          detail: "Connector-based adaptation cut retraining overhead dramatically while preserving output quality.",
        },
        {
          label: "System Boundary",
          value: "4 stages",
          detail: "ASR, connector, translation, and TTS remained independently testable and debuggable.",
        },
        {
          label: "Quality Signal",
          value: "BLEU-tracked",
          detail: "Multilingual evaluation stayed visible as the system architecture evolved.",
        },
      ],
      outcomes: [
        "Reduced model training cost by 90% through the connector design while sustaining strong BLEU accuracy.",
        "Made the system easier to debug and extend by separating component responsibilities cleanly.",
        "Established a reproducible evaluation workflow for multilingual translation quality.",
      ],
      lessons: [
        "Good system boundaries matter as much as model quality when an AI workflow becomes a software product.",
        "Connector modules can preserve flexibility and dramatically cut retraining cost when interfaces are designed carefully.",
      ],
    },
    {
      id: "lakehouse-platform",
      title: "Manufacturing Telemetry Platform Services",
      type: "DE",
      typeLabel: "Platform Engineering",
      icon: "pipeline",
      summary: "Python APIs, ingestion services, ETL workflows, and deployment pipelines that moved manufacturing telemetry into validated Snowflake datasets for global business reporting.",
      role: "Software Engineer",
      domain: "Manufacturing Systems / Platform Engineering",
      techStack: ["Python", "SQL", "AWS", "Snowflake", "dbt", "Azure DevOps"],
      problem: "Manufacturing teams needed operational data to move from source systems into accessible platform services and validated datasets without month-end reporting delays or fragile deployment processes.",
      context: "Framed from the software engineering resume version of the Sonaflex work to emphasize backend services, CI/CD, and the execution layer that made the data platform usable across business units.",
      stakes: "If backend ingestion and deployment remained brittle, the reporting layer would keep inheriting stale data, long release cycles, and service changes that were too risky to ship quickly.",
      ownership: [
        "Built the ingestion and backend service layer that moved telemetry into reporting-ready platform paths.",
        "Connected ETL and ELT logic with release automation so data delivery could improve without manual deployment friction.",
        "Strengthened service reliability through validation checks and repeatable CI/CD across environments.",
      ],
      goals: [
        "Build backend services that moved telemetry into accessible platform workflows.",
        "Create ETL and ELT paths that produced validated datasets for downstream reporting.",
        "Strengthen deployment and quality checks so engineering delivery became faster and more reliable.",
      ],
      architecture: "Python ingestion services, REST-style integration points, ETL and ELT jobs on AWS, and CI/CD workflows in Azure DevOps publishing validated Snowflake datasets for downstream consumers.",
      implementation: [
        "Built Python-based ingestion services and backend workflows that streamed manufacturing telemetry into Snowflake-backed reporting datasets.",
        "Engineered ETL and ELT paths with Python, SQL, dbt, S3, Glue, and Snowflake to transform raw operational data into validated outputs.",
        "Standardized CI/CD workflows and strengthened data quality checks across staging and production to speed release cycles and reduce latency.",
      ],
      decisions: [
        {
          title: "Backend services over manual extracts",
          detail: "Moved platform access into code-driven ingestion services so the reporting path became maintainable and repeatable instead of analyst-dependent.",
        },
        {
          title: "Quality checks inside delivery",
          detail: "Attached validation rules to the service and deployment workflow so release speed did not come at the cost of downstream trust.",
        },
        {
          title: "CI/CD as platform leverage",
          detail: "Standardized Azure DevOps release handling because faster, safer deployments directly affected the usefulness of the data product.",
        },
      ],
      flow: "Manufacturing Sources -> Python Services -> AWS ETL/ELT -> Validation Checks -> Snowflake Datasets -> Reporting Consumers",
      challenges: [
        "Balancing operational freshness with maintainable backend logic and deployment controls.",
        "Keeping platform services reliable across multiple business units and evolving reporting demands.",
      ],
      impactMetrics: [
        {
          label: "Data Access",
          value: "+40%",
          detail: "More than five business units gained easier access to validated operational data.",
        },
        {
          label: "Deploy Speed",
          value: "-35%",
          detail: "Release automation shortened deployment time across platform changes.",
        },
        {
          label: "Reporting Lag",
          value: "-40%",
          detail: "Faster backend delivery reduced month-end reporting latency materially.",
        },
      ],
      outcomes: [
        "Improved data accessibility by 40% across more than five business units.",
        "Reduced deployment time by 35% and month-end reporting latency by 40%.",
        "Connected backend delivery work directly to validated business reporting outcomes.",
      ],
      lessons: [
        "Platform engineering succeeds when ingestion services, deployment workflows, and data contracts evolve together.",
        "Quality checks and CI/CD are not separate from product delivery when the product is the system itself.",
      ],
    },
  ],
  experience: [
    {
      company: "Rutgers University",
      role: "Research Software Engineer",
      period: "Sep 2025 - Present",
      description: [
        "Built a cloud-native biochemical data platform on Azure to ingest, validate, and manage multi-terabyte experimental datasets.",
        "Developed reusable Python processing components and automated deployment with GitHub Actions for reliable data delivery.",
        "Designed Azure Data Factory ingestion workflows with idempotent processing and dependable error handling for large-scale downstream analysis.",
      ],
      skills: ["Python", "Azure", "GitHub Actions", "Idempotent Processing", "System Design"],
    },
    {
      company: "Sonaflex Industries",
      role: "Software Engineer",
      period: "Jun 2023 - Jun 2024",
      description: [
        "Built Python-based REST APIs and ingestion services to stream manufacturing telemetry into Snowflake, improving data accessibility by 40%.",
        "Engineered ETL and ELT pipelines with Python, SQL, dbt, AWS, and Snowflake to produce validated downstream datasets.",
        "Containerized anomaly-detection services with Docker, Kubernetes, and SageMaker and strengthened CI/CD in Azure DevOps.",
      ],
      skills: ["REST APIs", "Python", "AWS", "Docker", "Kubernetes"],
    },
    {
      company: "Maharashtra State Electricity Board",
      role: "Data Analyst Intern",
      period: "Jun 2022 - Dec 2022",
      description: [
        "Implemented forecasting pipelines and SQL-based reconciliation workflows that supported capacity planning and grid operations.",
        "Connected analytical delivery to stakeholder reporting cadences through JIRA-driven sprint execution and bi-weekly updates.",
      ],
      skills: ["SQL", "Python", "Forecasting", "JIRA", "Stakeholder Reporting"],
    },
  ],
  education: sharedEducation,
  certifications: [
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Listed on resume" },
    { name: "CompTIA Security+", issuer: "CompTIA", date: "Listed on resume" },
  ],
  sectionCopy: {
    about: {
      eyebrow: "About Me",
      title: "Shipping backend systems and data products that hold up in production.",
      impactLabel: "Delivery Snapshot",
      focusLabel: "Focus Areas",
    },
    skills: {
      eyebrow: "Capabilities",
      title: "Backend engineering, cloud workflows, and dependable execution.",
      description:
        "Hands-on delivery across APIs, data services, relational modeling, CI/CD, and the platform work required to keep software maintainable after launch.",
    },
    projects: {
      eyebrow: "Case Studies",
      title: "Selected Software Engineering Work",
      description:
        "Projects centered on application architecture, modular system design, backend services, and the cloud workflows that connect software to real operating environments.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experience shaped by shipped systems and release discipline.",
      description:
        "From research platforms to manufacturing services, the through line is translating requirements into reliable software and clear operating workflows.",
    },
    education: {
      eyebrow: "Education",
      title: "Graduate work that complements practical engineering execution.",
      description:
        "Data science coursework reinforces the analytical and systems thinking behind backend services, platform choices, and maintainable software architecture.",
    },
    contact: {
      eyebrow: "Get in Touch",
      title: "Let's talk about backend systems worth shipping.",
      description:
        "Open to software engineering roles focused on backend systems, cloud services, platform execution, and dependable product delivery.",
      chips: ["Software Engineering", "Backend APIs", "Cloud Delivery"],
      reachLabel: "Best Way To Reach Me",
    },
  },
  footer: {
    tagline: "Building maintainable backend systems, cloud workflows, and software that ships cleanly.",
  },
};

const dataScientistProfile: PortfolioData = {
  personal: {
    ...sharedIdentity,
    headline: "Data Scientist | NLP, Forecasting & Production ML",
    about: [
      "I build machine learning workflows that go from feature engineering and experimentation to monitored, production-facing delivery.",
      "My strongest work sits at the intersection of modeling, evaluation, and operationalization: NLP systems, drift monitoring, forecasting, and explainable analytical outputs.",
      "I care about model quality, but I care just as much about validation, interpretability, and the infrastructure that keeps analytical results useful after the first experiment.",
    ],
    focusAreas: [
      "NLP and multimodal systems",
      "Forecasting and experimentation",
      "MLOps and drift monitoring",
      "Interpretability and reporting",
    ],
    resume: withPublicAsset("Resume_Data Scientist.pdf"),
  },
  metrics: [
    { label: "Flight Records", value: "2.15M+" },
    { label: "Training Cost Cut", value: "-90%" },
    { label: "Downtime Cut", value: "-25%" },
    { label: "Forecast Lift", value: "+15%" },
  ],
  skills: [
    {
      category: "Modeling & ML",
      skills: ["Scikit-learn", "XGBoost", "LightGBM", "Random Forests", "SHAP", "Causal Inference"],
    },
    {
      category: "Deep Learning",
      skills: ["PyTorch", "TensorFlow", "Multimodal Models", "Computer Vision", "Reinforcement Learning", "NLP"],
    },
    {
      category: "MLOps & Data",
      skills: ["MLflow", "Evidently AI", "AWS SageMaker", "PySpark", "Databricks", "Azure Data Factory"],
    },
    {
      category: "Visualization & Delivery",
      skills: ["Plotly", "Power BI", "Tableau", "Matplotlib", "Grafana", "SQL"],
    },
  ],
  projects: [
    {
      id: "speech-translation-connector",
      title: "Speech-to-Speech Translation with Connector Architecture",
      type: "AI",
      typeLabel: "Machine Learning Systems",
      icon: "translation",
      summary: "A multimodal NLP pipeline that connected Whisper ASR, frozen translation, and TTS through a Q-Former-inspired connector to enable multilingual speech translation without full-model retraining.",
      role: "Data Scientist",
      domain: "NLP / Multimodal Modeling",
      techStack: ["PyTorch", "Whisper ASR", "Machine Translation", "TTS", "BLEU", "Connector Modules"],
      problem: "End-to-end multilingual translation systems are expensive to retrain and difficult to adapt when ASR and translation representations do not align cleanly.",
      context: "Built directly from the data scientist resume to emphasize multimodal modeling, cross-modal alignment, experimentation, and evaluation against large end-to-end baselines.",
      stakes: "Without a more efficient alignment strategy, every multilingual improvement would demand expensive retraining across the entire stack, slowing experimentation and making deployment tradeoffs harder to justify.",
      ownership: [
        "Designed the connector-based modeling approach that linked ASR outputs to the downstream translation space.",
        "Ran the experimentation and benchmarking workflow across multilingual corpora to test whether the connector preserved quality.",
        "Defined the evaluation framing so the architectural tradeoff between cost and accuracy stayed measurable.",
      ],
      goals: [
        "Bridge ASR outputs into the translation model space without retraining the full stack.",
        "Validate multilingual quality with consistent, benchmarked evaluation workflows.",
        "Make the system adaptable enough for real-time inference and future domain tuning.",
      ],
      architecture: "A cascading connector architecture linking Whisper ASR, a frozen machine translation model, and TTS through a dedicated embedding-alignment module plus multilingual evaluation harnesses.",
      implementation: [
        "Engineered a Q-Former-inspired connector that mapped ASR latent representations into translation model space.",
        "Fine-tuned and benchmarked the pipeline on multilingual speech corpora to validate accuracy and real-time inference behavior.",
        "Defined BLEU-driven evaluation workflows to compare the connector approach against larger end-to-end transformer baselines.",
      ],
      decisions: [
        {
          title: "Connector-based alignment",
          detail: "Focused adaptation effort on one intermediate layer so the model stack stayed flexible without incurring the cost of full-model retraining.",
        },
        {
          title: "Frozen downstream components",
          detail: "Kept the translation and speech synthesis stages stable to isolate whether the connector itself could bridge the representation gap successfully.",
        },
        {
          title: "Benchmark-led validation",
          detail: "Compared against larger end-to-end baselines so the efficiency win could be judged against a credible quality reference rather than in isolation.",
        },
      ],
      flow: "Speech Input -> Whisper ASR -> Cross-Modal Connector -> Translation Model -> TTS Output -> Multilingual Evaluation",
      challenges: [
        "Maintaining translation quality while reducing the amount of retraining required.",
        "Measuring system behavior consistently across varied languages, utterance lengths, and benchmark datasets.",
      ],
      impactMetrics: [
        {
          label: "Training Cost",
          value: "-90%",
          detail: "Connector-based adaptation cut the retraining burden dramatically relative to larger end-to-end setups.",
        },
        {
          label: "Modeling Lens",
          value: "Cross-modal",
          detail: "The work focused on representation alignment across ASR, translation, and speech synthesis stages.",
        },
        {
          label: "Validation Mode",
          value: "BLEU-tracked",
          detail: "Quality stayed benchmarked across multilingual datasets instead of being judged informally.",
        },
      ],
      outcomes: [
        "Reduced model training cost by 90% while sustaining high BLEU translation accuracy.",
        "Validated real-time inference behavior across multilingual speech corpora.",
        "Proved that connector-based alignment could preserve quality without full-model retraining.",
      ],
      lessons: [
        "Multimodal systems benefit from carefully designed alignment layers more than brute-force retraining.",
        "Evaluation design is a core part of model architecture when quality needs to hold across languages and domains.",
      ],
    },
    {
      id: "agentic-orchestrator",
      title: "Tesla Stock Forecasting & Sentiment Analysis",
      type: "DS",
      typeLabel: "Forecasting & Modeling",
      icon: "trend",
      summary: "A multi-source forecasting workflow that fused technical indicators with Reddit, Guardian, and NYT sentiment signals to generate next-day price forecasts and interpretable model insights.",
      role: "Data Scientist",
      domain: "Financial Forecasting / Applied ML",
      techStack: ["Python", "XGBoost", "Random Forest", "SHAP", "Plotly", "Walk-Forward Validation"],
      problem: "It was unclear whether external sentiment signals improved stock forecasting enough to justify the added pipeline complexity, and the analytical results needed better interpretability.",
      context: "Adapted from the data scientist resume to emphasize modeling, walk-forward validation, feature attribution, and analytical interpretation instead of only the data pipeline mechanics.",
      stakes: "If sentiment features added noise without disciplined validation or interpretability, the model could appear impressive while still giving stakeholders little reason to trust its next-day forecast behavior.",
      ownership: [
        "Framed the forecasting problem around time-aware validation instead of one-time train/test accuracy.",
        "Engineered the sentiment and technical feature set used across the forecasting experiments.",
        "Built the interpretability layer that explained how external sentiment affected model output and volatility signals.",
      ],
      goals: [
        "Measure whether sentiment data improved next-day forecasting beyond technical indicators alone.",
        "Use walk-forward validation to evaluate performance under more realistic market shifts.",
        "Surface interpretable explanations that helped technical and non-technical audiences understand model behavior.",
      ],
      architecture: "A Python forecasting workflow combining technical indicators and external sentiment features, training time-series models with walk-forward validation and visualizing predictions with SHAP and Plotly.",
      implementation: [
        "Engineered technical indicators and sentiment features from Reddit, Guardian, and NYT data for next-day forecasting experiments.",
        "Trained and evaluated XGBoost and Random Forest models with walk-forward cross-validation and confidence intervals.",
        "Applied SHAP attribution and correlation analysis to explain how market sentiment influenced price volatility and model output.",
      ],
      decisions: [
        {
          title: "Walk-forward instead of static validation",
          detail: "Used rolling evaluation windows so the forecast quality reflected changing market conditions instead of a single fixed split.",
        },
        {
          title: "Interpretability alongside accuracy",
          detail: "Paired SHAP and correlation analysis with the forecast models because sentiment-driven signals are difficult to trust without clear attribution.",
        },
        {
          title: "Feature comparison discipline",
          detail: "Measured sentiment-enhanced models against technical baselines so the added pipeline complexity had to earn its place analytically.",
        },
      ],
      flow: "Market Data + Sentiment APIs -> Feature Engineering -> Walk-Forward Validation -> Forecast Models -> SHAP & Plotly Analysis",
      challenges: [
        "Avoiding optimistic evaluation when market regimes changed across the validation window.",
        "Separating genuinely predictive sentiment features from noisy external signals.",
      ],
      impactMetrics: [
        {
          label: "Forecast Lens",
          value: "Next-day",
          detail: "The workflow focused on short-horizon price movement with time-aware validation.",
        },
        {
          label: "Signal Mix",
          value: "Technical + sentiment",
          detail: "Combined price indicators with Reddit, Guardian, and NYT-derived external features.",
        },
        {
          label: "Interpretability",
          value: "SHAP-backed",
          detail: "Model explanations were visible enough for both technical review and stakeholder discussion.",
        },
      ],
      outcomes: [
        "Delivered next-day price forecasts with interpretable views of the most influential market drivers.",
        "Made feature importance and model behavior easier to inspect for technical and non-technical audiences.",
        "Showed how sentiment signals could be evaluated rigorously instead of accepted at face value.",
      ],
      lessons: [
        "Time-series validation discipline matters as much as model selection in forecasting work.",
        "Interpretability becomes more valuable when external sentiment features make model behavior harder to reason about directly.",
      ],
    },
    {
      id: "anomaly-detection",
      title: "Airline Resilience & Sentiment Drift Monitor",
      type: "DS",
      typeLabel: "MLOps & Monitoring",
      icon: "monitoring",
      summary: "A distributed PySpark and MLOps workflow that monitored airline delay patterns and sentiment drift across 2.15M+ flight records, improving forecast reliability over seasonal changes.",
      role: "Data Scientist",
      domain: "Transportation Analytics / MLOps",
      techStack: ["PySpark", "SQL", "MLflow", "Evidently AI", "Python", "Window Functions"],
      problem: "Airline delay and sentiment behavior changed across routes and seasons, making static analyses stale and leaving teams slow to respond when model assumptions drifted.",
      context: "Built from the current repo case study and the data scientist resume to keep the emphasis on distributed analytics, monitoring, and earlier detection of changing model behavior.",
      stakes: "If drift stayed invisible, teams would continue trusting model outputs that no longer reflected route-level behavior, which would erode the usefulness of the forecasting and reporting workflow over time.",
      ownership: [
        "Built the distributed route-level analytics workflow on top of the large historical flight dataset.",
        "Integrated the monitoring stack that surfaced changing performance and sentiment patterns across seasons.",
        "Connected the output to retraining and review decisions so monitoring changed behavior instead of staying passive.",
      ],
      goals: [
        "Process 2.15M+ flight records in a distributed workflow suitable for route and season-level analysis.",
        "Detect sentiment and model drift automatically so degradation became visible earlier.",
        "Reduce manual reporting while giving stakeholders a clearer view of reliability risk across time and geography.",
      ],
      architecture: "A distributed feature pipeline built with PySpark and SQL window functions, with MLflow tracking experiments and Evidently AI monitoring sentiment and performance drift across seasonal cohorts.",
      implementation: [
        "Built a distributed PySpark workflow over 2.15M+ flight records and analyzed delay behavior across more than 50 routes.",
        "Implemented automated drift detection with Evidently AI and MLflow to monitor performance degradation across seasonal changes.",
        "Structured the workflow to reduce manual reporting effort and surface retraining signals earlier in the model lifecycle.",
      ],
      decisions: [
        {
          title: "Season-aware drift analysis",
          detail: "Compared route behavior in temporal context so expected seasonal variance did not masquerade as model failure.",
        },
        {
          title: "Experiment tracking with monitoring",
          detail: "Used MLflow and Evidently together so observed drift could be tied back to model lineage and evaluation history.",
        },
        {
          title: "Operational retraining signal",
          detail: "Shaped the output to answer when intervention was warranted, not simply to log changes for later review.",
        },
      ],
      flow: "Flight Records -> PySpark Processing -> Route & Delay Features -> Drift Monitoring -> Performance Review -> Retraining Signals",
      challenges: [
        "Separating true model drift from normal seasonal behavior across routes and operating periods.",
        "Making the monitoring signal useful to both analysts and model owners.",
      ],
      impactMetrics: [
        {
          label: "Record Scale",
          value: "2.15M+",
          detail: "The monitoring workflow operated over a large enough history to support route-level analysis.",
        },
        {
          label: "Reporting Effort",
          value: "-40%",
          detail: "Automated drift analysis reduced recurring manual review work.",
        },
        {
          label: "Retraining Lag",
          value: "-30%",
          detail: "Earlier drift visibility shortened the time to respond when assumptions changed.",
        },
      ],
      outcomes: [
        "Processed 2.15M+ flight records in a pipeline that reduced manual reporting effort by 40%.",
        "Reduced model retraining lag by 30% through automated drift detection.",
        "Improved forecast reliability by pairing route-level analysis with monitored model behavior.",
      ],
      lessons: [
        "Monitoring is part of the model system, not a reporting add-on.",
        "Temporal context is critical when deciding whether operational data has truly drifted.",
      ],
    },
  ],
  experience: [
    {
      company: "Rutgers University",
      role: "Graduate Research Assistant",
      period: "Sep 2025 - Present",
      description: [
        "Used PCA, ANOVA, and multivariate regression in Python and SAS to extract 15 statistically significant signals from high-dimensional biochemical data.",
        "Built feature engineering and preprocessing workflows with Python and Azure Data Factory to produce model-ready datasets with automated validation and lineage tracking.",
        "Presented statistically validated findings to cross-functional stakeholders and refined requirements around analytical decision-making.",
      ],
      skills: ["PCA", "ANOVA", "Multivariate Regression", "Python", "Azure Data Factory"],
    },
    {
      company: "Sonaflex Industries",
      role: "Data Scientist",
      period: "Jun 2023 - Jun 2024",
      description: [
        "Productionized generative AI inference services and predictive-maintenance models on IoT and ERP streams via AWS SageMaker, Azure, and Docker.",
        "Automated feature engineering pipelines and RESTful APIs that served real-time manufacturing signals into ML serving infrastructure.",
        "Developed statistical validation and cost-forecasting models that accelerated month-end financial reporting by 40%.",
      ],
      skills: ["AWS SageMaker", "Docker", "MLOps", "Feature Engineering", "Forecasting"],
    },
    {
      company: "Maharashtra State Electricity Board",
      role: "Data Analyst Intern",
      period: "Jun 2022 - Dec 2022",
      description: [
        "Developed ARIMA and SARIMAX forecasting models in Python using weather and seasonal features to improve electricity demand prediction accuracy by 15%.",
        "Performed statistical evaluation with MAPE, RMSE, and correlation analysis and surfaced the results in Power BI dashboards for operational teams.",
      ],
      skills: ["ARIMA", "SARIMAX", "Python", "Power BI", "Statistical Evaluation"],
    },
  ],
  education: [
    {
      school: "Rutgers University - New Brunswick",
      degree: "Master of Science in Data Science",
      period: "Sep 2024 - May 2026",
      location: "New Brunswick, USA",
      details: [
        "GPA: 3.5",
        "Coursework: Natural Language Processing, Deep Learning, Machine Learning, Statistical Learning & Inference, Computer Vision, Reinforcement Learning",
      ],
    },
    sharedEducation[1],
  ],
  certifications: [
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Listed on resume" },
  ],
  sectionCopy: {
    about: {
      eyebrow: "About Me",
      title: "Building machine learning workflows that stay useful after the first experiment.",
      impactLabel: "Model Snapshot",
      focusLabel: "Focus Areas",
    },
    skills: {
      eyebrow: "Capabilities",
      title: "Modeling, evaluation, and production-facing ML delivery.",
      description:
        "Experience across NLP, forecasting, experimentation, drift monitoring, and the data pipelines required to keep model outputs interpretable and operational.",
    },
    projects: {
      eyebrow: "Case Studies",
      title: "Selected Data Science Work",
      description:
        "Projects focused on multimodal modeling, forecasting, interpretability, and the monitoring required to keep machine learning systems credible over time.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experience shaped by modeling and monitored delivery.",
      description:
        "The through line is not just training models, but engineering the evaluation, validation, and reporting loops that make them useful in production settings.",
    },
    education: {
      eyebrow: "Education",
      title: "Graduate work anchored in machine learning and inference.",
      description:
        "Coursework in NLP, deep learning, statistical inference, and time series complements the applied modeling and monitoring work shown across the portfolio.",
    },
    contact: {
      eyebrow: "Get in Touch",
      title: "Let's talk about machine learning that can stand up in production.",
      description:
        "Open to data science and applied ML roles spanning NLP, forecasting, experimentation, MLOps, and interpretable analytical delivery.",
      chips: ["Data Science", "NLP Systems", "MLOps & Forecasting"],
      reachLabel: "Best Way To Reach Me",
    },
  },
  footer: {
    tagline: "Building interpretable ML systems, monitored forecasting workflows, and production-facing analytical pipelines.",
  },
};

const dataAnalystProfile: PortfolioData = {
  personal: {
    ...sharedIdentity,
    headline: "Data Analyst | SQL, BI Dashboards & Stakeholder Insights",
    about: [
      "I turn operational, financial, and market data into clear reporting workflows that help teams make decisions faster.",
      "My work focuses on SQL analysis, dashboard design, data validation, forecasting support, and translating technical findings into stakeholder-ready business narratives.",
      "Across manufacturing, grid operations, and finance-oriented projects, I care about building analytical outputs that are trusted, interpretable, and directly useful to decision-makers.",
    ],
    focusAreas: [
      "SQL analysis and reporting",
      "Dashboard design and BI",
      "Business-facing insights",
      "Validation and data quality",
    ],
    resume: withPublicAsset("Resume_Data Analyst.pdf"),
  },
  metrics: [
    { label: "Operational Decisions", value: "$500K+" },
    { label: "Tracked KPIs", value: "10+" },
    { label: "Planning Lift", value: "+15%" },
    { label: "Ad Hoc Requests Cut", value: "-35%" },
  ],
  skills: [
    {
      category: "Analytics & Querying",
      skills: ["SQL", "Window Functions", "CTEs", "Python", "R", "Excel"],
    },
    {
      category: "BI & Visualization",
      skills: ["Power BI", "DAX", "Tableau", "Looker", "AWS QuickSight", "Plotly"],
    },
    {
      category: "Analysis & Modeling",
      skills: ["Regression Modeling", "Hypothesis Testing", "A/B Testing", "Data Wrangling", "Predictive Analytics", "SAS"],
    },
    {
      category: "Data Foundations",
      skills: ["Snowflake", "Databricks", "Azure Data Factory", "dbt", "Metadata Management", "Audit Checks"],
    },
  ],
  projects: [
    {
      id: "credit-risk-assessment",
      title: "Credit Risk Assessment & Stakeholder Dashboards",
      type: "DS",
      typeLabel: "Data Analytics",
      icon: "risk",
      summary: "An analytical workflow over borrower data that combined feature engineering, validation, and SHAP-based dashboards to surface the drivers of default risk for business and review stakeholders.",
      role: "Data Analyst",
      domain: "Financial Services / Risk Analytics",
      techStack: ["Python", "SQL", "SHAP", "Cross-Validation", "SMOTE", "Plotly"],
      problem: "Borrower risk signals were difficult to explain transparently, and the analysis needed both reliable validation and stakeholder-friendly views of the most important default drivers.",
      context: "Built from the data analyst resume project to emphasize analytical framing, validation discipline, and stakeholder communication instead of only predictive model performance.",
      stakes: "If the analysis could not explain default risk clearly, stakeholders would struggle to trust the recommendations, especially when higher-recall behavior on risky borrower segments came with more nuanced tradeoffs.",
      ownership: [
        "Framed the risk analysis around explainability and stakeholder review, not only around model accuracy.",
        "Built the validation path that handled class imbalance and preserved visibility into high-risk borrower behavior.",
        "Translated the strongest signals into dashboard views that business stakeholders could interpret without losing analytical nuance.",
      ],
      goals: [
        "Identify the borrower attributes most associated with default risk across segments.",
        "Use reliable validation on imbalanced data so high-risk behavior was not hidden by average accuracy alone.",
        "Translate the analytical findings into dashboards and narratives suitable for business and review audiences.",
      ],
      architecture: "A Python analytical workflow combining feature engineering, validation, SMOTE balancing, and SHAP-based reporting views to explain borrower risk drivers transparently.",
      implementation: [
        "Analyzed borrower data across segments and compared candidate approaches to isolate the most informative default-risk features.",
        "Implemented validation and SMOTE-based resampling to keep the analysis reliable across imbalanced borrower profiles.",
        "Built SHAP-driven reporting views that explained the strongest risk drivers for business stakeholders and review contexts.",
      ],
      decisions: [
        {
          title: "Explainability over black-box scoring",
          detail: "Used SHAP-backed reporting because stakeholder confidence depended on understanding which borrower attributes drove risk, not just on receiving a score.",
        },
        {
          title: "Imbalance-aware validation",
          detail: "Handled the skewed borrower distribution explicitly so default-risk performance was not hidden behind average-case metrics.",
        },
        {
          title: "Dashboard-led communication",
          detail: "Turned the output into review-friendly analytical views so the findings could support lending discussions rather than stay locked in notebook form.",
        },
      ],
      flow: "Borrower Data -> Feature Engineering -> Validation & Sampling -> Risk Analysis -> SHAP Dashboards",
      challenges: [
        "Balancing analytical transparency with the need to improve recall on high-risk borrower profiles.",
        "Making the results interpretable enough for non-technical stakeholders without flattening the underlying nuance.",
      ],
      impactMetrics: [
        {
          label: "Model Accuracy",
          value: "77%",
          detail: "Delivered credible predictive performance while keeping the analysis interpretable.",
        },
        {
          label: "Decision Lens",
          value: "Risk drivers",
          detail: "The analysis highlighted which borrower attributes most influenced default exposure.",
        },
        {
          label: "Delivery Mode",
          value: "SHAP dashboards",
          detail: "Business and review stakeholders could inspect the same analytical logic visually.",
        },
      ],
      outcomes: [
        "Achieved 77% prediction accuracy with stronger recall on high-risk default cases.",
        "Surfaced the most influential default-risk drivers in stakeholder-friendly SHAP dashboards.",
        "Created a clearer analytical basis for transparent lending discussions and review workflows.",
      ],
      lessons: [
        "Risk analysis needs interpretability and validation discipline to be trusted by business stakeholders.",
        "Analytical value often comes from clarifying the drivers behind a decision, not just optimizing a score.",
      ],
    },
    {
      id: "agentic-orchestrator",
      title: "Tesla Market Sentiment Insight Dashboard",
      type: "DS",
      typeLabel: "Data Analytics",
      icon: "trend",
      summary: "A market analysis workflow that combined technical indicators with Reddit, Guardian, and NYT sentiment signals to explain which factors most influenced next-day Tesla price behavior.",
      role: "Data Analyst",
      domain: "Financial Analytics / Insight Delivery",
      techStack: ["Python", "Plotly", "SHAP", "SQL", "Reddit API", "NYT API"],
      problem: "Market and sentiment signals were difficult to compare consistently, and the analysis needed clearer views of which factors actually mattered to stakeholders reviewing the results.",
      context: "Reframed from the Tesla forecasting project to center correlation analysis, feature importance, and dashboard communication for technical and non-technical audiences.",
      stakes: "If the market narrative stayed buried inside disconnected sentiment pulls and technical indicators, stakeholders would get activity charts without clarity on which factors were actually moving next-day price behavior.",
      ownership: [
        "Built the analytical feature set combining technical indicators with external sentiment sources.",
        "Ran the attribution and correlation analysis that separated meaningful drivers from noise.",
        "Turned the outputs into dashboard views that made the market story discussable for mixed audiences.",
      ],
      goals: [
        "Test whether sentiment meaningfully improved market analysis beyond technical indicators alone.",
        "Pinpoint the most influential price drivers and explain them clearly.",
        "Package the results in dashboards that made complex signals easier to inspect and discuss.",
      ],
      architecture: "A multi-source market analysis workflow combining technical indicators and external sentiment feeds, then surfacing feature importance and trend behavior through interactive Plotly dashboards.",
      implementation: [
        "Integrated technical indicators with Reddit, Guardian, and NYT sentiment signals over more than two years of market history.",
        "Used feature attribution and correlation analysis to isolate the most influential drivers of price movement.",
        "Built interactive dashboard views that translated complex market signals into clearer stakeholder-facing narratives.",
      ],
      decisions: [
        {
          title: "Attribution before storytelling",
          detail: "Used feature-importance analysis to ground the dashboard narrative in measurable drivers rather than presenting sentiment activity as inherently meaningful.",
        },
        {
          title: "Interactive over static reporting",
          detail: "Built Plotly views so stakeholders could inspect changing signal relationships instead of relying on one static summary slide.",
        },
        {
          title: "Technical baseline comparison",
          detail: "Judged sentiment against concrete market indicators so the analysis could explain whether external feeds added real signal value.",
        },
      ],
      flow: "Market Data + Sentiment APIs -> Analytical Feature Set -> Correlation & Attribution -> Plotly Dashboards -> Stakeholder Review",
      challenges: [
        "Separating noisy external sentiment from signals that genuinely improved the analysis.",
        "Presenting nuanced market drivers in a way that technical and non-technical audiences could both use.",
      ],
      impactMetrics: [
        {
          label: "History Window",
          value: "2+ years",
          detail: "The analysis covered enough market history to compare technical and sentiment behavior over time.",
        },
        {
          label: "Driver Clarity",
          value: "Top 5",
          detail: "SHAP-based analysis surfaced the strongest contributors to next-day price behavior.",
        },
        {
          label: "Delivery Mode",
          value: "Interactive",
          detail: "Stakeholders could inspect the relationships through dashboards instead of static summaries.",
        },
      ],
      outcomes: [
        "Identified the five most influential price drivers through SHAP-based analysis.",
        "Delivered interactive dashboards that clarified how public sentiment related to next-day price movement.",
        "Turned a forecasting workflow into a stronger business-facing analytical story.",
      ],
      lessons: [
        "Analytical communication improves when attribution is paired with interactive views instead of static summaries.",
        "External sentiment becomes more credible when its effect is measured against concrete technical baselines.",
      ],
    },
    {
      id: "lakehouse-platform",
      title: "Manufacturing KPI Reporting Platform",
      type: "DE",
      typeLabel: "Operations Analytics",
      icon: "pipeline",
      summary: "A structured reporting foundation that unified manufacturing data for KPI dashboards, variance analysis, and leadership reporting across more than five business units.",
      role: "Data Analyst",
      domain: "Manufacturing Analytics / BI Reporting",
      techStack: ["SQL", "Python", "Power BI", "Tableau", "DAX", "Snowflake"],
      problem: "Operations leaders lacked a consistent analytical view of cost anomalies, variance trends, and production KPIs across business units, leading to slow and repetitive ad hoc reporting.",
      context: "Reframed from the Sonaflex experience to highlight SQL analysis, dashboard delivery, KPI tracking, and stakeholder-facing operational insights rather than platform internals.",
      stakes: "If leaders kept relying on fragmented KPI logic and ad hoc extracts, operational reviews would stay reactive, reporting errors would persist, and analysts would spend time rebuilding the same answers repeatedly.",
      ownership: [
        "Built the analytical reporting layer over the unified manufacturing datasets.",
        "Defined KPI and variance views that leadership teams could use repeatedly across review cycles.",
        "Added validation logic that reduced reporting errors and made self-serve dashboards more trustworthy.",
      ],
      goals: [
        "Create a reliable reporting foundation for KPI dashboards and recurring leadership reviews.",
        "Use SQL and Python analysis to isolate anomalies and explain operational variance clearly.",
        "Reduce ad hoc reporting effort by giving teams self-serve visibility into core production metrics.",
      ],
      architecture: "A reporting workflow built on unified operational datasets, SQL analysis, and BI dashboards that tracked production KPIs, variance patterns, and anomaly trends for leadership review.",
      implementation: [
        "Analyzed manufacturing data across more than five business units using SQL window functions, CTEs, and Python.",
        "Built Tableau and Power BI dashboards with DAX scripting to track more than 10 production KPIs in near real time.",
        "Investigated ERP discrepancies and implemented automated validation rules to reduce reporting errors and speed turnaround.",
      ],
      decisions: [
        {
          title: "Reusable KPI layer",
          detail: "Centered the reporting workflow on stable KPI definitions so executive reviews and analyst drilldowns referenced the same analytical logic.",
        },
        {
          title: "Self-serve with guardrails",
          detail: "Expanded dashboard access only alongside validation rules so leaders could move faster without increasing mistrust in the numbers.",
        },
        {
          title: "Operational storytelling",
          detail: "Designed dashboards to explain anomalies and variance patterns clearly instead of only listing metric totals.",
        },
      ],
      flow: "Operational Data -> SQL Analysis -> KPI Modeling -> Tableau & Power BI Dashboards -> Leadership Reporting",
      challenges: [
        "Keeping KPI definitions and analytical logic consistent across business units and reporting cycles.",
        "Balancing executive-ready simplicity with the deeper drilldowns analysts needed for root-cause work.",
      ],
      impactMetrics: [
        {
          label: "Business Units",
          value: "5+",
          detail: "One reporting workflow served multiple operating groups with shared KPI logic.",
        },
        {
          label: "Operational Decisions",
          value: "$500K+",
          detail: "The dashboards supported substantial cost and variance review decisions.",
        },
        {
          label: "Ad Hoc Requests",
          value: "-35%",
          detail: "Self-serve reporting reduced repeated manual analysis work.",
        },
      ],
      outcomes: [
        "Supported more than $500K in operational decisions by surfacing cost anomalies and variance trends clearly.",
        "Reduced ad hoc data requests by 35% through self-serve KPI dashboards.",
        "Cut reporting errors and turnaround time by 40% with automated validation rules.",
      ],
      lessons: [
        "Analytical trust comes from stable KPI definitions and validation, not just attractive dashboards.",
        "Self-serve reporting only works when the underlying logic is consistent enough for leaders to rely on it repeatedly.",
      ],
    },
  ],
  experience: [
    {
      company: "Rutgers University",
      role: "Graduate Research Assistant",
      period: "Sep 2025 - Present",
      description: [
        "Performed ANOVA, PCA, and multivariate regression on biochemical datasets and delivered stakeholder-ready reports on 15 actionable oxidation markers.",
        "Designed structured transformation workflows and data governance practices that maintained 90% data integrity across analytical reporting.",
        "Automated reporting workflows with Azure Data Factory, Python, and Power BI dashboards to reduce manual data-cleaning time by 30%.",
      ],
      skills: ["SQL", "Power BI", "Python", "Data Governance", "Stakeholder Reporting"],
    },
    {
      company: "Sonaflex Industries",
      role: "Data Analyst",
      period: "Jun 2023 - Jun 2024",
      description: [
        "Analyzed manufacturing operations data across more than five business units using SQL and Python, driving more than $500K in operational decisions.",
        "Built Tableau and Power BI dashboards with DAX to track more than 10 production KPIs and cut ad hoc data requests by 35%.",
        "Investigated ERP discrepancies and implemented automated validation rules that reduced reporting errors and turnaround time by 40%.",
      ],
      skills: ["SQL", "Power BI", "Tableau", "DAX", "Python"],
    },
    {
      company: "Maharashtra State Electricity Board",
      role: "Data Analyst Intern",
      period: "Jun 2022 - Dec 2022",
      description: [
        "Examined electricity consumption and weather trends to improve grid capacity planning accuracy by 15% for regional operations managers.",
        "Validated operational data with SQL audit scripts and designed Power BI dashboards tracking utilization, outages, and load-distribution KPIs.",
        "Translated bi-weekly findings into recommendations for regional planning teams across Agile sprint cycles.",
      ],
      skills: ["SQL", "Power BI", "Forecasting", "Stakeholder Presentations", "Agile Delivery"],
    },
  ],
  education: [
    {
      school: "Rutgers University - New Brunswick",
      degree: "Master of Science in Data Science",
      period: "Sep 2024 - May 2026",
      location: "New Brunswick, USA",
      details: [
        "GPA: 3.5",
        "Coursework: Regression & Time Series Analysis, Applied Statistics & Experimental Design, Data Wrangling & Visualization, Business Intelligence, Advanced Database Management",
      ],
    },
    sharedEducation[1],
  ],
  certifications: [
    { name: "Google Data Analytics Certificate", issuer: "Google", date: "Listed on resume" },
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Listed on resume" },
  ],
  sectionCopy: {
    about: {
      eyebrow: "About Me",
      title: "Turning operational data into reporting teams can actually act on.",
      impactLabel: "Insight Snapshot",
      focusLabel: "Focus Areas",
    },
    skills: {
      eyebrow: "Capabilities",
      title: "SQL analysis, dashboard delivery, and stakeholder-facing insight work.",
      description:
        "Experience across KPI design, reporting automation, variance analysis, forecasting support, and BI workflows that help teams move from raw data to business action.",
    },
    projects: {
      eyebrow: "Case Studies",
      title: "Selected Analytics Work",
      description:
        "Projects centered on dashboards, risk analysis, market insight communication, and the reporting discipline required to make analytical results useful to decision-makers.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experience shaped by analysis that drives decisions.",
      description:
        "Across manufacturing, grid operations, and research reporting, the focus has been translating data into trusted metrics, dashboards, and operational guidance.",
    },
    education: {
      eyebrow: "Education",
      title: "Graduate work aligned with analytical communication and BI delivery.",
      description:
        "Coursework in applied statistics, business intelligence, and advanced database management supports the analytical and reporting work across the portfolio.",
    },
    contact: {
      eyebrow: "Get in Touch",
      title: "Let's talk about analytics that lead to clearer decisions.",
      description:
        "Open to data analyst and BI roles focused on SQL analysis, executive dashboards, reporting automation, and stakeholder-facing insight delivery.",
      chips: ["Data Analytics", "BI Dashboards", "SQL Reporting"],
      reachLabel: "Best Way To Reach Me",
    },
  },
  footer: {
    tagline: "Building trusted dashboards, analytical workflows, and reporting systems that teams can act on.",
  },
};

export const portfolioProfiles: Record<ProfileSlug, PortfolioData> = {
  dataengineer: dataEngineerProfile,
  softwareengineer: softwareEngineerProfile,
  datascientist: dataScientistProfile,
  datanalyst: dataAnalystProfile,
};
