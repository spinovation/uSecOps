"use client";

import { useState } from "react";

export default function Cases() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isPIIUnmasked, setIsPIIUnmasked] = useState(false);
  const [unmaskTimeLeft, setUnmaskTimeLeft] = useState("");
  const [activePlaybookStep, setActivePlaybookStep] = useState(null);
  const [playbookLogs, setPlaybookLogs] = useState([]);
  const [isExecutingPlaybook, setIsExecutingPlaybook] = useState(false);

  const [cases, setCases] = useState([
    {
      id: "SEC-CASE-402",
      title: "Account Takeover (ATO) - Impossible Travel Anomaly",
      reporter: "SIEM Correlation Engine",
      assignedTo: "Analyst Alpha",
      status: "UNDER_INVESTIGATION",
      severity: "CRITICAL",
      mitre: "T1078 - Valid Accounts",
      piiData: { masked: "User: sri*****@spino******.com", raw: "User: sridhargs@spinovation.com" },
      evidence: [
        "Windows Log Mart: Logon succeeded from external unmanaged IP 184.22.91.4 (Tokyo, JP)",
        "Tanium Agent: Node 'MacBook-Pro-Sri' concurrently logged on from IP 72.15.110.82 (Boston, US)",
        "Time delta: 12 minutes. Distance geovelocity: 6,700 miles. Travel Impossible."
      ],
      playbooks: [
        { name: "Isolate Endpoint Host", action: "Tanium agent quarantine API block", impact: "HIGH" },
        { name: "Suspend SSO Credentials", action: "SailPoint IGA active directory credential suspend", impact: "MEDIUM" }
      ]
    },
    {
      id: "SEC-CASE-401",
      title: "Suspicious Locked User Accounts Spike",
      reporter: "UEBA Baseline profiling",
      assignedTo: "Analyst Beta",
      status: "NEW",
      severity: "HIGH",
      mitre: "T1110 - Brute Force",
      piiData: { masked: "User: adm*****@spino******.com", raw: "User: admin@spinovation.com" },
      evidence: [
        "Identity Mart: 45 authentication lockouts logged in 90 seconds across 6 unique hosts",
        "Active Directory: Lockout counter threshold triggered for security domain group 'SEC-ADMINS'"
      ],
      playbooks: [
        { name: "Apply Smart Lockout Policies", action: "AD dynamic lock policy change", impact: "LOW" }
      ]
    }
  ]);

  const handleRequestUnmask = () => {
    setIsPIIUnmasked(true);
    setUnmaskTimeLeft("23 hours 59 minutes remaining");
    alert("Supervisor Request Approved! PII data will be unmasked. Raw access session tracking has been logged to ClickHouse immutable WORM storage. Token automatically expires in 24 hours.");
  };

  const handleTriggerPlaybook = (playbook) => {
    setActivePlaybookStep(playbook);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    setShowApprovalModal(false);
    setIsExecutingPlaybook(true);
    setPlaybookLogs([
      "Establishing mutual TLS secure tunnel to containment receiver...",
      `Triggering: ${activePlaybookStep.action}...`,
      "Handshaking dual approval supervisor tokens..."
    ]);

    setTimeout(() => {
      setPlaybookLogs(prev => [
        ...prev,
        "Command validation hash matches successfully.",
        "Executing containment command sequence...",
        "Containment response: Quarantined endpoint node / Suspended session tokens."
      ]);
    }, 1500);

    setTimeout(() => {
      setPlaybookLogs(prev => [
        ...prev,
        "Verification check: Host communications blocked / AD status set to suspended.",
        "Case status automatically updated to containment-applied.",
        "SOAR PLAYBOOK EXECUTION COMPLETED SECURELY."
      ]);
      setIsExecutingPlaybook(false);
      
      if (selectedCase.id === "SEC-CASE-402") {
        const updatedCases = cases.map(c => 
          c.id === "SEC-CASE-402" ? { ...c, status: "CONTAINMENT_APPLIED" } : c
        );
        setCases(updatedCases);
        setSelectedCase({ ...selectedCase, status: "CONTAINMENT_APPLIED" });
      }
    }, 3500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Relational Case Ticketing & SOAR Workspace
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Relational Postgres ticket models synchronized with human-in-the-loop SOAR containment orchestration triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cases List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Incident Ticket Board</h2>
          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-lg border cursor-pointer glass-panel ${
                  selectedCase?.id === c.id ? "border-violet-500 bg-violet-950/10" : "border-slate-800"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                  <span className="text-cyan-400 font-semibold">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    c.severity === "CRITICAL" ? "bg-rose-950/30 text-rose-400 border border-rose-500/20" : "bg-amber-950/30 text-amber-400 border border-amber-500/20"
                  }`}>
                    {c.severity}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 truncate">{c.title}</h3>
                <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono">
                  <span>Assigned: {c.assignedTo}</span>
                  <span className="text-cyan-300 font-semibold uppercase">{c.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Case Workspace Details */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 min-h-[500px] flex flex-col justify-between">
            {selectedCase ? (
              <div className="space-y-6">
                {/* Info block */}
                <div className="flex justify-between items-start gap-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedCase.id}</span>
                    <h2 className="text-lg font-extrabold text-slate-200 mt-0.5">{selectedCase.title}</h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Reporter: {selectedCase.reporter} | MITRE TTP: <span className="font-mono text-violet-300">{selectedCase.mitre}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="px-3 py-1 bg-violet-950/40 text-violet-200 border border-violet-500/30 rounded font-mono text-xs font-semibold">
                      STATUS: {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* Evidence Canvas Pins */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">Forensic Evidence Pin Canvas</h3>
                  <div className="space-y-2">
                    {selectedCase.evidence.map((line, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-slate-900 rounded-md font-mono text-[11px] text-slate-300 flex items-start gap-2.5">
                        <span className="text-slate-500 mt-0.5">📌</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PII Privacy unmasking */}
                <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">PII Privacy Control System</span>
                    <span className="text-xs font-mono text-slate-200 font-semibold">
                      {isPIIUnmasked ? selectedCase.piiData.raw : selectedCase.piiData.masked}
                    </span>
                    {isPIIUnmasked && (
                      <span className="text-[9px] text-amber-400 block font-mono">⚠️ Expiring: {unmaskTimeLeft}</span>
                    )}
                  </div>
                  
                  {!isPIIUnmasked && (
                    <button
                      onClick={handleRequestUnmask}
                      className="btn-glass text-[11px] font-bold uppercase tracking-wider font-mono py-1.5 px-3 shrink-0"
                    >
                      🔓 Request PII Unmasking
                    </button>
                  )}
                </div>

                {/* SOAR Containment Playbooks */}
                <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <h3 className="text-sm font-bold text-slate-200">Recommended Autonomic containment Playbooks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCase.playbooks.map((playbook, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-black/30 border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-200">{playbook.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                              playbook.impact === "HIGH" ? "bg-rose-950/20 text-rose-400 border border-rose-500/20" : "bg-amber-950/20 text-amber-400 border border-amber-500/20"
                            }`}>
                              IMPACT: {playbook.impact}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{playbook.action}</p>
                        </div>
                        
                        <button
                          onClick={() => handleTriggerPlaybook(playbook)}
                          disabled={selectedCase.status === "CONTAINMENT_APPLIED" || isExecutingPlaybook}
                          className="btn-glass btn-glass-danger justify-center text-[10px] font-bold uppercase tracking-wider font-mono py-1.5"
                        >
                          {selectedCase.status === "CONTAINMENT_APPLIED" ? "✅ Executed" : "⚡ Trigger Containment"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {playbookLogs.length > 0 && (
                    <div className="bg-black/70 border border-slate-900 rounded p-4 font-mono text-[10px] text-cyan-400 space-y-1.5 max-h-[150px] overflow-y-auto">
                      {playbookLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span>&gt;</span>
                          <span className={log.includes("COMPLETED") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <span className="text-4xl mb-4">🎟️</span>
                <h3 className="text-sm font-bold text-slate-300">Select a Ticket</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  Select an incident ticket from the board to access its evidence pin canvas and initiate containment actions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Containment Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-glow-danger space-y-6">
            <div className="space-y-2">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-lg font-extrabold text-rose-400 uppercase tracking-wide">
                Containment Action Authorization Request
              </h2>
              <p className="text-xs text-slate-300">
                This SOAR playbook step has a <span className="text-rose-400 font-bold">HIGH IMPACT</span> rating and demands physical administrative approval before execution.
              </p>
            </div>

            <div className="p-4 bg-black/40 border border-slate-900 rounded font-mono text-xs text-slate-300 space-y-2">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">TARGET ACTION</span>
                <span className="text-slate-200 font-semibold">{activePlaybookStep.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">CONTAINMENT INTERFACE CALL</span>
                <span className="text-cyan-400 text-[10px] break-all">{activePlaybookStep.action}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 btn-glass justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 btn-glass btn-glass-danger justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
