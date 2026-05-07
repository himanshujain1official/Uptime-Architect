export async function searchSentinelKnowledge(issue: string, context: string) {
  // This calls your Python agent.py
  const response = await fetch("http://localhost:8000/trigger-mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      alert: issue, 
      context: context 
    }),
  });

  if (!response.ok) {
    throw new Error("Backend is not responding. Make sure agent.py is running!");
  }

  return await response.json();
}