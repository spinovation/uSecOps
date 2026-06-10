"use client";

import { useState } from "react";

export default function AuditLogs() {
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [breakGlassState, setBreakGlassState] = useState("IDLE");
  const [breakGlassLogs, setBreakGlassLogs] = useState([]);
  
  // Selected item states for Inventory Audit drill-down details
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [activeInventoryTab, setActiveInventoryTab] = useState("hardware");
  
  const [guiAudits, setGuiAudits] = useState([
    { id: 1, time: "16:52:10", user: "sridhargs", route: "/cases", action: "PII unmasking token request initiated (Case SEC-CASE-402)", status: "APPROVED" },
    { id: 2, time: "16:44:03", user: "sridhargs", route: "/upgrades", action: "Canary deployment rate slider modified to 10%", status: "LOGGED" },
    { id: 3, time: "16:38:12", user: "sridhargs", route: "/vulnerabilities", action: "Synthesized vulnerability hotfix draft triggered (CVE-2024-3094)", status: "LOGGED" }
  ]);

  const [cliAudits, setCliAudits] = useState([
    { id: 1, time: "16:51:24", host: "Appliance-Main", process: "systemd-journald", command: "sshd connection handshake validation complete from admin-subnet", type: "INFO" },
    { id: 2, time: "16:50:01", host: "Appliance-Main", process: "auditd", command: "sudo -u root -i  # Keystroke session started (Authorized)", type: "WARNING" },
    { id: 3, time: "16:48:15", host: "Appliance-Main", process: "dockerd", command: "vllm-inference-container - Health status verified operational", type: "INFO" }
  ]);

  // Hardware assets mock data
  const hardwareAssets = [
    { hostname: "boston-ws-01", ip: "10.100.12.45", type: "Workstation", cpu: "Intel Core i7 (8 Cores)", memory: "16 GB DDR4 RAM", storage: "512 GB NVMe SSD", mac: "00:50:56:C0:00:01", serial: "SN-BOS-94921", status: "Active" },
    { hostname: "london-ws-02", ip: "10.100.14.78", type: "Workstation", cpu: "Intel Core i9 (16 Cores)", memory: "32 GB DDR4 RAM", storage: "1 TB NVMe SSD", mac: "00:50:56:C0:00:02", serial: "SN-LDN-30192", status: "Active" },
    { hostname: "mainframe-prod-01", ip: "10.200.4.5", type: "Server", cpu: "IBM z16 (128 Cores)", memory: "1024 GB ECC RAM", storage: "20 TB SAN LUN", mac: "00:1A:2B:3C:4D:5E", serial: "SN-MF-PROD-01", status: "Active" },
    { hostname: "border-edge-fw", ip: "10.100.1.2", type: "Firewall", cpu: "AMD EPYC (8 Cores)", memory: "16 GB RAM", storage: "64 GB M.2 flash", mac: "00:0E:F1:2C:3B:4A", serial: "SN-FW-BORDER", status: "Active" }
  ];

  // Software assets mock data
  const softwareAssets = [
    { name: "nxlog-agent", version: "v2.1.0", path: "/Program Files/nxlog/nxlog.exe", host: "boston-ws-01", installDate: "2026-04-12", status: "Verified & Running" },
    { name: "splunkforwarder", version: "v9.2.0", path: "/opt/splunk/bin/splunkd", host: "london-ws-02", installDate: "2026-05-18", status: "Verified & Running" },
    { name: "usecops-daemon", version: "v1.2.0", path: "/usr/bin/secops-daemon", host: "mainframe-prod-01", installDate: "2026-06-02", status: "Verified & Running" },
    { name: "openssl-lib", version: "v1.1.1t", path: "/usr/lib/libcrypto.so", host: "tokyo-ws-03", installDate: "2026-03-20", status: "Outdated (CVE vulnerability)" }
  ];

  const handleTriggerBreakGlass = () => {
    setShowBreakGlassModal(false);
    setBreakGlassState("TRIGGERED");
    setBreakGlassLogs([
      "CRITICAL: Break-Glass Emergency Bypass triggered!",
      "Initializing bypass encryption keys...",
      "Generating local kernel-level write-once recovery log partition block...",
      "Broadcasting EXTREME-Severity appliance notification across all interfaces..."
    ]);

    setTimeout(() => {
      setBreakGlassLogs(prev => [
        ...prev,
        "By-passing lease check constraints. PII filters set to global transparent mode.",
        "Establishing direct fallback streams to Module 4 Ceph Object Storage...",
        "Streaming immutable serial audit ledger packets directly to WORM-locked archive..."
      ]);
    }, 1500);

    setTimeout(() => {
      setBreakGlassLogs(prev => [
        ...prev,
        "Archiving complete. WORM retention compliance lock locked for 5 years.",
        "Status: BYPASS_OPERATIONAL. Emergency maintenance session initialized."
      ]);
      
      // Inject alert log
      const newGuiAudit = {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        user: "SYSTEM_RECOVERY",
        route: "CONSOLE_BYPASS",
        action: "BREAK-GLASS BYPASS LOGS WRITTEN TO CEPH COLD STORAGE",
        status: "ALERT"
      };
      setGuiAudits([newGuiAudit, ...guiAudits]);
    }, 3500);
  };

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Appliance Self-Auditing & Break-Glass Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable self-monitoring, GUI interaction logging, host OS CLI shell keystroke captures, and emergency overrides.
          </p>
        </div>
        {breakGlassState === "IDLE" ? (
          <button
            onClick={() => setShowBreakGlassModal(true)}
            className="btn-glass btn-glass-danger font-mono text-xs uppercase shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse"
          >
            🔥 Trigger Break-Glass
          </button>
        ) : (
          <div className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded font-mono text-xs font-bold uppercase">
            🔥 BYPASS ACTIVE
          </div>
        )}
      </div>

      {breakGlassState === "TRIGGERED" && (
        <div className="glass-panel p-6 border-glow-danger bg-rose-50/50 space-y-4">
          <h2 className="text-lg font-bold text-rose-600 font-mono">🚨 EMERGENCY BREAK-GLASS BYPASS STATUS ACTIVE</h2>
          <div className="bg-[#0f172a] border border-slate-800 rounded p-4 font-mono text-xs text-rose-300 space-y-2 max-h-[200px] overflow-y-auto">
            {breakGlassLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span>&gt;</span>
                <span className={log.includes("CRITICAL") || log.includes("BYPASS") ? "text-rose-400 font-bold" : ""}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW: Inventory Audit Card */}
      <div className="glass-panel p-6 space-y-4 border border-slate-200 bg-white">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Asset Audit Inventory Ledger</h2>
            <p className="text-xs text-slate-500">Live captured inventory profile logs synced by endpoint daemons.</p>
          </div>
          
          {/* Inventory Category Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveInventoryTab("hardware")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeInventoryTab === "hardware" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Hardware Assets ({hardwareAssets.length})
            </button>
            <button
              onClick={() => setActiveInventoryTab("software")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeInventoryTab === "software" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Software Packages ({softwareAssets.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List panel */}
          <div className="lg:col-span-2 space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {activeInventoryTab === "hardware" ? (
              hardwareAssets.map((asset) => (
                <div 
                  key={asset.hostname}
                  onClick={() => setSelectedHardware(asset)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 ${
                    selectedHardware?.hostname === asset.hostname ? "border-violet-500 bg-violet-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="font-mono text-xs space-y-0.5">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{asset.type}</span>
                    <span className="font-bold text-slate-800">{asset.hostname}</span>
                    <span className="text-slate-500 block">{asset.ip}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded">
                    {asset.status}
                  </span>
                </div>
              ))
            ) : (
              softwareAssets.map((pkg) => (
                <div 
                  key={pkg.name}
                  onClick={() => setSelectedSoftware(pkg)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 ${
                    selectedSoftware?.name === pkg.name ? "border-violet-500 bg-violet-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="font-mono text-xs space-y-0.5">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Target Node: {pkg.host}</span>
                    <span className="font-bold text-slate-800">{pkg.name}</span>
                    <span className="text-slate-500 block">Version: {pkg.version}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    pkg.status.includes("Outdated") ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  }`}>
                    {pkg.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Details inspection drawer */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between min-h-[220px]">
            {activeInventoryTab === "hardware" ? (
              selectedHardware ? (
                <div className="space-y-3 font-mono text-xs text-slate-700">
                  <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    🖥️ {selectedHardware.hostname}
                  </h4>
                  <div className="space-y-2">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Device IP</span> {selectedHardware.ip}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Device Type</span> {selectedHardware.type}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">CPU Topology</span> {selectedHardware.cpu}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">ECC Memory</span> {selectedHardware.memory}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Storage Partition</span> {selectedHardware.storage}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">MAC Address</span> {selectedHardware.mac}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Serial Number</span> {selectedHardware.serial}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 font-mono text-xs">
                  <span>🖥️ Select a hardware device to inspect asset telemetry details.</span>
                </div>
              )
            ) : (
              selectedSoftware ? (
                <div className="space-y-3 font-mono text-xs text-slate-700">
                  <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    📦 {selectedSoftware.name}
                  </h4>
                  <div className="space-y-2">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Active version</span> {selectedSoftware.version}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Executable Binary Path</span> {selectedSoftware.path}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Installed Node</span> {selectedSoftware.host}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Date Registered</span> {selectedSoftware.installDate}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Status Profile</span> {selectedSoftware.status}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 font-mono text-xs">
                  <span>📦 Select a software package to inspect installation details.</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GUI Operations Stream */}
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">GUI Web Console Audit Stream</h2>
            <p className="text-xs text-slate-500">Captures routing updates and administrative operations</p>
          </div>

          <div className="space-y-4">
            {guiAudits.map((audit) => (
              <div key={audit.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-cyan-700 font-bold">Time: {audit.time} | User: {audit.user}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    audit.status === "ALERT" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-cyan-50 text-cyan-600 border border-cyan-200"
                  }`}>
                    {audit.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{audit.action}</p>
                <span className="text-[10px] font-mono text-slate-400">Route path: {audit.route}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Non-GUI Host CLI Stream */}
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Host OS CLI Audit Stream (auditd)</h2>
            <p className="text-xs text-slate-500">Captures hardware hypervisor shells and container runtimes</p>
          </div>

          <div className="space-y-4">
            {cliAudits.map((audit) => (
              <div key={audit.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2 font-mono">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Host: {audit.host} | Process: {audit.process}</span>
                  <span className="text-cyan-700 font-bold">{audit.time}</span>
                </div>
                <pre className="p-2.5 bg-[#0f172a] border border-slate-800 rounded text-cyan-300 text-xs break-all whitespace-pre-wrap select-all">
                  {audit.command}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Break-Glass Confirm Modal */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-glow-danger space-y-6 bg-white">
            <div className="space-y-2 text-center">
              <span className="text-5xl animate-bounce block">🔥</span>
              <h2 className="text-xl font-extrabold text-rose-600 uppercase tracking-widest font-mono">
                CRITICAL BYPASS WARNING
              </h2>
              <p className="text-xs text-slate-700">
                You are initiating the **Break-Glass Emergency Recovery Bypass** protocol. 
                This action disables active PII encryption lease rules and streams local recovery serial keys directly to physical WORM storage.
              </p>
            </div>

            <p className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded font-mono text-[10px] leading-relaxed font-semibold">
              WARNING: Under compliance guidelines, this command is fully immutable. A broadcast alert will be distributed to hypervisor channels. This recovery window cannot be modified or canceled.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowBreakGlassModal(false)}
                className="flex-1 btn-glass justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
              >
                Abort Protocol
              </button>
              <button
                onClick={handleTriggerBreakGlass}
                className="flex-1 btn-glass btn-glass-danger justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(239,68,68,0.25)]"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
