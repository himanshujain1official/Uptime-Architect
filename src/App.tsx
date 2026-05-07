/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("status");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden selection:bg-accent selection:text-bg">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 overflow-hidden transition-all duration-300">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}
