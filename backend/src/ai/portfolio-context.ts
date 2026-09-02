// Canonical portfolio context for AI.
// Factual source of truth for chnetaji.com portfolio conversations.

export const PORTFOLIO_CONTEXT = `
<PORTFOLIO>

<IDENTITY>
name: CH Netaji Bhadraiahnath Chowdary
preferred_name: Netaji
location: Chennai, India
email: chnetajibc@gmail.com
linkedin: linkedin.com/in/chnetaji
professional_focus:
  • Software Engineering
  • Backend Engineering
  • AI/ML Engineering
</IDENTITY>


<EDUCATION>
degree: B.E. Computer Science and Engineering
specialization: Data Science
institution: Sathyabama Institute of Science & Technology
location: Chennai
period: 2022 - 2026
cgpa: 9.0/10
</EDUCATION>


<EXPERIENCE>

<ROLE id="amazon">
company: Amazon
role: SDE Intern
team: Alexa+
location: Bengaluru, India
period: January 2026 - June 2026
employment_type: Internship

<WORK id="amazon_playback">
topic: Alexa+ playback termination / error classification

technology_usage:
  • error classification models
  • downstream service integrations
  • audio telemetry
  • device configuration events

work:
  • Engineered an Alexa+ 1P Expert.
  • Used error classification models and downstream service integrations.
  • Correlated audio telemetry with device configuration events.
  • Contextualized ambiguous "Why did you stop?" playback termination utterances.
  • Produced actionable responses from the contextualized termination information.
</WORK>


<WORK id="amazon_spotify">
topic: Alexa+ Spotify voice integration

technology_usage:
  • Alexa Skills Kit (ASK)
  • MCP AddOn delegation
  • 3P audio partner integration
  • prompt optimization
  • feature gating
  • AWS CDK

work:
  • Developed an Alexa+ 1P Expert.
  • Integrated a 3P audio partner using MCP AddOn delegation.
  • Enabled voice-controlled interactions with Spotify.
  • Implemented prompt optimization.
  • Implemented feature gating for allowlisted customers.
  • Used AWS CDK for skill deployment.

result:
  latency: under 1 second
</WORK>


<WORK id="amazon_video">
topic: Echo Show video ad playback

technology_usage:
  • codec analysis
  • bitrate analysis
  • hardware acceleration

work:
  • Analyzed video codec formats and bitrate efficiency across Echo Show devices.
  • Worked on hardware acceleration strategies.
  • Targeted near-zero CPU, GPU, and RAM overhead while maintaining media rendering.
</WORK>


<WORK id="amazon_ui">
topic: Adaptive Echo Show UI

technology_usage:
  • React-Native

work:
  • Styled adaptive UI components in React-Native.
  • Supported responsive rendering across Echo Show display form factors.
</WORK>

</ROLE>


<ROLE id="detect">
company: Detect Technologies
role: AI Engineering Intern
location: Chennai, India
period: September 2025 - November 2025
employment_type: Internship

<WORK id="detect_maas">
topic: Model-as-a-Service platform

technology_usage:
  • Triton Inference Server
  • deep-learning models
  • APIs

work:
  • Designed an internal Model-as-a-Service platform.
  • Used Triton Inference Server for model serving.
  • Exposed deep-learning models through APIs.
  • Simplified model integration for software teams.
</WORK>


<WORK id="detect_synthetic_data">
topic: Synthetic dataset generation framework

technology_usage:
  • multi-model orchestration
  • image generation
  • image editing

work:
  • Architected a modular synthetic dataset generation framework.
  • Orchestrated multiple AI models.
  • Automated image generation and editing.
  • Supported enterprise model-training dataset creation.
</WORK>

</ROLE>


<ROLE id="smilo">
company: SMILO / Smilo Data Consultancy
role: Intern
location: Remote
period: May 2025 - August 2025
employment_type: Internship

technology_usage:
  • Python
  • FastAPI
  • Autotask
  • Datto RMM
  • RAG
  • vector search

work:
  • Engineered an end-to-end automation pipeline using FastAPI.
  • Integrated Autotask and Datto RMM.
  • Implemented RAG-based vector search.
  • Retrieved relevant SOPs in real time.
  • Generated contextual script recommendations.
  • Integrated remote remediation execution.
</ROLE>


<ROLE id="hcl">
company: HCLTech
role: Project Intern
location: Remote
period: July 2024 - October 2024
employment_type: Internship

technology_usage:
  • LSTM
  • MFCC
  • temporal audio segmentation
  • parallelized inference
  • result aggregation

work:
  • Trained an LSTM-based Voice Emotion Recognition model.
  • Used MFCC features extracted from audio clips.
  • Implemented temporal audio segmentation.
  • Used parallelized inference and result aggregation.
  • Performed multi-class emotional classification.

result:
  processing_latency_reduction: 30%
</ROLE>

</EXPERIENCE>


<PROJECTS>

<PROJECT id="cti_threat_analyser">
name: CTI Threat Analyser

technology_usage:
  • Python
  • Flask
  • LLM
  • MITRE ATT&CK

work:
  • Built backend infrastructure for Cyber Threat Intelligence.
  • Automated ingestion of unstructured threat reports.
  • Normalized threat-report data.
  • Used LLMs to extract threat entities.
  • Mapped extracted entities to MITRE ATT&CK tactics.
  • Built an LLM-powered cybersecurity chatbot.
  • Supported context-aware analysis and mitigation recommendations.
</PROJECT>


<PROJECT id="image_recognition_chatbot">
name: Image Recognition Chatbot

technology_usage:
  • Ollama
  • Llama 3.1:7b
  • Salesforce BLIP
  • local/on-device AI

domain:
  electronics

work:
  • Built an interactive local AI chatbot.
  • Used Ollama with Llama 3.1:7b for text generation.
  • Used Salesforce BLIP for domain-specific image recognition.

result:
  accuracy: 70%
</PROJECT>

</PROJECTS>


<TECHNICAL_SKILLS>

<PROGRAMMING_LANGUAGES>
• Python
• JavaScript
• TypeScript
• Java
• C
• Rust
• Go
</PROGRAMMING_LANGUAGES>

<AI_ML_FRAMEWORKS>
• PyTorch
• TensorFlow
• LangChain
• LangGraph
</AI_ML_FRAMEWORKS>

<WEB_FRAMEWORKS>
• FastAPI
• Flask
• React.js
• Next.js
• React-Native
• Express.js
</WEB_FRAMEWORKS>

<DATABASES>
• Redis
• MongoDB
• DynamoDB
• Pinecone
• MySQL
• PostgreSQL
• ChromaDB
</DATABASES>

<TOOLS_AND_INFRASTRUCTURE>
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
</TOOLS_AND_INFRASTRUCTURE>

IMPORTANT:
The skills above are skills listed on the portfolio.
Only the technology mappings explicitly documented under EXPERIENCE or PROJECTS establish where a technology was actually used.
</TECHNICAL_SKILLS>


<ACHIEVEMENTS>

<ACHIEVEMENT id="leetcode">
activity: LeetCode
result:
  • 250+ problems solved
  • 50+ day streak
period: 2024
focus:
  • algorithms
  • data structures
</ACHIEVEMENT>

<ACHIEVEMENT id="makeathon">
event: Open Weaver & SIC Make-a-thon
result: 1st Place / Winner
date: February 2024
details:
  • 48-hour event
  • rapid digital product design and development
</ACHIEVEMENT>

<ACHIEVEMENT id="scholarship">
award: Chancellor's Merit Scholarship
institution: Sathyabama Institute of Science & Technology
date: July 2023
reason: academic excellence
</ACHIEVEMENT>

<ACHIEVEMENT id="wartech">
event: WARTECH - Play with Python
result: Winner
date: April 2023
details:
  • Python programming and debugging contest
  • competed against 80+ competitors
</ACHIEVEMENT>

</ACHIEVEMENTS>


<PUBLICATION>

title: Data Analytics Using Agentic AI
status: To appear in IEEE Xplore
date: April 2026

work:
  • Describes a multi-agent AI system for data analytics.
  • Uses MCP tools.
  • Introduces an Interaction Gateway (IG).
  • Uses the Interaction Gateway for context optimization.
  • Introduces a Semantic Structured Schema (SSS).
  • Uses SSS to render dynamic interactive visuals in the frontend.
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
Peer-driven AI community focused on practical ML/AI learning and hands-on projects outside academic coursework.

IMPORTANT:
This is community involvement, not employment.
</COMMUNITY>


<CONTACT>

email: chnetajibc@gmail.com
linkedin: linkedin.com/in/chnetajibc

</CONTACT>


<PROFESSIONAL_STATUS>

completed_degree: 2026

documented_experience_type:
  • internships
  • project-based work
  • academic/community technical work

IMPORTANT:
Do not describe Netaji as having full-time professional experience unless explicitly supported elsewhere in this context.

</PROFESSIONAL_STATUS>


</PORTFOLIO>
`;