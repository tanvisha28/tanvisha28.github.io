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
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "Tanvisha Kose",
    headline: "Data Engineer | AI Systems Builder | Data Scientist",
    about: [
      "I build production-grade data and AI systems that move from experimentation to dependable business tooling.",
      "My work sits at the intersection of scalable pipelines, intelligent automation, and measurable product outcomes.",
    ],
    focusAreas: [
      "Data platform architecture",
      "LLM-powered workflows",
      "Applied machine learning systems",
    ],
    email: "tanvisha.kose@example.com",
    linkedin: "https://linkedin.com/in/tanvishakose",
    github: "https://github.com/tanvishakose",
    resume: "#",
    location: "San Francisco, CA",
  },
  metrics: [
    { label: "Pipelines Orchestrated", value: "50+" },
    { label: "Models Deployed", value: "12" },
    { label: "Data Processed/Day", value: "10TB+" },
    { label: "Agentic Workflows", value: "5" },
  ],
  skills: [
    {
      category: "Data Engineering",
      skills: ["Apache Spark", "Kafka", "Airflow", "dbt", "Snowflake", "Databricks", "Delta Lake"],
    },
    {
      category: "AI & ML Systems",
      skills: ["LangChain", "LlamaIndex", "Vector DBs (Pinecone/Milvus)", "PyTorch", "Hugging Face", "OpenAI/Gemini APIs"],
    },
    {
      category: "Data Science",
      skills: ["Python", "Pandas", "Scikit-Learn", "Anomaly Detection", "Time Series", "Feature Engineering"],
    },
    {
      category: "Cloud & MLOps",
      skills: ["AWS", "GCP", "Docker", "Kubernetes", "MLflow", "Terraform", "CI/CD"],
    },
  ],
  projects: [
    {
      id: "agentic-orchestrator",
      title: "Agentic Workflow Orchestrator",
      type: "AI",
      summary: "Multi-agent system for automated data analysis and report generation using LLMs and tool calling.",
      role: "AI Systems Engineer",
      domain: "AI / Automation",
      techStack: ["Python", "LangChain", "FastAPI", "React", "Pinecone", "OpenAI API"],
      problem: "Analysts spent 70% of their time gathering data from disparate sources and formatting reports rather than generating insights.",
      context: "Built an internal tool to automate the repetitive parts of financial and operational reporting.",
      goals: [
        "Create a flexible multi-agent architecture.",
        "Implement robust tool calling for database querying.",
        "Ensure deterministic and verifiable outputs from LLMs.",
      ],
      architecture: "Supervisor agent routing tasks to specialized worker agents (Data Retriever, Analyst, Writer) with a shared vector memory.",
      implementation: [
        "Developed custom LangChain tools to securely query internal SQL databases and APIs.",
        "Implemented a RAG pipeline using Pinecone to provide agents with historical context and company guidelines.",
        "Built a streaming React frontend to visualize the agent's thought process and intermediate steps.",
      ],
      flow: "User Request -> Supervisor Agent -> Task Delegation -> Tool Execution -> Synthesis -> Final Report.",
      challenges: [
        "Managing LLM hallucinations when dealing with precise financial data.",
        "Handling context window limits during complex, multi-step reasoning.",
      ],
      outcomes: [
        "Reduced report generation time from 4 hours to 5 minutes.",
        "Automated 15 standard weekly reports.",
        "Increased analyst bandwidth for strategic tasks by 40%.",
      ],
      lessons: [
        "Prompt engineering is brittle; robust tool design and structured outputs (JSON) are essential.",
        "Observability into the agent's 'scratchpad' is critical for debugging.",
      ],
    },
    {
      id: "lakehouse-platform",
      title: "Enterprise Data Lakehouse",
      type: "DE",
      summary: "Scalable modern data platform involving streaming ingestion, dbt transformations, and Delta Lake.",
      role: "Lead Data Engineer",
      domain: "E-commerce / Analytics",
      techStack: ["Spark", "Databricks", "Delta Lake", "Airflow", "dbt", "Kafka"],
      problem: "Legacy data warehouse couldn't handle the volume of clickstream data, leading to 24-hour delays in analytics.",
      context: "Modernizing the data stack for a high-volume e-commerce platform to enable real-time personalization.",
      goals: [
        "Unify batch and streaming data ingestion.",
        "Implement a Medallion architecture (Bronze/Silver/Gold).",
        "Ensure data quality and pipeline observability.",
      ],
      architecture: "Event-driven ingestion via Kafka, processed by Spark Structured Streaming into Delta Lake, orchestrated by Airflow.",
      implementation: [
        "Designed a multi-layered storage strategy using Delta Lake for ACID transactions and time travel.",
        "Built automated data quality checks using Great Expectations integrated into Airflow DAGs.",
        "Migrated 500+ legacy SQL scripts to modular, tested dbt models.",
      ],
      flow: "Kafka/S3 -> Bronze (Raw) -> Silver (Cleaned/Joined) -> Gold (Aggregated/Business-Ready) -> BI/ML.",
      challenges: [
        "Managing schema evolution across hundreds of rapidly changing source tables.",
        "Optimizing Spark streaming jobs for cost-efficiency and low latency.",
      ],
      outcomes: [
        "Reduced data latency from 24 hours to under 5 minutes.",
        "Enabled real-time recommendation engines.",
        "Lowered cloud compute costs by 30% through optimized resource allocation.",
      ],
      lessons: [
        "Data contracts are essential for maintaining pipeline stability across teams.",
        "Treat data as a product; apply software engineering best practices (CI/CD, testing) to data pipelines.",
      ],
    },
    {
      id: "anomaly-detection",
      title: "Real-time Anomaly Engine",
      type: "DS",
      summary: "Machine learning system for detecting fraudulent transactions and system anomalies in real-time.",
      role: "Data Scientist",
      domain: "FinTech / Security",
      techStack: ["Python", "PyTorch", "Scikit-Learn", "MLflow", "Redis", "FastAPI"],
      problem: "Rule-based fraud detection systems were generating too many false positives and missing novel attack vectors.",
      context: "Developed a hybrid ML system to protect a payment gateway processing millions of transactions daily.",
      goals: [
        "Identify anomalous patterns with high precision and low latency (<50ms).",
        "Provide explainable scores for human review.",
        "Implement continuous model retraining.",
      ],
      architecture: "Streaming feature calculation in Redis, scored by a hybrid Isolation Forest and Deep Autoencoder model served via FastAPI.",
      implementation: [
        "Engineered 100+ real-time features including velocity metrics and behavioral embeddings.",
        "Trained an Autoencoder to learn the manifold of 'normal' transactions, flagging high reconstruction errors.",
        "Implemented SHAP to provide human-readable reasoning for each anomaly score.",
      ],
      flow: "Transaction -> Feature Store (Redis) -> Model Inference -> Score & Explanation -> Action/Review.",
      challenges: [
        "Dealing with highly imbalanced datasets (fraud is rare).",
        "Meeting strict latency requirements for synchronous payment authorization.",
      ],
      outcomes: [
        "Increased fraud detection rate by 45% compared to legacy systems.",
        "Reduced false positive rate by 30%, saving manual review time.",
        "Maintained 99.9% availability with p95 latency under 35ms.",
      ],
      lessons: [
        "Feature engineering often yields higher ROI than complex model architectures.",
        "Model explainability is crucial for operational adoption and compliance.",
      ],
    },
  ],
  experience: [
    {
      company: "DataTech Solutions",
      role: "Senior Data & AI Engineer",
      period: "2022 - Present",
      description: [
        "Architected a scalable data lakehouse processing 5TB+ daily using Databricks and Delta Lake.",
        "Led the development of an internal LLM-powered coding assistant, improving developer velocity by 15%.",
        "Implemented MLOps pipelines using MLflow and GitHub Actions for automated model deployment.",
      ],
      skills: ["Databricks", "Spark", "Airflow", "LLMs", "MLOps"],
    },
    {
      company: "FinServe Analytics",
      role: "Data Scientist",
      period: "2020 - 2022",
      description: [
        "Developed predictive models for customer churn, resulting in a 10% increase in retention.",
        "Built and maintained ETL pipelines to feed machine learning models using Python and Airflow.",
        "Created interactive dashboards using Streamlit to visualize model performance and business metrics.",
      ],
      skills: ["Python", "Scikit-Learn", "SQL", "Streamlit"],
    },
  ],
  certifications: [
    { name: "Databricks Certified Data Engineer Professional", issuer: "Databricks", date: "2023" },
    { name: "AWS Certified Machine Learning – Specialty", issuer: "Amazon Web Services", date: "2022" },
    { name: "Deep Learning Specialization", issuer: "Coursera (deeplearning.ai)", date: "2021" },
  ],
};
