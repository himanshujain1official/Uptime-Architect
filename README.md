## **The Story of Uptime Architect**

## Inspiration
As a 4th-semester BCA student balancing lectures with complex server management, I often found myself overwhelmed by alerts during class. I was inspired by the idea of a "Silent Sentinel"—a JARVIS-like assistant that doesn't just notify you that something is wrong, but has the "Deep Internet Wisdom" and technical knowledge to fix it autonomously while I'm busy in the lecture hall.

## What it does
Uptime Architect is an autonomous SRE (Site Reliability Engineering) agent. 
 **Semantic Brain:** It uses Elastic Cloud to perform semantic search across a massive knowledge base of **9.8 million characters** of technical manuals.
 **Silent Guard Protocol:** It detects user context (e.g., "In a BCA Lecture") and decides whether to alert the user or resolve the issue silently.
 **Tool Autonomy:** It can autonomously generate incident reports and repair plans in Google Docs using function calling.
 **Cyber-Forensic UI:** A high-contrast, minimalist terminal interface for professional infrastructure monitoring.

## How we built it
We utilized a modern, high-performance tech stack:
 **Frontend:** React with Vite, styled with a minimalist "Cyber-Forensic" aesthetic (Dark mode, high-contrast typography).
 **Backend:** FastAPI (Python 3.13) acting as the "Neural Link" between the UI and the AI.
 **LLM:** Gemini 2.5 Flash for rapid, high-context reasoning.
 **Search:** Elastic Cloud for handling the RAG (Retrieval-Augmented Generation) pipeline over a massive PDF dataset.
 **Security:** Implemented a secure "Command Buffer" for terminal-first interaction.

## Challenges we ran into
Building an agent with this much data wasn't easy. We faced:
 **The "Blackout" Bug:** Early versions of the dashboard crashed (black screen) due to React's strict handling of undefined functions. We solved this by implementing "Bulletproof" UI patterns and optional chaining.
 **Token Quotas:** Sending nearly 10 million characters to an LLM immediately hits API limits. 
 We overcame this by implementing a **Top-K Retrieval** strategy:
 
  $$K_{optimal} = \sum_{i=1}^{n} \text{Relevance}(doc_i)$$
  
  We only send the top 3 most relevant snippets to stay within the 250,000 token limit.
 **The "Dumb" Terminal:** Connecting a standard text input to an autonomous brain required rewriting the command handler to "Consult the Knowledge Base" rather than just looking for hardcoded keywords.

## Accomplishments that we're proud of
 **Stable Neural Link:** Achieving a stable connection between the React frontend and the Python backend with less than 150ms latency.
 **The Knowledge Scale:** Successfully indexing and querying nearly 10 million characters of technical data.
 **Autonomous Reasoning:** Watching the agent correctly identify a "Sierra Nevada" cooling failure based on a PDF manual I had never manually opened.

## What we learned
We learned the critical importance of **Token Optimization** and the "Top-K" strategy in RAG pipelines. We also gained deep experience in **API Handshaking** between TypeScript and Python, ensuring that data structures match perfectly to avoid "undefined" errors in the terminal.

## What's next for Uptime Architect
The next step is to expand the agent's "hands." I plan to integrate it with actual server SSH terminals to allow it to execute `systemctl restart` commands autonomously. I also want to build a "Collaborative Agent" mode where multiple Sentinel agents can talk to each other to solve cross-node infrastructure failures across the entire BCS Government College network.

To further our "Silent Guard" mission, we are:
 **MongoDB Integration:** Migrating our historical action logs to **MongoDB Atlas** for high-speed retrieval of past incident resolutions.
 **GitLab Automation:** Developing a **GitLab CI/CD** trigger that allows the agent to execute "Self-Healing" code rollbacks the moment a thermal throttle is detected.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
