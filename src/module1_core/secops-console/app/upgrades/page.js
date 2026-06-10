"use client";

import { useState, useEffect } from "react";

export default function Upgrades() {
  const [canaryRate, setCanaryRate] = useState(10);
  const [developerSignature, setDeveloperSignature] = useState("SHA256:4fa38c92b8cd0901eef982c730ff18efbc73a11a842f1f0da8cb2142e88a08ff");
  const [adminKey, setAdminKey] = useState("SHA256:7c9e0123fabcd88998877eeff2024aa8823cdab882ee0a1122bcdaffeeddccb1");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeLogs, setUpgradeLogs] = useState([]);
  const [rollbackAnomalies, setRollbackAnomalies] = useState(false);
  
  // Workstation fleet
  const [workstations, setWorkstations] = useState([
    { id: "ws-1", hostname: "boston-ws-01", ip: "10.100.12.45", os: "Windows 11", status: "ONLINE", checked: true },
    { id: "ws-2", hostname: "london-ws-02", ip: "10.100.14.78", os: "Ubuntu 22.04", status: "ONLINE", checked: true },
    { id: "ws-3", hostname: "tokyo-ws-03", ip: "10.100.15.12", os: "RedHat 9.2", status: "ONLINE", checked: false },
    { id: "ws-4", hostname: "nyc-ws-04", ip: "10.100.16.88", os: "macOS Sonoma", status: "ONLINE", checked: false },
    { id: "ws-5", hostname: "mainframe-prod-01", ip: "10.200.4.5", os: "z/OS Mainframe", status: "ONLINE", checked: false }
  ]);

  // Software Inventory registry
  const [inventory, setInventory] = useState([
    { name: "universal-forwarder-v9.1.deb", type: "Agent Binary", staticSeverity: 0, approvedAt: "System Default", signature: "SHA256:88fa2b109cc...", status: "ACTIVE" },
    { name: "nxlog-agent-v2.0.msi", type: "Agent Binary", staticSeverity: 0, approvedAt: "System Default", signature: "SHA256:1a2c3d4e5f...", status: "ACTIVE" }
  ]);

  const [selectedBinary, setSelectedBinary] = useState(null);

  // Sync approved binaries from vulnerabilities
  useEffect(() => {
    const saved = localStorage.getItem("approvedBinaries");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Combine defaults with approved ones
      const combined = [
        ...inventory.filter(item => !parsed.some(p => p.name === item.name)),
        ...parsed
      ];
      setInventory(combined);
      if (combined.length > 0) {
        setSelectedBinary(combined[0]);
      }
    } else {
      setSelectedBinary(inventory[0]);
    }
  }, []);

  const handleToggleWorkstation = (id) => {
    setWorkstations(prev => prev.map(w => w.id === id ? { ...w, checked: !w.checked } : w));
  };

  const handleSelectAllWorkstations = (val) => {
    setWorkstations(prev => prev.map(w => ({ ...w, checked: val })));
  };

  const handleTriggerCanary = () => {
    if (!adminKey) {
      alert("Administrator cryptokey signature is required for authorization!");
      return;
    }
    const selectedHosts = workstations.filter(w => w.checked);
    if (selectedHosts.length === 0) {
      alert("Please select at least one target workstation for the upgrade!");
      return;
    }
    if (!selectedBinary) {
      alert("Please select an approved binary from the inventory!");
      return;
    }

    setIsUpgrading(true);
    setRollbackAnomalies(false);
    setUpgradeLogs([
      `Initializing OTA session for binary: ${selectedBinary.name}`,
      `Selected targets: ${selectedHosts.map(h => h.hostname).join(", ")}`,
      "Verifying unprivileged 'secops-run' user execution environment on target daemons...",
      "Status: Credentials Verified (No elevation required. Security level sandbox applied.)",
      "Establishing mutual TLS secure tunnel to containment receivers...",
      `Piping upgrade stream to canary tier (${canaryRate}% target weight)...`
    ]);

    setTimeout(() => {
      setUpgradeLogs(prev => [
        ...prev,
        "Developer Signature Hash: VALIDATED (Matched Spinovation trust store)",
        "Admin Signature Hash: VALIDATED",
        "Dual-Key Verification: SUCCESSFUL. Pushing update packages...",
        "Executing unprivileged setup script: 'secops-run --install-ota'..."
      ]);
    }, 1500);

    setTimeout(() => {
      if (canaryRate > 50) {
        setUpgradeLogs(prev => [
          ...prev,
          "ALERT: High-Severity memory anomaly detected on node 'london-ws-02'!",
          "Canary verification: FAILURE detected (process crash within audit window).",
          "INITIATING CANARY CANCEL & AUTOMATED ROLLBACK PROTOCOL...",
          "Downgrading affected nodes back to stable baseline...",
          "Canary Rollback Complete: FLEET STABLE. Error logs piped to clickhouse for audit."
        ]);
        setRollbackAnomalies(true);
        setIsUpgrading(false);
      } else {
        setUpgradeLogs(prev => [
          ...prev,
          "Agent host package installations completed successfully.",
          "Verifying workstation state post-upgrade...",
          `Update fully applied and verified on selected workstations. Version registry updated.`
        ]);
        setIsUpgrading(false);
      }
    }, 4500);
  };

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          OTA Upgrade Center & Fleet Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cryptographically signed, unprivileged OTA agent upgrades and canary deployments via secure gRPC control streams.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Inventory & Fleet Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Software Inventory Registry */}
          <div className="glass-panel p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Approved Software Inventory</h2>
              <span className="text-xs font-mono text-cyan-600 bg-slate-100 px-2 py-1 rounded">OTA Eligible Registry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase bg-slate-50/50">
                    <th className="p-3">Software Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Approved Date</th>
                    <th className="p-3">Build Signature Hash</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {inventory.map((item, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-slate-50 cursor-pointer ${
                        selectedBinary?.name === item.name ? "bg-violet-50/60 font-semibold" : ""
                      }`}
                      onClick={() => setSelectedBinary(item)}
                    >
                      <td className="p-3 text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-500">{item.type}</td>
                      <td className="p-3 text-slate-500">{item.approvedAt}</td>
                      <td className="p-3 text-cyan-600 truncate max-w-[120px]">{item.signature}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          READY
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-Workstation Selection List */}
          <div className="glass-panel p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Target Workstation Fleet</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSelectAllWorkstations(true)}
                  className="text-xs font-bold text-violet-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => handleSelectAllWorkstations(false)}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workstations.map((ws) => (
                <div 
                  key={ws.id}
                  onClick={() => handleToggleWorkstation(ws.id)}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    ws.checked ? "border-violet-500 bg-violet-50/40" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={ws.checked}
                      onChange={() => {}} // handled by div click
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{ws.hostname}</h4>
                      <p className="text-xs text-slate-400 font-mono">{ws.ip} &bull; {ws.os}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-mono font-bold">
                    {ws.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privilege Audit Log / Architecture Panel */}
          <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-500 font-bold flex items-center gap-2">
              🛡️ Unprivileged Agent Upgrade Architecture (secops-run)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              uSecOps agents are built to upgrade entirely under the <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-cyan-700">secops-run</code> daemon account. 
              <strong> The OTA Upgrade Server never requires root, Administrator, or elevated system privileges to apply binaries on client endpoints.</strong> 
              All execution streams are verified through standard user-level cryptographic signature handshakes, minimizing attack surfaces.
            </p>
          </div>

        </div>

        {/* Right Column - Live Topology & deployment status */}
        <div className="lg:col-span-1 space-y-6">

          {/* Hub/Spoke SVG Model */}
          <div className="glass-panel p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Deployment Topology Map</h3>
              <p className="text-xs text-slate-400">Live Hub/Spoke dynamic update streams</p>
            </div>

            <div className="my-6 bg-slate-900 rounded-lg border border-slate-800 h-[240px] flex items-center justify-center relative overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 300 240" className="w-full h-full">
                {/* Connection lines from center (150, 120) */}
                {/* Boston Line */}
                <line 
                  x1="150" y1="120" x2="60" y2="60" 
                  stroke={workstations[0].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={workstations[0].checked ? "2" : "1"}
                  className={isUpgrading && workstations[0].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* London Line */}
                <line 
                  x1="150" y1="120" x2="240" y2="60" 
                  stroke={workstations[1].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={workstations[1].checked ? "2" : "1"}
                  className={isUpgrading && workstations[1].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* Tokyo Line */}
                <line 
                  x1="150" y1="120" x2="50" y2="180" 
                  stroke={workstations[2].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={workstations[2].checked ? "2" : "1"}
                  className={isUpgrading && workstations[2].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* NYC Line */}
                <line 
                  x1="150" y1="120" x2="250" y2="180" 
                  stroke={workstations[3].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={workstations[3].checked ? "2" : "1"}
                  className={isUpgrading && workstations[3].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* Mainframe Line */}
                <line 
                  x1="150" y1="120" x2="150" y2="200" 
                  stroke={workstations[4].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={workstations[4].checked ? "2" : "1"}
                  className={isUpgrading && workstations[4].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />

                {/* Animated Pulsing Circles during upgrades */}
                {isUpgrading && workstations.map((ws, i) => {
                  if (!ws.checked) return null;
                  let targetX = 60, targetY = 60;
                  if (i === 1) { targetX = 240; targetY = 60; }
                  if (i === 2) { targetX = 50; targetY = 180; }
                  if (i === 3) { targetX = 250; targetY = 180; }
                  if (i === 4) { targetX = 150; targetY = 200; }
                  return (
                    <circle key={ws.id} cx="150" cy="120" r="4" fill="#10b981">
                      <animateMotion 
                        path={`M 0 0 L ${targetX - 150} ${targetY - 120}`} 
                        dur="1.5s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  );
                })}

                {/* Hub node */}
                <circle cx="150" cy="120" r="16" fill="#8b5cf6" className={isUpgrading ? "animate-pulse" : ""} />
                <text x="150" y="124" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">OTA</text>

                {/* Spoke nodes */}
                {/* Boston */}
                <circle cx="60" cy="60" r="10" fill={workstations[0].checked ? "#4f46e5" : "#1e293b"} />
                <text x="60" y="45" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">BOS</text>

                {/* London */}
                <circle cx="240" cy="60" r="10" fill={workstations[1].checked ? "#4f46e5" : "#1e293b"} />
                <text x="240" y="45" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">LDN</text>

                {/* Tokyo */}
                <circle cx="50" cy="180" r="10" fill={workstations[2].checked ? "#4f46e5" : "#1e293b"} />
                <text x="50" y="198" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">NRT</text>

                {/* NYC */}
                <circle cx="250" cy="180" r="10" fill={workstations[3].checked ? "#4f46e5" : "#1e293b"} />
                <text x="250" y="198" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">NYC</text>

                {/* Mainframe */}
                <circle cx="150" cy="200" r="10" fill={workstations[4].checked ? "#4f46e5" : "#1e293b"} />
                <text x="150" y="218" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">MF01</text>
              </svg>
            </div>

            {/* Upgrade triggers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Canary Scale</span>
                  <span className="font-mono text-cyan-600 font-bold">{canaryRate}% of fleet</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={canaryRate}
                  onChange={(e) => setCanaryRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">Auth Key Approval Signature</span>
                <input 
                  type="password" 
                  value={adminKey} 
                  onChange={(e) => setAdminKey(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-xs text-violet-700 focus:outline-none"
                  placeholder="Enter crypto admin token key"
                />
              </div>

              <button
                onClick={handleTriggerCanary}
                disabled={isUpgrading}
                className="w-full btn-glass btn-glass-success justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
              >
                {isUpgrading ? "⚡ Pushing Agent Binaries..." : "🚀 Deploy Approved OTA Update"}
              </button>
            </div>
          </div>

          {/* gRPC Logs Console */}
          <div className="glass-panel p-6 border border-slate-200 min-h-[200px] flex flex-col justify-between">
            <h4 className="text-xs font-mono uppercase text-slate-500 font-bold mb-2">gRPC Upgrade Stream Logs</h4>
            <div className="flex-1 min-h-[140px] bg-[#0f172a] rounded p-3 font-mono text-[9px] text-cyan-400 space-y-1.5 overflow-y-auto">
              {upgradeLogs.length > 0 ? (
                upgradeLogs.map((log, idx) => {
                  const isAnomaly = log.includes("ALERT") || log.includes("FAILURE");
                  const isRollback = log.includes("ROLLBACK") || log.includes("Downgrading");
                  
                  let txtColor = "text-cyan-300";
                  if (isAnomaly) txtColor = "text-rose-400 font-bold";
                  if (isRollback) txtColor = "text-amber-400 font-bold";

                  return (
                    <div key={idx} className="flex gap-1.5">
                      <span>&gt;</span>
                      <span className={txtColor}>{log}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-600 flex items-center justify-center h-full text-center">
                  Control channel idle. Select target workstations and trigger deployment.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes strokeDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .stroke-dash-animation {
          animation: strokeDash 1.5s linear infinite;
        }
      `}</style>

    </div>
  );
}
