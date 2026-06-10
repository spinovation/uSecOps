"use client";

import { useState } from "react";

export default function Upgrades() {
  const [canaryRate, setCanaryRate] = useState(1);
  const [developerSignature, setDeveloperSignature] = useState("SHA256:4fa38c92b8cd0901eef982c730ff18efbc73a11a842f1f0da8cb2142e88a08ff");
  const [adminKey, setAdminKey] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeLogs, setUpgradeLogs] = useState([]);
  const [rollbackAnomalies, setRollbackAnomalies] = useState(false);

  const handleTriggerCanary = () => {
    if (!adminKey) {
      alert("Administrator cryptokey signature is required for authorization!");
      return;
    }
    setIsUpgrading(true);
    setUpgradeLogs([
      "Contacting gRPC Patch server central daemon...",
      `Deploying upgrade container to ${canaryRate}% of registered fleet agents (Canary Tier 1)...`,
      "Enforcing Dual-Signature cryptographic handshake..."
    ]);

    setTimeout(() => {
      setUpgradeLogs(prev => [
        ...prev,
        "Developer Signature Hash: VALIDATED (Matched Spinovation trust store)",
        "Admin Signature Hash: VALIDATED",
        "Dual-Key Verification: SUCCESSFUL. Pushing update packages..."
      ]);
    }, 1500);

    setTimeout(() => {
      if (canaryRate > 10) {
        // Mock a canary rollback scenario for demonstration if rate is high
        setUpgradeLogs(prev => [
          ...prev,
          "ALERT: High-Severity memory anomaly detected on host node 'Ubuntu-App-94'!",
          "Canary verification: FAILURE detected (process crash within 10-minute audit window).",
          "INITIATING CANARY CANCEL & AUTOMATED ROLLBACK PROTOCOL...",
          "Downgrading affected nodes back to stable v0.9.8...",
          "Canary Rollback Complete: FLEET STABLE. Error logs piped to clickhouse for audit."
        ]);
        setRollbackAnomalies(true);
        setIsUpgrading(false);
      } else {
        setUpgradeLogs(prev => [
          ...prev,
          "Agent host package installations completed successfully.",
          "Verifying system state and connections...",
          `Update fully applied and verified on ${canaryRate}% of agent nodes. All channels operational.`
        ]);
        setIsUpgrading(false);
      }
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          OTA Patch & Upgrade Control Panel
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cryptographically signed OTA agent upgrades and canary deployments via bi-directional secure gRPC streams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upgrade Form Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Configure Update Deployment</h2>

            {/* Canary Scope Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700">Canary Target Fleet Scale</span>
                <span className="font-mono text-cyan-600 font-bold text-base">{canaryRate}% of fleet ({Math.ceil(1489 * canaryRate / 100)} hosts)</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={canaryRate}
                onChange={(e) => setCanaryRate(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1% (CANARY STAGE 1)</span>
                <span>10% (CANARY STAGE 2)</span>
                <span>50% (STAGED WIDE)</span>
                <span>100% (FULL FLEET)</span>
              </div>
            </div>

            {/* Dual Signatures */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-mono uppercase text-slate-500 font-bold">Dual-Signature Cryptographic Trust Validation</h3>

              {/* Developer Sign */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-mono block">1. Developer Build Signature Hash (Read-Only Verified)</label>
                <input
                  type="text"
                  readOnly
                  value={developerSignature}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-cyan-700 select-all"
                />
              </div>

              {/* Admin Sign Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-700 font-semibold block">2. Enter Administrator Cryptographic Approval Key</label>
                <input
                  type="password"
                  placeholder="Enter SecOps Administrative signature hash key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs text-violet-700 focus:outline-none focus:border-violet-500"
                />
                <span className="text-[10px] text-slate-500 block">Required to authorize deployment command transmission over the active control plane.</span>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
              <button
                onClick={handleTriggerCanary}
                disabled={isUpgrading}
                className="w-full btn-glass btn-glass-success justify-center text-sm py-3 font-bold uppercase tracking-wider font-mono"
              >
                {isUpgrading ? "⚡ Executing Staged Canary Patch..." : "🚀 Authenticate & Deploy Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Live gRPC Control console logs */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">gRPC Control Plane logs</h3>
              <p className="text-xs text-slate-500 mt-1">Bi-directional connection activity console</p>
            </div>

            <div className="flex-1 my-4 min-h-[220px] bg-[#0f172a] border border-slate-800 rounded p-4 overflow-y-auto font-mono text-[10px] leading-relaxed text-cyan-400 space-y-2">
              {upgradeLogs.length > 0 ? (
                upgradeLogs.map((log, idx) => {
                  const isAnomaly = log.includes("ALERT") || log.includes("FAILURE");
                  const isRollback = log.includes("ROLLBACK") || log.includes("Downgrading");
                  
                  let txtColor = "text-cyan-300";
                  if (isAnomaly) txtColor = "text-rose-400 font-bold";
                  if (isRollback) txtColor = "text-amber-400 font-bold";

                  return (
                    <div key={idx} className="flex gap-2">
                      <span>&gt;</span>
                      <span className={txtColor}>{log}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-full text-center">
                  Bi-directional control channel idle. Ready to deploy signed update.
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Canary Health status:</span>
                <span className={rollbackAnomalies ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {rollbackAnomalies ? "CANARY_ANOMALY (ROLLED BACK)" : isUpgrading ? "MONITORING..." : "IDLE"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Upgrade Canary Threshold:</span>
                <span>10% Limit before full-fleet push</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
