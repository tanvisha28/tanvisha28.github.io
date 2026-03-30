/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  type: 'AI' | 'DE' | 'DS';
  summary: string;
  role: string;
  domain: string;
  techStack: string[];
  problem: string;
  context: string;
  goals: string[];
  architecture: string;
  implementation: string[];
  flow: string;
  challenges: string[];
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
}

const basePublicPath = import.meta.env.BASE_URL || "/";

export const portfolioData: PortfolioData = {
  personal: {
    name: "Tanvisha Kose",
    headline: "Data Engineer | Cloud Data Platforms | Applied ML",
    about: [
      "I build cloud data systems that turn fragmented operational signals into reliable, analytics-ready datasets for teams that need trustworthy reporting and decision support.",
      "My work spans ETL and ELT pipelines, warehousing, orchestration, and data quality across AWS and Azure, with a focus on production reliability rather than one-off analysis.",
      "Alongside that engineering foundation, my graduate work at Rutgers centers on applied data science, monitored forecasting workflows, and governed research data that can stand up in real delivery environments.",
    ],
    focusAreas: [
      "ETL & data platforms",
      "Cloud orchestration",
      "Warehousing & governance",
      "Forecasting & monitoring",
    ],
    email: "tankose411@gmail.com",
    linkedin: "https://www.linkedin.com/in/tanvisha-kose411/",
    github: "https://github.com/tanvisha28",
    resume: `${basePublicPath}resume.pdf`,
    location: "New Brunswick, NJ",
  },
  metrics: [
    { label: "Industry Experience", value: "1+ Years" },
    { label: "Flight Records Modeled", value: "2.15M+" },
    { label: "Reaction Markers", value: "15" },
    { label: "Forecast Lift", value: "+15%" },
  ],
  skills: [
    {
      category: "Languages & Data",
      skills: ["Python", "SQL", "Scala", "R", "NoSQL", "REST APIs"],
    },
    {
      category: "Cloud & Orchestration",
      skills: ["AWS", "Azure Data Factory", "Airflow", "Azure DevOps", "GitHub Actions", "Step Functions"],
    },
    {
      category: "Big Data & Warehousing",
      skills: ["Databricks", "PySpark", "Kafka", "Snowflake", "Redshift", "dbt"],
    },
    {
      category: "Quality, BI & Delivery",
      skills: ["Data Quality Rules", "Metadata Management", "Power BI", "Tableau", "Docker", "Kubernetes"],
    },
  ],
  projects: [
    {
      id: "agentic-orchestrator",
      title: "Multi-Signal Market Forecasting Pipeline",
      type: "AI",
      summary: "End-to-end forecasting workflow that combined market indicators with Reddit and New York Times sentiment to build a monitored, decision-ready dataset for stock trend analysis.",
      role: "Data Science Graduate Student",
      domain: "Financial Forecasting / Applied ML",
      techStack: ["Python", "SQL", "Plotly", "Reddit API", "NYT API", "Walk-Forward Testing"],
      problem: "Forecasting experiments were scattered across raw market data, external sentiment feeds, and one-off notebooks, making it difficult to compare signals or trust results over time.",
      context: "Developed as a resume-backed academic project to connect technical indicators with public sentiment and package the work as a reproducible forecasting pipeline rather than a one-time analysis.",
      goals: [
        "Unify price history, technical indicators, and external sentiment in one dependable feature pipeline.",
        "Add repeatable validation and data checks before using the dataset for forecasting experiments.",
        "Expose market signals in a format both technical and non-technical stakeholders could interpret quickly.",
      ],
      architecture: "Automated ingestion pipeline collecting market series, Reddit sentiment, and New York Times signals, transforming them into a unified feature layer for forecasting experiments, validation, and dashboard reporting.",
      implementation: [
        "Built automated ingestion and transformation logic that combined technical indicators with sentiment features sourced from Reddit and New York Times APIs.",
        "Implemented walk-forward validation and pipeline-level quality checks so forecast experiments could be evaluated under more realistic market conditions.",
        "Created interactive Plotly dashboards to surface market signal trends, validation outputs, and data-quality views for broader stakeholder consumption.",
      ],
      flow: "Market Data + Sentiment APIs -> Feature Engineering -> Validation & Monitoring -> Forecast Experiments -> Plotly Dashboards",
      challenges: [
        "Aligning sentiment feeds with market time windows so signals remained analytically meaningful.",
        "Designing validation that reflected shifting market conditions instead of overfitting to a single historical slice.",
      ],
      outcomes: [
        "Automated a reusable forecasting dataset that merged market, indicator, and sentiment signals in one monitored workflow.",
        "Reduced manual dataset preparation by replacing ad hoc assembly with scheduled ingestion, transformation, and validation steps.",
        "Delivered stakeholder-friendly dashboards that made market signal quality and forecast inputs easier to inspect.",
      ],
      lessons: [
        "Forecasting reliability depends as much on disciplined validation and monitoring as it does on feature design.",
        "Sentiment features become far more useful when their collection cadence is aligned tightly with the time series they are meant to explain.",
      ],
    },
    {
      id: "lakehouse-platform",
      title: "Manufacturing Telemetry Lakehouse",
      type: "DE",
      summary: "AWS and Databricks data platform that unified manufacturing telemetry, ERP, and finance data into curated Bronze, Silver, and Gold layers for operations reporting.",
      role: "Data Engineer",
      domain: "Manufacturing Analytics / Data Platform",
      techStack: ["Python", "SQL", "AWS", "Databricks", "Airflow", "Snowflake"],
      problem: "Operational telemetry, ERP records, and finance data lived in disconnected systems, slowing reporting and making plant performance analysis harder to trust across teams.",
      context: "Built during industry experience at Sonaflex Industries to centralize production data and create analytics-ready models for operations, maintenance, and business reporting.",
      goals: [
        "Unify batch and near-real-time ingestion across machine, ERP, and business systems.",
        "Create layered Bronze, Silver, and Gold models that standardized data for downstream reporting.",
        "Increase reliability with testing, monitoring, and production-grade data quality checks.",
      ],
      architecture: "AWS-based ingestion and Databricks transformation stack moving source data through Bronze, Silver, and Gold layers before publishing curated warehouse models in Snowflake and Redshift for consumption.",
      implementation: [
        "Built and maintained ETL and ELT pipelines using Python, SQL, S3, Glue, Databricks, Airflow, and PySpark to integrate telemetry, ERP, and financial datasets.",
        "Designed Bronze, Silver, and Gold data layers plus curated warehouse models in Snowflake and Redshift to standardize schemas and create analytics-ready datasets.",
        "Added data quality checks, automated testing, and monitoring so production pipelines were easier to trust and troubleshoot.",
      ],
      flow: "Telemetry + ERP + Finance Sources -> AWS Ingestion -> Databricks Transformations -> Bronze/Silver/Gold Models -> Snowflake/Redshift Consumption",
      challenges: [
        "Balancing batch and near-real-time delivery needs across machine sensor streams and business-source refreshes.",
        "Maintaining trustworthy schemas and data quality across heterogeneous operational and financial inputs.",
      ],
      outcomes: [
        "Improved data freshness for equipment monitoring, downtime tracking, and production performance reporting.",
        "Enabled predictive maintenance analysis, plant performance dashboards, and recurring business reviews from shared curated models.",
        "Increased trust in production data through monitoring, automated testing, and explicit quality checks.",
      ],
      lessons: [
        "Layered warehouse models make it easier for operations, finance, and analytics teams to consume the same platform confidently.",
        "Production data platforms earn adoption through observability and testing as much as through raw ingestion throughput.",
      ],
    },
    {
      id: "anomaly-detection",
      title: "Airline Resilience & Sentiment Drift Monitor",
      type: "DS",
      summary: "Distributed PySpark and MLOps workflow that monitored airline delay patterns and sentiment drift across 2.15M+ flight records, improving forecast reliability over seasonal changes.",
      role: "Data Science Graduate Student",
      domain: "Transportation Analytics / MLOps",
      techStack: ["PySpark", "SQL", "Evidently AI", "MLflow", "Python", "Window Functions"],
      problem: "Airline delay and sentiment behavior shifted across routes and seasons, making static analyses stale and leaving teams slow to react when model assumptions drifted.",
      context: "Developed as a resume-backed project focused on resilience analytics, route-level delay behavior, and monitored model performance over a large historical flight dataset.",
      goals: [
        "Process 2.15M+ flight records in a distributed workflow suitable for route and season-level analysis.",
        "Detect sentiment and performance drift automatically so model degradation was visible earlier.",
        "Reduce manual reporting while giving stakeholders a clearer view of reliability risks across time and geography.",
      ],
      architecture: "Distributed feature pipeline built with PySpark and SQL window functions, with MLflow tracking experiments and Evidently AI monitoring sentiment and model drift across seasonal cohorts.",
      implementation: [
        "Built a distributed PySpark pipeline over 2.15M+ flight records and used SQL window functions to analyze delay behavior across more than 50 routes.",
        "Implemented automated drift detection with Evidently AI and MLflow to monitor performance degradation and sentiment shifts across seasonal data changes.",
        "Structured the workflow to reduce manual reporting effort and surface retraining signals earlier in the model lifecycle.",
      ],
      flow: "Flight Records -> PySpark Processing -> Route & Delay Features -> Drift Monitoring -> Performance Review -> Retraining Signals",
      challenges: [
        "Separating genuine model drift from normal seasonal variation across routes and operating periods.",
        "Designing a monitoring approach that stayed useful for both analytical reporting and MLOps decision-making.",
      ],
      outcomes: [
        "Processed 2.15M+ flight records in a pipeline that reduced manual reporting effort by 40%.",
        "Reduced model retraining lag by 30% through automated drift detection across seasonal data shifts.",
        "Improved forecast reliability by pairing route-level temporal analysis with monitored model behavior.",
      ],
      lessons: [
        "Drift monitoring needs to live alongside the data pipeline, not as an afterthought after model training.",
        "Temporal and route-specific context matters when turning transportation data into reliable operational signals.",
      ],
    },
  ],
  experience: [
    {
      company: "Rutgers University",
      role: "Graduate Research Assistant",
      period: "Sep 2025 - Present",
      description: [
        "Architected high-integrity biochemical data lakes for lipid and cholesterol oxidation research with automated schema enforcement and metadata management.",
        "Engineered Python transformation pipelines using NumPy and scikit-learn to extract 15 critical reaction markers from multi-terabyte experimental datasets.",
        "Orchestrated cloud-native ingestion workflows in Azure Data Factory and connected CI/CD through GitHub Actions for version-controlled deployment across environments.",
      ],
      skills: ["Python", "scikit-learn", "Azure Data Factory", "GitHub Actions", "Metadata Management"],
    },
    {
      company: "Sonaflex Industries",
      role: "Data Engineer",
      period: "Jun 2023 - Jun 2024",
      description: [
        "Built and maintained ETL and ELT pipelines on AWS using Python, SQL, S3, Glue, Databricks, Airflow, and PySpark to centralize telemetry, ERP, and financial data.",
        "Developed batch and near-real-time ingestion workflows that improved freshness for equipment monitoring, downtime tracking, and production reporting.",
        "Designed Bronze, Silver, and Gold models plus curated warehouse layers in Snowflake and Redshift for operations, finance, and cross-functional analytics.",
        "Enabled predictive maintenance analysis, plant performance dashboards, and recurring business reviews from unified operational data models.",
        "Improved pipeline reliability through data quality checks, automated testing, and monitoring across production workflows.",
      ],
      skills: ["AWS", "Databricks", "Airflow", "PySpark", "Snowflake"],
    },
    {
      company: "Maharashtra State Electricity Board",
      role: "Data Analyst Intern",
      period: "Jun 2022 - Dec 2022",
      description: [
        "Implemented distributed time-series forecasting pipelines in Databricks and integrated weather API data to improve demand prediction accuracy by 15%.",
        "Automated SQL-based reconciliation scripts with embedded audit logic and Power BI connectivity to support capacity planning and grid operations.",
        "Used JIRA-driven sprint execution and bi-weekly stakeholder reporting to keep analytical delivery aligned with operational priorities.",
      ],
      skills: ["Databricks", "SQL", "Power BI", "Forecasting", "Agile Delivery"],
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
  ],
  certifications: [
    { name: "AWS Certified Data Engineer", issuer: "Amazon Web Services", date: "Listed on resume" },
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Listed on resume" },
  ],
};
