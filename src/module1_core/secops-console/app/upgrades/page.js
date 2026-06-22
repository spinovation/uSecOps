"use client";

import { useState } from "react";

export default function Upgrades() {
  const [canaryRate, setCanaryRate] = useState(10);
  const [developerSignature, setDeveloperSignature] = useState("SHA256:4fa38c92b8cd0901eef982c730ff18efbc73a11a842f1f0da8cb2142e88a08ff");
  const [adminKey, setAdminKey] = useState("SHA256:7c9e0123fabcd88998877eeff2024aa8823cdab882ee0a1122bcdaffeeddccb1");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeLogs, setUpgradeLogs] = useState([]);
  const [rollbackAnomalies, setRollbackAnomalies] = useState(false);
  
  // Clustered Appliance Nodes
  const [applianceNodes, setApplianceNodes] = useState([
    { id: "node-1", name: "core-node-boston-01", ip: "10.100.12.45", role: "Module 1: Core", status: "ONLINE", checked: true },
    { id: "node-2", name: "lakehouse-replica-london-02", ip: "10.100.14.78", role: "Module 2: Lakehouse", status: "ONLINE", checked: true },
    { id: "node-3", name: "core-node-tokyo-03", ip: "10.100.15.12", role: "Module 1: Core", status: "ONLINE", checked: false },
    { id: "node-4", name: "lakehouse-replica-nyc-04", ip: "10.100.16.88", role: "Module 2: Lakehouse", status: "ONLINE", checked: false }
  ]);

  // Approved Upgrade packages inventory
  const inventory = [
    { name: "usecops-core-v2.0.1.tar.gz", type: "Core App Upgrade", approvedAt: "2026-06-20", signature: "SHA256:88fa2b109cc...", status: "ACTIVE" },
    { name: "lakehouse-partition-v2.0.0.sql", type: "Lakehouse Schema", approvedAt: "2026-06-21", signature: "SHA256:1a2c3d4e5f...", status: "ACTIVE" }
  ];

  const [selectedPackage, setSelectedPackage] = useState(inventory[0]);

  const handleToggleNode = (id) => {
    setApplianceNodes(prev => prev.map(n => n.id === id ? { ...n, checked: !n.checked } : n));
  };

  const handleSelectAllNodes = (val) => {
    setApplianceNodes(prev => prev.map(n => ({ ...n, checked: val })));
  };

  const handleTriggerUpgrade = () => {
    if (!adminKey) {
      alert("Administrator cryptokey signature is required for authorization!");
      return;
    }
    const selectedHosts = applianceNodes.filter(n => n.checked);
    if (selectedHosts.length === 0) {
      alert("Please select at least one target appliance node for the upgrade!");
      return;
    }
    if (!selectedPackage) {
      alert("Please select an approved package from the inventory!");
      return;
    }

    setIsUpgrading(true);
    setRollbackAnomalies(false);
    setUpgradeLogs([
      `Initializing unprivileged update session for package: ${selectedPackage.name}`,
      `Selected targets: ${selectedHosts.map(h => h.name).join(", ")}`,
      "Verifying unprivileged 'secops-run' user execution environment on target containers...",
      "Status: Credentials Verified (Standard user credentials - no root/sudo elevation required.)",
      "Deploying container upgrade packets over local microsegment networks...",
      `Piping upgrade stream with canary rate scaling (${canaryRate}%)...`
    ]);

    setTimeout(() => {
      setUpgradeLogs(prev => [
        ...prev,
        "Developer Signature Hash: VALIDATED (Matched trust signature store)",
        "Admin Signature Hash: VALIDATED",
        "Dual-Key Handshake verification: SUCCESSFUL. Pushing update containers...",
        "Executing unprivileged update command: 'secops-run --apply-module-upgrade'..."
      ]);
    }, 1500);

    setTimeout(() => {
      if (canaryRate > 50) {
        setUpgradeLogs(prev => [
          ...prev,
          "ALERT: High-Severity memory anomaly detected on container 'lakehouse-replica-london-02'!",
          "Canary verification: FAILURE detected (process crash within audit window).",
          "INITIATING UNPRIVILEGED CONTAINER ROLLBACK PROTOCOL...",
          "Restoring backup container state back to stable baseline...",
          "Canary Rollback Complete: APPLIANCE STABLE."
        ]);
        setRollbackAnomalies(true);
        setIsUpgrading(false);
      } else {
        setUpgradeLogs(prev => [
          ...prev,
          "Appliance container package updates completed successfully.",
          "Verifying system state and connections...",
          `Update fully applied and verified on selected appliance nodes.`
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
          Module 3: Patch & Upgrade Control Panel
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cryptographically signed, unprivileged module upgrades for Module 1 (Core) and Module 2 (Lakehouse) containers.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Inventory & Fleet Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Software Inventory Registry */}
          <div className="glass-panel p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Approved Upgrade Packages</h2>
              <span className="text-xs font-mono text-cyan-600 bg-slate-100 px-2 py-1 rounded">Unprivileged Registry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase bg-slate-50/50">
                    <th className="p-3">Package Name</th>
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
                        selectedPackage?.name === item.name ? "bg-violet-50/60 font-semibold" : ""
                      }`}
                      onClick={() => setSelectedPackage(item)}
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

          {/* Multi-Node Selection List */}
          <div className="glass-panel p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Appliance Clustered Nodes</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSelectAllNodes(true)}
                  className="text-xs font-bold text-violet-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => handleSelectAllNodes(false)}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applianceNodes.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => handleToggleNode(node.id)}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    node.checked ? "border-violet-500 bg-violet-50/40" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={node.checked}
                      onChange={() => {}} // handled by div click
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{node.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{node.ip} &bull; {node.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-mono font-bold">
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privilege Audit Log / Architecture Panel */}
          <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-500 font-bold flex items-center gap-2">
              🛡️ Unprivileged Module Upgrade Architecture (secops-run)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Module 1 (Core) and Module 2 (Lakehouse) containers run under standard sandbox directories. Upgrades are piped over secure VLAN segments and applied by the local <code className="bg-slate-200 px-1 py-0.5 rounded text-cyan-700">secops-run</code> daemon, requiring zero root or privileged credential allocation.
            </p>
          </div>

        </div>

        {/* Right Column - Live Topology & deployment status */}
        <div className="lg:col-span-1 space-y-6">

          {/* Hub/Spoke SVG Model */}
          <div className="glass-panel p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Deployment Topology Map</h3>
              <p className="text-xs text-slate-400">Pulsing update streams to active modules</p>
            </div>

            <div className="my-6 bg-slate-900 rounded-lg border border-slate-800 h-[240px] flex items-center justify-center relative overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 300 240" className="w-full h-full">
                
                {/* Connection lines from center (150, 120) */}
                {/* Boston Line */}
                <line 
                  x1="150" y1="120" x2="60" y2="60" 
                  stroke={applianceNodes[0].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={applianceNodes[0].checked ? "2" : "1"}
                  className={isUpgrading && applianceNodes[0].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* London Line */}
                <line 
                  x1="150" y1="120" x2="240" y2="60" 
                  stroke={applianceNodes[1].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={applianceNodes[1].checked ? "2" : "1"}
                  className={isUpgrading && applianceNodes[1].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* Tokyo Line */}
                <line 
                  x1="150" y1="120" x2="50" y2="180" 
                  stroke={applianceNodes[2].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={applianceNodes[2].checked ? "2" : "1"}
                  className={isUpgrading && applianceNodes[2].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />
                {/* NYC Line */}
                <line 
                  x1="150" y1="120" x2="250" y2="180" 
                  stroke={applianceNodes[3].checked ? "#8b5cf6" : "#475569"} 
                  strokeWidth={applianceNodes[3].checked ? "2" : "1"}
                  className={isUpgrading && applianceNodes[3].checked ? "stroke-dash-animation" : ""}
                  strokeDasharray="5, 5"
                />

                {/* Animated Pulsing Circles during upgrades */}
                {isUpgrading && applianceNodes.map((node, i) => {
                  if (!node.checked) return null;
                  let targetX = 60, targetY = 60;
                  if (i === 1) { targetX = 240; targetY = 60; }
                  if (i === 2) { targetX = 50; targetY = 180; }
                  if (i === 3) { targetX = 250; targetY = 180; }
                  return (
                    <circle key={node.id} cx="150" cy="120" r="4" fill="#10b981">
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
                <text x="150" y="124" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">PATCH</text>

                {/* Spoke nodes */}
                {/* Boston */}
                <circle cx="60" cy="60" r="10" fill={applianceNodes[0].checked ? "#4f46e5" : "#1e293b"} />
                <text x="60" y="45" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">CORE1</text>

                {/* London */}
                <circle cx="240" cy="60" r="10" fill={applianceNodes[1].checked ? "#4f46e5" : "#1e293b"} />
                <text x="240" y="45" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">LAKE1</text>

                {/* Tokyo */}
                <circle cx="50" cy="180" r="10" fill={applianceNodes[2].checked ? "#4f46e5" : "#1e293b"} />
                <text x="50" y="198" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">CORE2</text>

                {/* NYC */}
                <circle cx="250" cy="180" r="10" fill={applianceNodes[3].checked ? "#4f46e5" : "#1e293b"} />
                <text x="250" y="198" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">LAKE2</text>
              </svg>
            </div>

            {/* Upgrade triggers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 font-mono">Canary Rate</span>
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
                onClick={handleTriggerUpgrade}
                disabled={isUpgrading}
                className="w-full btn-glass btn-glass-success justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
              >
                {isUpgrading ? "⚡ Pushing Packages..." : "🚀 Deploy Signed Module Upgrade"}
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
                  const isRollback = log.includes("ROLLBACK") || log.includes("Restoring");
                  
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
                  Control channel idle. Select target nodes and deploy update.
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
