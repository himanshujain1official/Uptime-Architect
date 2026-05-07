/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Calendar, Github, Shield, Terminal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "status", label: "System Status", icon: Activity },
    { id: "calendar", label: "User Context", icon: Calendar },
    { id: "monitor", label: "Issue Monitor", icon: Github },
    { id: "terminal", label: "Action Center", icon: Terminal },
    { id: "knowledge", label: "Knowledge Base", icon: Shield },
  ];

  return (
    <>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 left-6 z-[110] md:hidden w-10 h-10 bg-accent rounded-sm flex items-center justify-center text-bg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
      </button>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        ${isCollapsed ? "w-20" : "w-64"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        fixed md:relative h-screen border-r border-line p-6 flex flex-col gap-8 bg-bg transition-all duration-300 z-[105] shadow-2xl md:shadow-none
      `}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 w-6 h-6 bg-accent rounded-full hidden md:flex items-center justify-center text-bg shadow-[0_0_15px_rgba(224,224,224,0.5)] cursor-pointer hover:scale-110 transition-transform z-50"
        >
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 0px #E0E0E000",
              "0 0 20px #E0E0E088",
              "0 0 0px #E0E0E000"
            ]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full h-full rounded-full flex items-center justify-center bg-accent"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.div>
      </button>

      <div className="flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 w-8 h-8 rounded-sm bg-accent flex items-center justify-center shadow-[0_0_10px_rgba(224,224,224,0.3)]">
          <Shield className="w-5 h-5 text-bg" />
        </div>
        {!isCollapsed && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold m-0 whitespace-nowrap"
          >
            Uptime Architect
          </motion.h1>
        )}
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            title={isCollapsed ? item.label : ""}
            className={`flex items-center gap-3 p-3 rounded-sm transition-all text-xs font-mono uppercase tracking-widest ${
              activeTab === item.id 
                ? "bg-line text-ink" 
                : "text-ink/40 hover:text-ink hover:bg-line/50"
            } ${isCollapsed ? "md:justify-center" : ""}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className={`p-4 border border-line rounded-sm bg-line/20 ${isCollapsed ? "md:flex md:justify-center" : ""}`}>
          <div className={`flex items-center justify-between mb-2 ${isCollapsed ? "md:w-full md:justify-center" : ""}`}>
            {!isCollapsed && <span className="text-[10px] opacity-40 uppercase">Security Token</span>}
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(52,199,89,0.5)]"></div>
          </div>
          {!isCollapsed && (
            <div className="text-[10px] font-mono opacity-60">SNTL-ALPHA-9283-X</div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
