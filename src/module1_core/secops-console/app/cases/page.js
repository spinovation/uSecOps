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

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Mail Server Config State
  const [mailServerType, setMailServerType] = useState("SMTP");
  const [mailHost, setMailHost] = useState("smtp.secops.spino.internal");
  const [mailPort, setMailPort] = useState("587");
  const [mailUser, setMailUser] = useState("alerts-relay@spino.internal");
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [mailTestStatus, setMailTestStatus] = useState("DISCONNECTED");

  const [cases, setCases] = useState([
    {
      id: "SEC-CASE-402",
      title: "Account Takeover (ATO) - Impossible Travel Anomaly",
      reporter: "SIEM Correlation Engine",
      assignedTo: "Analyst Alpha",
      status: "OPEN", // OPEN, ON_HOLD, CLOSED
      severity: "CRITICAL", // CRITICAL, HIGH, MEDIUM, LOW
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
      status: "OPEN",
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
    },
    {
      id: "SEC-CASE-399",
      title: "Outdated Nxlog Log Agent Alert Forwarder",
      reporter: "System Registry Monitor",
      assignedTo: "SOC Automation Bot",
      status: "ON_HOLD",
      severity: "MEDIUM",
      mitre: "T1543 - Create or Modify System Process",
      piiData: { masked: "User: sys*****@spino******.com", raw: "User: system-service-account" },
      evidence: [
        "Upgrades Mart: Nxlog binary matched old CVE signature registry profile.",
        "System: Awaiting approved binary OTA package upload to proceed with auto-upgrade."
      ],
      playbooks: [
        { name: "Schedule Low-Privilege OTA Upgrade", action: "gRPC send upgrade_command", impact: "LOW" }
      ]
    },
    {
      id: "SEC-CASE-395",
      title: "Phishing Attachment Defended & Blocked",
      reporter: "Microsoft Defender API",
      assignedTo: "Security Orchestrator",
      status: "CLOSED",
      severity: "LOW",
      mitre: "T1566 - Phishing",
      piiData: { masked: "User: mark*****@spino******.com", raw: "User: mark_sales@spinovation.com" },
      evidence: [
        "Email Gate: Blocked payload 'invoice_982b.pdf.exe' immediately in cloud sandbox.",
        "System: Sandbox reported dynamic attempt to modify system registry. Dropped session."
      ],
      playbooks: []
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
    }, 1200);

    setTimeout(() => {
      setPlaybookLogs(prev => [
        ...prev,
        "Verification check: Host communications blocked / AD status set to suspended.",
        "Case status automatically updated to containment-applied.",
        "SOAR PLAYBOOK EXECUTION COMPLETED SECURELY."
      ]);
      setIsExecutingPlaybook(false);
      
      const updatedCases = cases.map(c => 
        c.id === selectedCase.id ? { ...c, status: "CLOSED" } : c
      );
      setCases(updatedCases);
      setSelectedCase(prev => ({ ...prev, status: "CLOSED" }));
      
      // Notify via mail config if connected
      if (mailTestStatus === "CONNECTED") {
        console.log(`[SMTP Notify] Case ${selectedCase.id} closed. Alert sent to ${mailUser}`);
      }
    }, 2500);
  };

  const handleTestMailConnectivity = () => {
    setIsTestingMail(true);
    setMailTestStatus("CONNECTING");
    
    setTimeout(() => {
      setIsTestingMail(false);
      setMailTestStatus("CONNECTED");
    }, 1500);
  };

  // Case filtering
  const filteredCases = cases.filter(c => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Relational Case Ticketing Workspace
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Relational Postgres ticket models synchronized with human-in-the-loop containment orchestration triggers and mail notification alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Board with filter */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-slate-800">Incident Ticket Board</h2>
            
            {/* Status Filter Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold w-full">
              {["ALL", "OPEN", "ON_HOLD", "CLOSED"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 py-1 rounded-md transition-all text-center ${
                    statusFilter === filter 
                      ? "bg-white text-violet-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-lg border cursor-pointer glass-panel ${
                  selectedCase?.id === c.id ? "border-violet-500 bg-violet-50/60" : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                  <span className="text-cyan-600 font-semibold">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    c.severity === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-200" :
                    c.severity === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-200" :
                    c.severity === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {c.severity}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 truncate">{c.title}</h3>
                
                <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-mono">
                  <span>Assigned: {c.assignedTo}</span>
                  <span className={`font-semibold uppercase ${
                    c.status === "OPEN" ? "text-rose-600" :
                    c.status === "ON_HOLD" ? "text-amber-600" :
                    "text-emerald-600"
                  }`}>{c.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Case Workspace details & Mail integration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected Case details */}
          <div className="glass-panel p-6 min-h-[420px] flex flex-col justify-between border border-slate-200">
            {selectedCase ? (
              <div className="space-y-6">
                
                {/* Header detail */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-600 font-bold">{selectedCase.id}</span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{selectedCase.title}</h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Reporter: {selectedCase.reporter} | MITRE TTP: <span className="font-mono text-violet-600">{selectedCase.mitre}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-3 py-1 border rounded font-mono text-xs font-semibold ${
                      selectedCase.status === "OPEN" ? "bg-rose-50 text-rose-600 border-rose-200" :
                      selectedCase.status === "ON_HOLD" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>
                      STATUS: {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* Evidence Pin Canvas */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">Forensic Evidence Pin Canvas</h3>
                  <div className="space-y-2">
                    {selectedCase.evidence.map((line, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-[11px] text-slate-700 flex items-start gap-2.5">
                        <span className="text-slate-400 mt-0.5">📌</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PII Privacy Panel */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">PII Privacy Control System</span>
                    <span className="text-xs font-mono text-slate-800 font-semibold">
                      {isPIIUnmasked ? selectedCase.piiData.raw : selectedCase.piiData.masked}
                    </span>
                    {isPIIUnmasked && (
                      <span className="text-[9px] text-amber-600 block font-mono">⚠️ Expiring: {unmaskTimeLeft}</span>
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

                {/* Containment playbooks */}
                {selectedCase.playbooks.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">Containment Playbooks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCase.playbooks.map((playbook, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">{playbook.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                                playbook.impact === "HIGH" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                              }`}>
                                IMPACT: {playbook.impact}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">{playbook.action}</p>
                          </div>
                          
                          <button
                            onClick={() => handleTriggerPlaybook(playbook)}
                            disabled={selectedCase.status === "CLOSED" || isExecutingPlaybook}
                            className="btn-glass btn-glass-danger justify-center text-[10px] font-bold uppercase tracking-wider font-mono py-1.5"
                          >
                            {selectedCase.status === "CLOSED" ? "✅ Resolved & Closed" : "⚡ Trigger Containment"}
                          </button>
                        </div>
                      ))}
                    </div>

                    {playbookLogs.length > 0 && (
                      <div className="bg-[#0f172a] border border-slate-800 rounded p-4 font-mono text-[10px] text-cyan-400 space-y-1.5 max-h-[150px] overflow-y-auto">
                        {playbookLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span>&gt;</span>
                            <span className={log.includes("COMPLETED") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <span className="text-4xl mb-4">🎟️</span>
                <h3 className="text-sm font-bold text-slate-600">Select an Incident Case</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  Select an incident ticket from the board to access its evidence pin canvas and initiate containment actions.
                </p>
              </div>
            )}
          </div>

          {/* Organization Mail Server Integration Panel */}
          <div className="glass-panel p-6 border border-slate-200 space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">SOC Mail Server Integration</h3>
                <p className="text-[11px] text-slate-400">Configure notifications for incident assignments and status closures.</p>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                mailTestStatus === "CONNECTED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                mailTestStatus === "CONNECTING" ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse" :
                "bg-slate-50 text-slate-600 border-slate-200"
              }`}>
                {mailTestStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Server Type</label>
                  <select 
                    value={mailServerType}
                    onChange={(e) => setMailServerType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700"
                  >
                    <option value="SMTP">SMTP (Local Relay)</option>
                    <option value="EXCHANGE">Microsoft Exchange</option>
                    <option value="GOOGLE">Google Workspace API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Relay Host Address</label>
                  <input 
                    type="text" 
                    value={mailHost}
                    onChange={(e) => setMailHost(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Port</label>
                    <input 
                      type="text" 
                      value={mailPort}
                      onChange={(e) => setMailPort(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">TLS / SSL</label>
                    <div className="flex items-center h-9 pl-1">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <span className="text-[11px] text-slate-600 ml-2">Enforced</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sender Email Identity</label>
                  <input 
                    type="text" 
                    value={mailUser}
                    onChange={(e) => setMailUser(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleTestMailConnectivity}
                disabled={isTestingMail}
                className="flex-1 btn-glass justify-center text-xs py-2 font-bold uppercase tracking-wider font-mono"
              >
                {isTestingMail ? "⚡ Testing secure auth endpoint..." : "⚙️ Test SMTP Credentials Connection"}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Containment Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-glow-danger space-y-6 bg-white">
            <div className="space-y-2">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-lg font-extrabold text-rose-600 uppercase tracking-wide">
                Containment Action Authorization Request
              </h2>
              <p className="text-xs text-slate-700">
                This containment playbook step has a <span className="text-rose-600 font-bold">HIGH IMPACT</span> rating and demands physical administrative approval before execution.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-700 space-y-2">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">TARGET ACTION</span>
                <span className="text-slate-800 font-semibold">{activePlaybookStep.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">CONTAINMENT INTERFACE CALL</span>
                <span className="text-cyan-700 text-[10px] break-all">{activePlaybookStep.action}</span>
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
