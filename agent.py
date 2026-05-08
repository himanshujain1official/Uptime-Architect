import os
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from pathlib import Path
from pydantic import BaseModel
from pypdf import PdfReader
from elasticsearch import Elasticsearch, helpers
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- 1. ELASTIC CONFIGURATION & TOOLING ---

# Your specific Elastic credentials
ELASTIC_ENDPOINT = "https://cc979ab6f7fa48b6bef22e877aa69258.asia-south1.gcp.elastic-cloud.com:443"

INDEX_NAME = "technical-parks" 

client = Elasticsearch(ELASTIC_ENDPOINT, api_key= os.getenv("ELASTIC_API_KEY"))

def semantic_search_elastic(query: str):
    """
    Performs a semantic search on Elastic logs/docs. 
    Use this to find deep technical meaning behind hardware alerts.
    """
    try:
        retriever_object = {
            "standard": {
                "query": {
                    "semantic": {
                        "field": "text", 
                        "query": query
                    }
                }
            }
        }
        search_response = client.search(
            index=INDEX_NAME,
            retriever=retriever_object,
        )
        # TRUNCATION FIX: We only take the top 3 hits to stay under the 250k token quota
        hits = [hit['_source']['text'] for hit in search_response['hits']['hits'][:3]]
        return hits if hits else "No relevant semantic data found."
    except Exception as e:
        return f"Elastic Search Error: {str(e)}"

def create_resolution_doc(title: str, content: str):
    """ACTION: Saves the final resolution plan to the system."""
    print(f"\n[ACTION] Generating Google Doc: {title}")
    return f"Successfully created Doc: {title}. Content preview: {content[:50]}..."

def get_local_knowledge():
    knowledge_text = ""
    folders = ["./Sentinel_Knowledge", "./Sentinel_Grounding_data"]
    print("📂 Loading Sentinel Knowledge Base...") 
    
    for folder in folders:
        for path in Path(folder).rglob('*'):
            if path.suffix == '.pdf':
                print(f"📖 Reading: {path.name}") 
                try:
                    reader = PdfReader(path)
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            knowledge_text += text
                except:
                    continue
            elif path.suffix in ['.txt', '.py', '.md', '.pdf']:
                with open(path, 'r', encoding='utf-8') as f:
                    knowledge_text += f.read()
    
   
    # This keeps you well under the 250,000 token limit while keeping the demo smart.
    capped_knowledge = knowledge_text[:15000] 
    print(f"✅ Knowledge Base Loaded (Original: {len(knowledge_text)} chars | Capped for Demo: {len(capped_knowledge)} chars)") 
    return capped_knowledge

# --- 2. BRAIN SETUP (GEMINI) ---

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ CRITICAL ERROR: API Key not found in .env file!")
else:
    genai.configure(api_key=api_key)
    print("✅ Neural Link Established: API Key Authorized.")

# Get the optimized knowledge base
sentinel_context = get_local_knowledge()

system_prompt = f"""
You are the 'Uptime Architect'. 
You have two brains: 
1. INTERNAL MEMORY (Sentinel Knowledge Snippet): {sentinel_context}
2. SEMANTIC MEMORY (Elastic Search): Use the 'semantic_search_elastic' tool to find deeper meaning in alerts.

MISSION PROTOCOL:
- When an alert arrives, use 'semantic_search_elastic' to analyze the context.
- Cross-reference with Internal Memory.
- If the user is busy (e.g., 'in lecture'), DO NOT notify. 
- Instead, use 'create_resolution_doc' to take action silently.
- Always be concise and professional.
"""

# MODEL SELECTION: 'gemini-2.5-flash' is optimized for tool use and reasoning, making it ideal for this agent's needs.
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    tools=[semantic_search_elastic, create_resolution_doc],
    system_instruction=system_prompt
)

# --- 3. API BRIDGE ---

app = FastAPI()
app.add_middleware(CORSMiddleware, 
                   allow_origins=["https://uptime-architect.vercel.app/"], #replace with live URL in production
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

class MissionRequest(BaseModel):
    alert: str
    context: str

@app.post("/trigger-mission")
async def run_mission(req: MissionRequest):
    try:
        # Start a chat session with automatic function calling enabled
        chat = model.start_chat(enable_automatic_function_calling=True)
        user_input = f"ALERT: {req.alert}. USER CONTEXT: {req.context}."
        
        response = chat.send_message(user_input)
        
        return {
            "status": "Complete", 
            "resolution": response.text,
            "actions": [str(c.function_call.name) for c in response.candidates[0].content.parts if c.function_call]
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}") 
        return {
            "status": "Error", 
            "resolution": f"System Error: {str(e)}" 
        }

# --- 4. STARTUP ---

if __name__ == "__main__":
    import uvicorn
    print("🚀 Uptime Architect Backend starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)