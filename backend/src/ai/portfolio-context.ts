export const PORTFOLIO_CONTEXT = `
<PORTFOLIO>

<IDENTITY>
name: CH Netaji Bhadraiahnath Chowdary
preferred_name: Netaji
location: Chennai, India
email: chnetajibc@gmail.com
linkedin: linkedin.com/in/chnetajibc
professional_focus:
  • Software Engineering
  • Backend Engineering
  • AI/ML Engineering
</IDENTITY>

<EDUCATION>
degree: B.E. Computer Science and Engineering
specialization: Data Science
institution: Sathyabama Institute of Science & Technology
location: Chennai, India
period: 2022 - 2026
cgpa: 9.0/10
</EDUCATION>

<PROFESSIONAL_STATUS>
degree_completed: 2026
documented_professional_experience:
  • internships
  • project-based work

full_time_employment_documented: no
availability_or_notice_period: not documented
</PROFESSIONAL_STATUS>


<EXPERIENCE>

<EXPERIENCE id="amazon">
company: Amazon
role: SDE Intern
team: Alexa+
location: Bengaluru, India
period: January 2026 - June 2026
type: internship

<WORK id="playback">
topic: Alexa+ playback termination

used:
  • error classification models
  • downstream service integrations
  • audio telemetry
  • device configuration events

built_or_implemented:
  • Engineered an Alexa+ 1P Expert.
  • Used error classification models and downstream service integrations.
  • Correlated audio telemetry with device configuration events.
  • Contextualized ambiguous "Why did you stop?" playback termination utterances.
</WORK>

<WORK id="spotify">
topic: Spotify voice integration

used:
  • Alexa Skills Kit (ASK)
  • MCP AddOn delegation
  • 3P audio partner integration
  • prompt optimization
  • feature gating
  • AWS CDK

built_or_implemented:
  • Developed an Alexa+ 1P Expert.
  • Integrated a 3P audio partner through MCP AddOn delegation.
  • Enabled voice-controlled Spotify interactions.
  • Implemented prompt optimization.
  • Implemented feature gating for allowlisted customers.
  • Used AWS CDK for skill deployment.

result:
  latency: under 1 second
</WORK>

<WORK id="video">
topic: Echo Show video ad playback

used:
  • codec analysis
  • bitrate analysis
  • hardware acceleration

built_or_implemented:
  • Analyzed codec formats and bitrate efficiency.
  • Worked on hardware acceleration strategies.
  • Targeted near-zero CPU, GPU and RAM overhead while maintaining media rendering.
</WORK>

<WORK id="adaptive-ui">
topic: Adaptive Echo Show UI

used:
  • React-Native

built_or_implemented:
  • Styled adaptive UI components.
  • Supported responsive rendering across Echo Show display form factors.
</WORK>

</EXPERIENCE>


<EXPERIENCE id="detect">
company: Detect Technologies
role: AI Engineering Intern
location: Chennai, India
period: September 2025 - November 2025
type: internship

<WORK id="maas">
topic: Model-as-a-Service platform

used:
  • Triton Inference Server
  • deep-learning models
  • APIs

built_or_implemented:
  • Designed an internal Model-as-a-Service platform.
  • Used Triton Inference Server for model serving.
  • Exposed deep-learning models through APIs.
  • Simplified model integration for software teams.
</WORK>

<WORK id="synthetic-data">
topic: Synthetic dataset generation

used:
  • multiple AI models
  • image generation
  • image editing
  • multi-model orchestration

built_or_implemented:
  • Architected a modular synthetic dataset generation framework.
  • Orchestrated multiple models.
  • Automated image generation and editing.
  • Supported dataset creation for enterprise model training.
</WORK>

</EXPERIENCE>


<EXPERIENCE id="smilo">
company: SMILO / Smilo Data Consultancy
role: Intern
location: Remote
period: May 2025 - August 2025
type: internship

used:
  • Python
  • FastAPI
  • Autotask
  • Datto RMM
  • RAG
  • vector search

built_or_implemented:
  • Engineered an end-to-end automation pipeline using FastAPI.
  • Integrated Autotask and Datto RMM.
  • Implemented RAG-based vector search.
  • Retrieved relevant SOPs in real time.
  • Generated script recommendations.
  • Integrated remote remediation execution.
</EXPERIENCE>


<EXPERIENCE id="hcl">
company: HCLTech
role: Project Intern
location: Remote
period: July 2024 - October 2024
type: internship

used:
  • LSTM
  • MFCC
  • temporal audio segmentation
  • parallelized inference
  • result aggregation

built_or_implemented:
  • Trained an LSTM-based Voice Emotion Recognition model.
  • Used MFCC audio features.
  • Implemented temporal audio segmentation.
  • Implemented parallelized inference and result aggregation.
  • Performed multi-class emotional classification.

result:
  processing_latency_reduction: 30%
</EXPERIENCE>

</EXPERIENCE>


<PROJECTS>

<PROJECT id="cti">
name: CTI Threat Analyser

used:
  • Python
  • Flask
  • LLM
  • MITRE ATT&CK

built_or_implemented:
  • Built backend infrastructure for CTI report ingestion and normalization.
  • Used LLMs to extract threat entities.
  • Mapped threat entities to MITRE ATT&CK tactics.
  • Built an LLM-powered cybersecurity chatbot.
  • Supported context-aware analysis and mitigation recommendations.
</PROJECT>

<PROJECT id="image-chatbot">
name: Image Recognition Chatbot

domain: electronics

used:
  • Ollama
  • Llama 3.1:7b
  • Salesforce BLIP
  • local/on-device AI

built_or_implemented:
  • Built an interactive local AI chatbot.
  • Used Llama 3.1:7b for text generation.
  • Used Salesforce BLIP for domain-specific image recognition.

result:
  accuracy: 70%
</PROJECT>

</PROJECTS>


<SKILLS>

programming_languages:
  • Python
  • JavaScript
  • TypeScript
  • Java
  • C
  • Rust
  • Go

ai_ml_frameworks:
  • PyTorch
  • TensorFlow
  • LangChain
  • LangGraph

web_frameworks:
  • FastAPI
  • Flask
  • React.js
  • Next.js
  • React-Native
  • Express.js

databases:
  • Redis
  • MongoDB
  • DynamoDB
  • Pinecone
  • MySQL
  • PostgreSQL
  • ChromaDB

tools:
  • AWS
  • GCP
  • Docker
  • Linux
  • Git
  • Postman
  • Swagger
  • Figma
  • Flipper
  • MCP

NOTE:
Skills indicate technologies listed by Netaji.
Actual project or professional usage is established only where explicitly documented in EXPERIENCE or PROJECTS.

</SKILLS>


<ACHIEVEMENTS>

<ACHIEVEMENT>
name: LeetCode
period: 2024
results:
  • 250+ problems solved
  • 50+ day streak
focus:
  • algorithms
  • data structures
</ACHIEVEMENT>

<ACHIEVEMENT>
name: Open Weaver & SIC Make-a-thon
date: February 2024
result: Winner / 1st Place
details:
  • 48-hour event
  • rapid digital product design and development
</ACHIEVEMENT>

<ACHIEVEMENT>
name: Chancellor's Merit Scholarship
date: July 2023
institution: Sathyabama Institute of Science & Technology
reason: academic excellence
</ACHIEVEMENT>

<ACHIEVEMENT>
name: WARTECH - Play with Python
date: April 2023
result: Winner
details:
  • Python programming and debugging contest
  • 80+ competitors
</ACHIEVEMENT>

</ACHIEVEMENTS>


<PUBLICATION>
title: Data Analytics Using Agentic AI
status: To appear in IEEE Xplore
date: April 2026

work:
  • Multi-agent AI system for data analytics.
  • MCP tools.
  • Interaction Gateway for context optimization.
  • Semantic Structured Schema for dynamic interactive frontend visuals.
</PUBLICATION>


<CERTIFICATIONS>
• Python for Data Science — NPTEL / IIT Madras
• Introduction to Neural Networks & PyTorch — Coursera / IBM
</CERTIFICATIONS>


<COMMUNITY>
organization: HiveMind AI Community
role: Member
period: January 2025 - December 2025

description:
Peer-driven AI community focused on practical ML/AI learning and hands-on ML/AI projects.

type:
community involvement, not employment
</COMMUNITY>


<CONTACT>
email: chnetajibc@gmail.com
linkedin: linkedin.com/in/chnetajibc
</CONTACT>

</PORTFOLIO>
`;