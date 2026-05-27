"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [eps, setEps] = useState(14852);
  const [activeAlerts, setActiveAlerts] = useState(6);
  const [recentEvents, setRecentEvents] = useState([
    { id: "e1", time: "16:45:12", mart: "Windows Telemetry", entity: "Win11-PTE-84", event: "T1110 - Single Target Logon Failures spike", sev: "HIGH" },
    { id: "e2", time: "16:44:03", mart: "Firewall Flow", entity: "EdgeFW-01", event: "Inbound port scan detected on Port 443", sev: "MEDIUM" },
    { id: "e3", time: "16:42:58", mart: "Identity Mart", entity: "Saviynt-SSO", event: "T1078 - Invalid Geovelocity SSO Session Creation", sev: "HIGH" },
    { id: "e4", time: "16:40:15", mart: "Legacy Telemetry", entity: "AS400-DB3", event: "LegacyTel - QAUDJRN Journal Audit Level Override", sev: "CRITICAL" },
    { id: "e5", time: "16:38:42", mart: "Linux Telemetry", entity: "KubNode-9", event: "auditd - Unauthorized root sudo execution override attempt", sev: "HIGH" }
  ]);

  const [activeTab, setActiveTab] = useState("all");

  // Dynamic log count simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setEps((prev) => prev + Math.floor(Math.random() * 201 - 100));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateAlert = () => {
    const newAlert = {
      id: `e${Date.now()}`,
      time: new Date().toTimeString().split(' ')[0],
      mart: "Proxy Telemetry",
      entity: "Proxy-SGW-12",
      event: "T1098 - Direct PII unmasking endpoint accessed without Supervisor Token",
      sev: "CRITICAL"
    };
    setRecentEvents([newAlert, ...recentEvents.slice(0, 4)]);
    setActiveAlerts((prev) => prev + 1);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/40 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">MEDIUM</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Unified Security Operations Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time visual telemetry, threat correlation, and local autonomic security research loops.
          </p>
        </div>
        <button
          onClick={handleSimulateAlert}
          className="btn-glass btn-glass-danger font-mono text-xs uppercase"
        >
          🚨 Simulate ATO Incident
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* EPS */}
        <div className="glass-panel p-6 border-glow-success relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-400/20 text-3xl">📥</div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">Ingestion Velocity</span>
          <span className="text-3xl font-extrabold text-emerald-400 block mt-2 font-mono">{eps.toLocaleString()} <span className="text-xs font-normal">EPS</span></span>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">Standard mTLS Ingestion Layer</span>
        </div>

        {/* Active Alarms */}
        <div className="glass-panel p-6 border-glow-danger relative overflow-hidden">
          <div className="absolute right-4 top-4 text-rose-500/20 text-3xl">⚠️</div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">Unresolved Incidents</span>
          <span className="text-3xl font-extrabold text-rose-400 block mt-2 font-mono">{activeAlerts} <span className="text-xs font-normal">Open Cases</span></span>
          <span className="text-[10px] font-mono text-rose-400 mt-2 block pulse-indicator pulse-danger"> Dynamic Threat Vector Matches</span>
        </div>

        {/* Fleet Count */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-cyan-400/20 text-3xl">🖥️</div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">Registered Telemetry Fleet</span>
          <span className="text-3xl font-extrabold text-cyan-400 block mt-2 font-mono">1,489 <span className="text-xs font-normal">Active</span></span>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">AS/400 + Linux + Win + ESXi Nodes</span>
        </div>

        {/* Compression */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-violet-400/20 text-3xl">🗜️</div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">ClickHouse Compression</span>
          <span className="text-3xl font-extrabold text-violet-400 block mt-2 font-mono">12.6x <span className="text-xs font-normal">Ratio</span></span>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">Zero-Ingestion Cost Saving Enabled</span>
        </div>
      </div>

      {/* Main Grid: Data Marts & Critical Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Data Mart Ingestion Status */}
        <div className="glass-panel p-6 lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Provisioned Data Marts</h2>
            <p className="text-xs text-slate-400">ClickHouse Columnar Storage Nodes</p>
          </div>
          
          <div className="space-y-4">
            {[
              { name: "Legacy Telemetry Mart", desc: "AS/400, z/OS, SMF records", eps: "2,410", status: "Active" },
              { name: "Windows Event Mart", desc: "AD, Sysmon, Security Logs", eps: "5,815", status: "Active" },
              { name: "Linux Syslog & eBPF", desc: "Kernel, Containers, Syslogs", eps: "4,180", status: "Active" },
              { name: "Firewall Flow Mart", desc: "Multi-tenant routing tables", eps: "1,200", status: "Active" },
              { name: "Proxy & Egress Mart", desc: "Egress Web and DNS request vectors", eps: "840", status: "Active" },
              { name: "Identity Governance Mart", desc: "Saviynt, SailPoint SSO, MFA", eps: "407", status: "Active" }
            ].map((mart, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-black/30 border border-slate-800 hover:border-slate-700 transition duration-150">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200">{mart.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{mart.eps} EPS</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                  <span>{mart.desc}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-400 font-semibold">{mart.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Real-time Incident Feed */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Correlated Real-time Alerts</h2>
              <p className="text-xs text-slate-400">Underlying events mapped directly to MITRE ATT&CK</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Filter Severity:</span>
              <select className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300">
                <option value="all">ALL SEVERITY</option>
                <option value="critical">CRITICAL ONLY</option>
                <option value="high">HIGH & CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="p-4 rounded-lg bg-black/40 border border-slate-800/80 hover:border-slate-700/80 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    {getSeverityBadge(evt.sev)}
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{evt.mart}</span>
                    <span className="text-[10px] font-mono text-slate-500">Time: {evt.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">{evt.event}</h3>
                  <p className="text-xs text-slate-400">Impacted Entity Composite Context: <span className="font-mono text-cyan-400">{evt.entity}</span></p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="btn-glass text-[11px] py-1 px-3">
                    🔍 Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
