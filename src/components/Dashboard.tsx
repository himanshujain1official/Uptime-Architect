/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Terminal as TerminalIcon, 
  Shield, 
  Cpu, 
  Thermometer, 
  Wind, 
  Activity,
  ChevronRight,
  Github,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Info,
  History,
  Star,
  MessageSquare,
  ThumbsUp
} from "lucide-react";
import { searchSentinelKnowledge } from "../services/geminiService";
import { GithubIssue, SystemStatus } from "../types";
import { data } from "motion/react-m";


export default function Dashboard({ activeTab }: { activeTab: string }) {
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(false);
  const [missionLogs, setMissionLogs] = useState<string[]>(["[SYSTEM] INITIALIZING SENTINEL PROTOCOLS...", "[SYSTEM] STANDBY FOR INCOMING ALERTS."]);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [knowledgeResults, setKnowledgeResults] = useState<any[]>([]);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState("");
  const [refreshRate, setRefreshRate] = useState(() => {
    const saved = localStorage.getItem("sentinel_refresh_rate");
    return saved ? Number(saved) : 5000;
  });

  useEffect(() => {
    localStorage.setItem("sentinel_refresh_rate", refreshRate.toString());
  }, [refreshRate]);

  const knowledgeCategories = [
    { title: "Protocol Guides", count: 12, icon: Shield },
    { title: "Hardware Specs", count: 8, icon: Cpu },
    { title: "Archived Missions", count: 245, icon: History },
    { title: "Operator Manuals", count: 5, icon: Info }
  ];

  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);
  const [confirmingIssue, setConfirmingIssue] = useState<GithubIssue | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { rating: number; comment: string; submitted: boolean }>>({});

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshData = () => {
      // 1. We remove the ghost functions that caused the crash.
      // 2. We set 'Issues' to an empty array so the UI doesn't break.
      setIssues([]); 
      
      // 3. Keep the timer running so the 'Last Updated' clock still works.
      setLastUpdated(new Date().toLocaleTimeString());
    };

    refreshData();
    const interval = setInterval(refreshData, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [missionLogs]);

  const triggerMission = async (issue: GithubIssue | null) => {
    if (!issue) return;
    setLoading(true);
    setMissionLogs(prev => [...prev, `[MISSION] AUTHORIZING OPERATIONAL PROTOCOL FOR ${issue.title}`]);

    const steps = [
      "[SYSTEM] ANALYZING LOGS VIA ELASTIC...",
      "[SYSTEM] SEARCHING SENTINEL KNOWLEDGE BASE...",
      "[SYSTEM] CHECKING USER CALENDAR CONTEXT...",
      "[SYSTEM] GENERATING RESOLUTION PLAN..."
    ];

    try {
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMissionLogs(prev => [...prev, step]);
      }

      const data = await searchSentinelKnowledge("Hardware Alert");
      if (data?.resolution) {
        setMissionLogs(prev => [...prev, `[RESOLUTION] ${data.resolution}`]);
      }

      await fetch("http://localhost:8000/trigger-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert: issue.title,
          context: "User is currently studying for exams."
        }),
      }).catch(() => null);

      setMissionLogs(prev => [...prev, `[RESOLVED] INFRASTRUCTURE STABILIZING. AGENT DEPLOYED COUNTER-MEASURES.`]);
      setActiveMission(issue.id);
    } catch (error) {
      console.error(error);
      setMissionLogs(prev => [...prev, "[ERROR] MISSION INTERRUPTED."]);
    } finally {
      setLoading(false);
    }
  };

 const handleCommand = async (command: string) => {
  // 1. Add your command to the logs so you can see it
  setMissionLogs(prev => [...prev, `> ${command}`]);

  // 2. Send the command to the Python backend
  try {
    const data = await searchSentinelKnowledge(command, "User in BCA Lecture"); 
    
    // 3. Display the AI's response in the terminal
    setMissionLogs(prev => [...prev, `[SENTINEL] ${data.resolution}`]);
  } catch (error) {
    setMissionLogs(prev => [...prev, `[ERROR] Connection to Agent.py failed.`]);
  }
};

  const handleTerminalSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const cmdText = terminalCommand.trim();
  if (!cmdText) return;

  const cmd = cmdText.toLowerCase();
  setTerminalCommand(""); // Clear the input immediately for a sleek UI

  // 1. Handle local system commands (The "Dumb" logic)
  if (cmd === "clear" || cmd === "cls") {
    setMissionLogs(["[SYSTEM] CONSOLE BUFFER CLEARED."]);
    return;
  }
  // This version will use 'resolution' if it exists, or the whole data object if it doesn't
  const agentMessage = data.resolution || data.message || JSON.stringify(data);
  setMissionLogs(prev => [...prev, `[AGENT] ${agentMessage}`]);
  
  // 2. Log your typed command to the screen
  setMissionLogs(prev => [...prev, `> ${cmdText}`]);

  // 3. Send everything else to the AI Brain (Your agent.py)
  try {
    setMissionLogs(prev => [...prev, "[SYSTEM] CONSULTING SENTINEL KNOWLEDGE BASE..."]);
    
    // We include your current status as a 4th sem BCA student for context
    const data = await searchSentinelKnowledge(cmdText, "User in BCA 4th Semester Lecture");
    
    // Display the Agent's reasoning from the backend
    setMissionLogs(prev => [...prev, `[AGENT] ${data.resolution}`]);
    
  } catch (error) {
    setMissionLogs(prev => [...prev, "[ERROR] AGENT OFFLINE. CHECK AGENT.PY TERMINAL."]);
  }
};

  const renderKnowledge = () => (
    <section className="space-y-8 pb-8 scroll-smooth">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-line pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold font-mono tracking-[0.2em] uppercase">Minerva Knowledge Base</h3>
        </div>
        <div className="relative w-full max-w-md">
          <input 
            type="text"
            placeholder="SEARCH SYSTEM WISDOM (e.g. 'cooling', 'auth', 'node')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-line/10 border border-line p-3 pl-10 rounded-sm font-mono text-[10px] focus:border-accent outline-none transition-all placeholder:opacity-20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(""); setKnowledgeResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-100 opacity-40 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {!knowledgeResults.length && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {knowledgeCategories.map((cat, i) => (
            <button key={i} className="flex flex-col items-center justify-center p-6 border border-line bg-line/5 rounded-sm hover:bg-accent/5 hover:border-accent/30 transition-all group">
              <cat.icon className="w-6 h-6 mb-3 opacity-20 group-hover:opacity-100 group-hover:text-accent transition-all" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{cat.title}</span>
              <span className="text-[8px] font-mono opacity-30 mt-1">{cat.count} ENTRIES</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {knowledgeResults.length > 0 ? (
          knowledgeResults.map((res, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-line/5 border border-line p-6 rounded-sm hover:bg-line/10 transition-all border-l-2 border-l-accent/20"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xs font-bold font-mono text-accent uppercase tracking-wider">{res.title}</h4>
                <span className="text-[8px] font-mono opacity-30 uppercase">ARCHIVE_REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
              <p className="text-[10px] font-mono opacity-60 leading-relaxed bg-black/20 p-3 rounded-sm border border-line/10">
                {res.snippet}
              </p>
              <div className="mt-4 flex gap-4">
                <button className="text-[8px] font-mono font-bold text-accent/60 hover:text-accent uppercase tracking-widest">Load Metadata</button>
                <button className="text-[8px] font-mono font-bold opacity-30 hover:opacity-100 uppercase tracking-widest">Export Node</button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border border-dashed border-line rounded-sm bg-line/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-line/20 flex items-center justify-center">
              <Info className="w-6 h-6 opacity-10" />
            </div>
            <div className="max-w-xs space-y-2">
              <p className="text-[10px] font-mono opacity-30 tracking-[0.4em] uppercase">Minerva Neural Link Offline</p>
              <p className="text-[9px] font-mono opacity-20 leading-relaxed">Query the knowledge base using the search interface above to retrieve archived mission data and system recovery protocols.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  const renderModals = () => (
    <AnimatePresence>
      {/* Incident Details Modal */}
      {selectedIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-bg/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-line/10 border border-line p-8 rounded-sm max-w-2xl w-full relative shadow-2xl"
          >
            <button 
              onClick={() => setSelectedIssue(null)}
              className="absolute top-6 right-6 p-2 hover:bg-line/20 rounded-sm transition-colors opacity-40 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/10 rounded-sm">
                <Info className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono tracking-tight text-accent uppercase">{selectedIssue.title}</h3>
                <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{selectedIssue.id} // {selectedIssue.repository}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-mono font-bold uppercase">{selectedIssue.status}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest mb-1">Priority</p>
                  <p className={`text-xs font-mono font-bold uppercase ${selectedIssue.priority === 'high' ? 'text-danger' : 'text-warning'}`}>
                    {selectedIssue.priority}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest mb-1">Assigned Node</p>
                  <p className="text-xs font-mono font-bold uppercase">SENTINEL-ALPHA-1</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest mb-1">Entropy Level</p>
                  <p className="text-xs font-mono font-bold uppercase">STABLE (0.24)</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 border border-line/20 rounded-sm mb-8">
              <p className="text-[10px] font-mono opacity-60 leading-relaxed italic">
                "Sentinel AI has detected a potential degradation in the node telemetry. 
                Recommended action involves a deep-scan of the edge-cache and verification of parity across shards."
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setSelectedIssue(null)}
                className="px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border border-line hover:bg-line/20 transition-all"
              >
                Close Uplink
              </button>
              {activeMission !== selectedIssue.id && (
                <button 
                  onClick={() => {
                    setConfirmingIssue(selectedIssue);
                    setSelectedIssue(null);
                  }}
                  className="px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-accent text-bg shadow-[0_0_15px_rgba(var(--color-accent),0.3)] hover:scale-105 transition-all"
                >
                  Authorize Mission
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      {confirmingIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-line/10 border border-danger/30 p-10 rounded-sm max-w-lg w-full text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-danger/50" />
            
            <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-6 animate-pulse" />
            
            <h3 className="text-lg font-bold font-mono tracking-tight text-ink uppercase mb-2">Critical Protocol Authorization</h3>
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em] mb-8">Authorizing mission for: {confirmingIssue.id}</p>

            <div className="p-6 border border-line/20 rounded-sm mb-8 text-left bg-black/20">
              <p className="text-[11px] font-mono opacity-80 leading-relaxed font-bold text-danger mb-2">WARNING: IRREVERSIBLE ACTION</p>
              <p className="text-[10px] font-mono opacity-50 leading-relaxed lowercase">
                initiating this mission will deploy neural agents to the production environment. 
                resource consumption will spike. confirm your level 4 credentials.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmingIssue(null)}
                className="py-3 text-[10px] font-mono font-bold uppercase tracking-widest border border-line hover:bg-line/20 transition-all"
              >
                Abort Action
              </button>
              <button 
                onClick={() => {
                  triggerMission(confirmingIssue);
                  setConfirmingIssue(null);
                }}
                className="py-3 text-[10px] font-mono font-bold uppercase tracking-widest bg-danger text-bg shadow-[0_0_20px_rgba(var(--color-danger),0.4)] hover:scale-105 transition-all"
              >
                Confirm Authorization
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const [alertRules, setAlertRules] = useState<{ id: string; metric: string; operator: string; value: number; action: string }[]>([
    { id: "1", metric: "CPU", operator: ">", value: 90, action: "SENTINEL_THROTTLE" },
    { id: "2", metric: "TEMP", operator: ">", value: 85, action: "COOLING_OVERRIDE" }
  ]);
  const [newRule, setNewRule] = useState({ metric: "CPU", operator: ">", value: 50, action: "NOTIFY" });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule = { ...newRule, id: Math.random().toString(36).substr(2, 9) };
    setAlertRules(prev => [rule, ...prev]);
    setMissionLogs(prev => [...prev, `[CONFIG] NEW ALERT RULE DEFINED: ${rule.metric} ${rule.operator} ${rule.value}`]);
    setNewRule({ metric: "CPU", operator: ">", value: 50, action: "NOTIFY" });
  };

  const renderStatus = () => (
    <div className="space-y-10">
      {/* Agent Performance Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold font-mono tracking-[0.2em] uppercase">Agent Performance Matrix</h3>
          </div>
          <div className="text-[10px] opacity-30 font-mono uppercase tracking-widest">Neural Link: Stable</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "API_LATENCY", val: "124ms", trend: "-12%", color: "text-success" },
            { label: "NEURAL_LOAD", val: "18.4%", trend: "+2%", color: "text-ink" },
            { label: "TOKEN_FLUX", val: "2.4k/s", trend: "0%", color: "text-accent" },
            { label: "AGENT_UPTIME", val: "99.98%", trend: "MAX", color: "text-success" }
          ].map((m, i) => (
            <div key={i} className="bg-line/5 border border-line p-4 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">{m.label}</span>
                <span className={`text-[8px] font-mono font-bold ${m.trend.startsWith("-") ? "text-success" : m.trend.startsWith("+") ? "text-danger" : "opacity-30"}`}>
                  {m.trend}
                </span>
              </div>
              <div className={`text-lg font-mono font-bold ${m.color}`}>{m.val}</div>
              <div className="mt-3 w-full h-[2px] bg-line/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 2, delay: i * 0.2 }}
                  className="h-full bg-accent/40"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alert Rule Builder */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold font-mono tracking-[0.2em] uppercase">Alert Rule Protocols</h3>
          </div>
          <div className="text-[10px] opacity-30 font-mono uppercase tracking-widest">Active Watchdogs: {alertRules.length}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rule Creation Form */}
          <div className="bg-line/5 border border-line p-6 rounded-sm space-y-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">Define New Boundary</h4>
            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Metric</label>
                  <select 
                    value={newRule.metric}
                    onChange={(e) => setNewRule({...newRule, metric: e.target.value})}
                    className="w-full bg-bg border border-line p-2 text-[10px] font-mono text-ink outline-none focus:border-accent"
                  >
                    <option value="CPU">CPU_LOAD</option>
                    <option value="TEMP">HEAT_INDEX</option>
                    <option value="FAN">FAN_VELOCITY</option>
                    <option value="LATENCY">NET_LATENCY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Op</label>
                  <select 
                    value={newRule.operator}
                    onChange={(e) => setNewRule({...newRule, operator: e.target.value})}
                    className="w-full bg-bg border border-line p-2 text-[10px] font-mono text-ink outline-none focus:border-accent"
                  >
                    <option value=">">GT</option>
                    <option value="<">LT</option>
                    <option value="==">EQ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Threshold Value</label>
                <input 
                  type="number"
                  value={newRule.value}
                  onChange={(e) => setNewRule({...newRule, value: Number(e.target.value)})}
                  className="w-full bg-bg border border-line p-2 text-[10px] font-mono text-accent outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Target Action</label>
                <select 
                  value={newRule.action}
                  onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                  className="w-full bg-bg border border-line p-2 text-[10px] font-mono text-ink outline-none focus:border-accent"
                >
                  <option value="NOTIFY">SEND_NOTIFICATION</option>
                  <option value="THROTTLE">AUTO_THROTTLE_PID</option>
                  <option value="FAILOVER">REDUNDANT_FAILOVER</option>
                  <option value="ISOLATE">ISOLATE_NODE</option>
                </select>
              </div>
              <button className="w-full py-3 bg-accent text-bg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(var(--color-accent),0.2)]">
                Commit Rule to Kernel
              </button>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="bg-line/10 border border-line p-5 rounded-sm relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent/40" />
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">SIG_ID: {rule.id}</div>
                  <button 
                    onClick={() => setAlertRules(alertRules.filter(r => r.id !== rule.id))}
                    className="opacity-20 hover:opacity-100 hover:text-danger p-1 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  <h5 className="text-[11px] font-mono font-bold tracking-widest">
                    {rule.metric} <span className="text-accent">{rule.operator}</span> {rule.value}
                  </h5>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success rounded-full" />
                    <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest">Action: {rule.action}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line/10 flex justify-between items-center">
                  <div className="text-[8px] font-mono opacity-30">WATCHDOG_ACTIVE</div>
                  <Activity className="w-3 h-3 opacity-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Section (Existing) */}
      {renderMissionFeed()}
    </div>
  );

  const renderActionCenter = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold font-mono tracking-[0.2em] uppercase">Secure Command Interface</h3>
        </div>
        <div className="text-[10px] opacity-30 font-mono uppercase tracking-widest text-warning italic">Encryption: AES-256 Enabled</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rapid Protocol Controls */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">Maintenance Protocols</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "SYSTEM DIAGNOSTICS", desc: "Run kernel integrity check", cmd: "status --deep" },
              { label: "FLUSH SHARED CACHE", desc: "Purge L2/L3 telemetry Redis", cmd: "clear --cache" },
              { label: "ROTATE API SECRETS", desc: "Invalidate existing tokens", cmd: "auth --rotate" },
              { label: "ISOLATE EDGE NODES", desc: "Force failover to back-up", cmd: "node --isolate" }
            ].map((p, i) => (
              <button 
                key={i}
                onClick={() => {
                  setTerminalCommand(p.cmd);
                  setMissionLogs(prev => [...prev, `[USER] PREPARING PROTOCOL: ${p.label}`]);
                }}
                className="text-left p-4 border border-line bg-line/5 hover:bg-accent/10 hover:border-accent/40 transition-all group rounded-sm"
              >
                <div className="text-[10px] font-bold font-mono text-ink group-hover:text-accent transition-colors mb-1">{p.label}</div>
                <div className="text-[9px] font-mono opacity-40 lowercase">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Large Command Buffer View */}
        <div className="lg:col-span-8 bg-black/40 border border-line rounded-sm flex flex-col h-[500px]">
          <div className="p-3 border-b border-line/20 bg-line/10 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-danger/40" />
              <div className="w-2 h-2 rounded-full bg-warning/40" />
              <div className="w-2 h-2 rounded-full bg-success/40" />
            </div>
            <span className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Mainframe_Session_09</span>
          </div>
          <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto minimalist-scrollbar opacity-80 leading-relaxed">
            {missionLogs.map((log, i) => (
              <div key={i} className={`flex gap-4 mb-1 ${log.startsWith(">") ? "text-accent" : ""}`}>
                <span className="opacity-20 shrink-0">$</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex gap-4 items-center animate-pulse">
              <span className="opacity-20 shrink-0">$</span>
              <div className="w-2 h-4 bg-accent/60" />
            </div>
          </div>
          <form onSubmit={handleTerminalSubmit} className="p-4 border-t border-line/20 bg-line/5">
            <div className="flex items-center gap-3">
              <ChevronRight className="w-4 h-4 text-accent" />
              <input 
                autoFocus
                type="text"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                placeholder="TYPE COMMAND OR USE PROTOCOL KEYS..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs tracking-wider text-accent placeholder:opacity-10"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const submitFeedback = (issueId: string) => {
    const data = feedback[issueId];
    if (!data || data.rating === 0) return;
    
    setFeedback(prev => ({
      ...prev,
      [issueId]: { ...data, submitted: true }
    }));
    
    setMissionLogs(prev => [...prev, `[FEEDBACK] RECEIVED FOR MISSION ${issueId}: RATING ${data.rating}/5`]);
  };

  const renderMissionFeed = () => (
    <section className="space-y-6 pb-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold font-mono tracking-[0.2em] uppercase">Multi-Step Mission Feed</h3>
        </div>
        <div className="text-[10px] opacity-30 font-mono uppercase tracking-widest">Priority Queue: {issues.length}</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {issues.map((issue) => {
          const isDone = activeMission === issue.id;
          const missionFeedback = feedback[issue.id] || { rating: 0, comment: "", submitted: false };

          return (
            <div 
              key={issue.id} 
              onClick={() => !isDone && setSelectedIssue(issue)}
              className={`bg-line/5 border border-line p-8 rounded-sm relative group transition-all duration-300 ${isDone ? "" : "hover:border-accent/30 cursor-pointer"}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-sm font-bold mb-2 font-mono tracking-tight uppercase group-hover:text-accent transition-colors">
                    {issue.title}
                  </h4>
                  <div className="text-[9px] opacity-40 font-mono uppercase tracking-widest">
                    Alert: {issue.id} // {issue.repository}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <span className="flex items-center gap-1.5 bg-success text-bg text-[9px] font-bold px-3 py-1 uppercase tracking-tighter shadow-[0_0_10px_#34C759]">
                      <CheckCircle2 className="w-3 h-3" /> Mission Complete
                    </span>
                  ) : (
                    <span className={`text-[9px] border border-line px-3 py-1 uppercase font-mono ${
                      issue.priority === "high" ? "text-danger border-danger/30 bg-danger/5" : "text-warning border-warning/30 bg-warning/5"
                    }`}>
                      {issue.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Steps / Feedback Form */}
              <div className="mb-10">
                {isDone ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-line/10 border border-line rounded-sm space-y-6"
                  >
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <MessageSquare className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Mission Effectiveness Assessment</span>
                    </div>

                    {missionFeedback.submitted ? (
                      <div className="flex flex-col items-center py-4 space-y-3">
                        <ThumbsUp className="w-8 h-8 text-success" />
                        <p className="text-[10px] font-mono text-success uppercase tracking-[0.2em] font-bold">Feedback Logged to Kernel</p>
                        <p className="text-[9px] font-mono opacity-40 italic">"Thank you for helping us optimize Sentinel's performance."</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Efficiency Rating</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeedback(prev => ({
                                    ...prev,
                                    [issue.id]: { ...missionFeedback, rating: star }
                                  }));
                                }}
                                className={`p-1 transition-all ${
                                  star <= missionFeedback.rating ? "text-accent fill-accent" : "text-line hover:text-accent/40"
                                }`}
                              >
                                <Star className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Technical Comments</p>
                          <textarea
                            onClick={(e) => e.stopPropagation()}
                            value={missionFeedback.comment}
                            onChange={(e) => setFeedback(prev => ({
                              ...prev,
                              [issue.id]: { ...missionFeedback, comment: e.target.value }
                            }))}
                            placeholder="DOC_REFINEMENT_LOGGING..."
                            className="w-full bg-bg border border-line p-3 text-[10px] font-mono text-ink outline-none focus:border-accent min-h-[80px] placeholder:opacity-10 resize-none"
                          />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            submitFeedback(issue.id);
                          }}
                          disabled={missionFeedback.rating === 0}
                          className="w-full py-3 bg-accent text-bg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-20"
                        >
                          Submit to Neural Archives
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-6 relative pl-6 border-l border-line/20 ml-1">
                    {[
                      "ANALYZING LOGS",
                      "SEARCHING SENTINEL KNOWLEDGE",
                      "CHECKING USER CALENDAR"
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4 relative">
                        <div className="absolute -left-[27px] w-3 h-3 rounded-full border-2 border-bg bg-line" />
                        <span className="text-[10px] font-mono tracking-widest opacity-40">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-line/10 -mx-8 -mb-8 p-6 border-t border-line">
                <div className="flex items-center gap-6 text-[10px] font-mono opacity-40">
                  <span className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> git-master</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {issue.status}</span>
                </div>
                {!isDone && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingIssue(issue);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:gap-4 transition-all disabled:opacity-30"
                  >
                    Initiate Mission Protocol <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className={`flex flex-col h-screen transition-all duration-300 bg-bg text-ink selection:bg-accent selection:text-bg overflow-hidden ${glitch ? "invert opacity-80" : ""}`}>
      
      {/* 1. Pulse Header */}
      <header className="h-16 border-b border-line px-8 flex items-center justify-between bg-bg/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.div 
               animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-2 h-2 bg-success rounded-full shadow-[0_0_10px_#34C759]"
            />
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-success uppercase">System: Online</span>
          </div>
          <div className="h-4 w-px bg-line" />
          <div className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
            SENTINEL OS // {lastUpdated}
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 border border-line/30 rounded-sm px-2 py-1 bg-line/5">
            <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">Poll Delay:</span>
            <input 
              type="number"
              min="1000"
              max="60000"
              step="1000"
              value={refreshRate}
              onChange={(e) => setRefreshRate(Number(e.target.value))}
              className="w-12 bg-transparent text-[9px] font-mono text-accent outline-none text-center"
            />
            <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">ms</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono opacity-40 tracking-widest uppercase">
            <span>Level 4 Access // Himanshu</span>
            <Shield className="w-3 h-3 text-accent" />
          </div>
          <div className="flex gap-1 opacity-20">
            {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-accent" />)}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 scroll-smooth minimalist-scrollbar space-y-10">
        
        {/* 2. Hardware Health Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "TEMP", val: "42°C", icon: Thermometer, color: "text-ink" },
            { label: "FAN", val: "2800 RPM", icon: Wind, color: "text-ink" },
            { label: "CPU", val: "12%", icon: Cpu, color: "text-accent" },
            { label: "UPTIME", val: "99.9%", icon: Activity, color: "text-success" }
          ].map((stat, i) => (
            <div key={i} className="bg-line/10 border border-line p-5 rounded-sm flex items-center justify-between border-l-2 border-l-accent shadow-[4px_0_0_0_rgba(var(--color-accent),0.1)]">
              <div className="space-y-1">
                <p className="text-[8px] opacity-40 font-mono tracking-widest">{stat.label}_CORE</p>
                <p className={`text-xl font-bold font-mono tracking-tight ${stat.color}`}>{stat.val}</p>
              </div>
              <stat.icon className="w-6 h-6 opacity-10" />
            </div>
          ))}
        </section>

        {/* Dynamic Content Area */}
        <main>
          {activeTab === "monitor" ? renderMissionFeed() : 
           activeTab === "status" ? renderStatus() :
           activeTab === "knowledge" ? renderKnowledge() : 
           activeTab === "terminal" ? renderActionCenter() : (
             <div className="text-center py-40 opacity-20 space-y-4">
                <h3 className="text-sm font-mono tracking-widest uppercase">Sub-System: {activeTab.toUpperCase()}</h3>
                <p className="text-[10px] font-mono tracking-widest">Protocol Visualization Pending for Shard 09-Alpha</p>
             </div>
          )}
        </main>
      </div>

      {renderModals()}

      {/* Neural Processing Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg/80 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
            <div className="relative w-80 h-80 flex flex-col items-center justify-center">
              {/* Geometric Core */}
              <motion.div 
                animate={{ 
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 border border-accent/10 rounded-full"
              />
              <motion.div 
                animate={{ 
                  rotate: [360, 270, 180, 90, 0],
                  scale: [1, 0.9, 1]
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-8 border border-accent/5 rounded-sm rotate-45"
              />
              
              {/* Scanning Line Effect */}
              <motion.div 
                animate={{ 
                  top: ["0%", "100%", "0%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent z-10"
              />

              {/* Central Text Content */}
              <div className="flex flex-col items-center z-20 space-y-6">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-accent rounded-full"
                  />
                  <span className="text-[10px] font-mono tracking-[0.4em] text-accent uppercase font-bold">Neural Processing</span>
                </div>
                
                <div className="w-48 h-[1px] bg-line/20 overflow-hidden relative">
                  <motion.div 
                    className="absolute inset-0 bg-accent shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-mono opacity-30 tracking-[0.6em] uppercase text-center">Protocol: Minerva-4</p>
                  <p className="text-[8px] font-mono opacity-20 tracking-[0.5em] uppercase text-center">Syncing Local Nodes...</p>
                </div>
              </div>

              {/* Floating Data Shards */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                    y: [Math.random() * 200 - 100, Math.random() * 200 - 100]
                  }}
                  transition={{ 
                    duration: 5 + i, 
                    repeat: Infinity,
                    delay: i 
                  }}
                  className="absolute text-[8px] font-mono opacity-10 text-accent select-none"
                >
                  {Math.random().toString(16).substring(2, 8).toUpperCase()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Sentinel Logs Terminal */}
      <footer className={`transition-all duration-300 border-t border-line bg-line/5 flex flex-col overflow-hidden shrink-0 ${isTerminalMinimized ? "h-12" : "h-44 md:h-52"}`}>
        <div className="flex items-center justify-between px-6 py-3 border-b border-line/20 bg-bg shrink-0">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-4 h-4 text-accent" />
            <span className="text-[9px] font-mono opacity-50 uppercase tracking-[0.25em]">Sentinel Command Buffer</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="p-1 hover:bg-line/20 rounded-sm transition-colors opacity-40 hover:opacity-100"
              onClick={() => setIsTerminalMinimized(!isTerminalMinimized)}
            >
              {isTerminalMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button 
              className="text-[9px] font-mono opacity-30 hover:opacity-100 uppercase tracking-widest transition-opacity"
              onClick={() => setMissionLogs(["[SYSTEM] CONSOLE BUFFER CLEARED."])}
            >
              Clear Buffer
            </button>
          </div>
        </div>
        
        {!isTerminalMinimized && (
          <>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] md:text-[11px] p-6 space-y-2 minimalist-scrollbar opacity-70">
              {missionLogs.map((log, i) => (
                <div key={i} className={`flex gap-4 ${
                  log.includes("[RESOLVED]") ? "text-accent font-bold" : 
                  log.includes("[MISSION]") ? "text-warning" : 
                  log.startsWith(">") ? "text-ink italic" : "text-ink/80"
                }`}>
                  <span className="opacity-20 shrink-0 select-none">
                    [{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  <span className="break-all tracking-tight">{log}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            
            <form onSubmit={handleTerminalSubmit} className="px-6 py-3 border-t border-line/10 bg-black/20 flex items-center gap-3">
              <span className="text-accent font-mono text-[11px] select-none opacity-60">$</span>
              <input 
                type="text"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                placeholder="ENTER SYSTEM COMMAND..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] tracking-wider text-accent placeholder:opacity-10"
              />
            </form>
          </>
        )}
      </footer>
    </div>
  );
}
