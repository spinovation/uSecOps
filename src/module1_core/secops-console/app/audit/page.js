"use client";

import { useState } from "react";

export default function AuditLogs() {
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [breakGlassState, setBreakGlassState] = useState("IDLE");
  const [breakGlassLogs, setBreakGlassLogs] = useState([]);
  
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
