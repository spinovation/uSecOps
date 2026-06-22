"use client";

import { useState } from "react";

export default function Simulation() {
  const [activeSimulation, setActiveSimulation] = useState("normal");
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation settings
  const simulations = {
    normal: {
      name: "Normal Operations Baseline",
      description: "Appliance system healthy. Telemetry reporting zero major business interruptions.",
      revenue: "$0 / min loss",
      inventory: "0% disruption",
      customer: "0 SLA breaches",
      supplyChain: "Optimal flow status",
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    factory_a: {
      name: "Shut Down Factory A (Assembly Core)",
      description: "Critical hardware controller offline. Local assembly line halted. Ingress part deliveries backed up.",
      revenue: "-$4,200 / min",
      inventory: "35% backlog",
      customer: "14 delayed orders",
      supplyChain: "Container vessels delayed (Port Newark)",
      colorClass: "text-rose-600 bg-rose-50 border-rose-200 animate-pulse"
    },
    mainframe_db: {
      name: "Mainframe DB2 DB Crash (Z/OS)",
      description: "Transactional catalog database offline on z/OS. Billing records fail to write. Automated clearing house transfers frozen.",
      revenue: "-$12,500 / min",
      inventory: "0% backlog (Digital only)",
      customer: "450 service failures / sec",
      supplyChain: "Partner settlement clearances stalled",
      colorClass: "text-rose-600 bg-rose-50 border-rose-200 animate-pulse"
    },
    subnet_b: {
      name: "Isolate Core Subnet B (Active Directory)",
      description: "Firewall block applied to AD. Single Sign-On unavailable for remote workers. Corporate communications disrupted.",
      revenue: "-$1,800 / min",
      inventory: "12% distribution stall",
      customer: "1,200 lockout support tickets",
      supplyChain: "Warehouse dispatch portals unreachable",
      colorClass: "text-amber-600 bg-amber-50 border-amber-200 animate-pulse"
    }
  };

  const handleTriggerSimulation = (key) => {
    setIsSimulating(true);
    setTimeout(() => {
      setActiveSimulation(key);
      setIsSimulating(false);
    }, 1200);
  };

  const currentSim = simulations[activeSimulation];

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Business Simulation & Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Go beyond standard security alerts. Simulate operational infrastructure outages and immediately quantify downstream impacts on business lines, inventory, and supply chain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Simulation Controller & Topology */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulation Controller Panel */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Operational Failure Simulator</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(simulations).map(([key, value]) => (
                <div 
                  key={key}
                  onClick={() => !isSimulating && handleTriggerSimulation(key)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                    activeSimulation === key ? "border-violet-500 bg-violet-50/40" : "border-slate-200 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-850">{value.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 line-clamp-2">{value.description}</p>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border mt-3 text-center self-start ${value.colorClass}`}>
                    {activeSimulation === key ? "ACTIVE STATE" : "TRIGGER FAILOVER"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ontology Map (SVG Visualization) */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Enterprise Dependency Ontology</h2>
              <p className="text-xs text-slate-500">Mapping relationships from physical hypervisors to active apps, departments, and revenues.</p>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 h-[280px] flex items-center justify-center overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 400 240" className="w-full h-full">
                
                {/* Connection lines */}
                {/* Hypervisor to App 1 */}
                <line x1="60" y1="120" x2="160" y2="60" stroke="#475569" strokeWidth="1.5" />
                {/* Hypervisor to App 2 */}
                <line x1="60" y1="120" x2="160" y2="180" stroke="#475569" strokeWidth="1.5" />
                
                {/* App 1 to Biz Unit 1 */}
                <line x1="160" y1="60" x2="280" y2="60" stroke={activeSimulation === "factory_a" ? "#ef4444" : "#475569"} strokeWidth="1.5" className={activeSimulation === "factory_a" ? "animate-pulse" : ""} />
                
                {/* App 2 to Biz Unit 2 */}
                <line x1="160" y1="180" x2="280" y2="180" stroke={activeSimulation === "mainframe_db" ? "#ef4444" : "#475569"} strokeWidth="1.5" className={activeSimulation === "mainframe_db" ? "animate-pulse" : ""} />
                
                {/* Biz Unit to Global Profit */}
                <line x1="280" y1="60" x2="350" y2="120" stroke="#475569" strokeWidth="1.5" />
                <line x1="280" y1="180" x2="350" y2="120" stroke="#475569" strokeWidth="1.5" />

                {/* Nodes */}
                {/* Hypervisor */}
                <circle cx="60" cy="120" r="16" fill="#0284c7" />
                <text x="60" y="145" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">ESXi Hypervisor</text>

                {/* Virtual Apps */}
                <circle cx="160" cy="60" r="12" fill={activeSimulation === "factory_a" ? "#ef4444" : "#8b5cf6"} />
                <text x="160" y="85" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Factory Controller</text>

                <circle cx="160" cy="180" r="12" fill={activeSimulation === "mainframe_db" ? "#ef4444" : "#8b5cf6"} />
                <text x="160" y="205" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">z/OS DB2 Agent</text>

                {/* Business Units */}
                <circle cx="280" cy="60" r="12" fill="#eab308" />
                <text x="280" y="42" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Factory A Line</text>

                <circle cx="280" cy="180" r="12" fill="#eab308" />
                <text x="280" y="222" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Transactions Unit</text>

                {/* Ultimate Business Impact node */}
                <circle cx="350" cy="120" r="16" fill="#10b981" />
                <text x="350" y="148" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Revenue Stream</text>

              </svg>
            </div>
          </div>

        </div>

        {/* Right Column: Calculated Impact Statistics */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[450px] border border-slate-200 bg-white flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Business Impact Analysis</h3>
                <p className="text-xs text-slate-400">Calculated anomaly risk projections</p>
              </div>

              {/* Status Header */}
              <div className={`p-4 rounded-lg border text-xs font-mono text-center font-bold ${currentSim.colorClass}`}>
                {currentSim.name}
              </div>

              {/* Dynamic metrics */}
              <div className="space-y-4 font-mono text-xs">
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Revenue Impact</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">{currentSim.revenue}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Inventory Backlog</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">{currentSim.inventory}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Customer Impact</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">{currentSim.customer}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Supply Chain Flow status</span>
                  <span className="text-sm font-extrabold text-slate-850 mt-1 block">{currentSim.supplyChain}</span>
                </div>

              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono text-slate-500">
              Downstream operational risk factors are generated by checking internal/external LLM ontologies against active virtual entity links.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
