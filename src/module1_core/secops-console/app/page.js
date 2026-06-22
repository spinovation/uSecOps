"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [eps, setEps] = useState(14852);
  const [activeAlerts, setActiveAlerts] = useState(6);
  const [activePlaybookId, setActivePlaybookId] = useState(null);
  const [playbookLogs, setPlaybookLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Use Case Wizard states
  const [mitreCount, setMitreCount] = useState(24);
  const [priorityFilter, setPriorityFilter] = useState("HIGH");
  const [selectedCategory, setSelectedCategory] = useState("Account Misuse / Compromise");
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);

  // Data Sources Ingestion Status Mapping (simulating connected APIs)
  const [dataSourcesState] = useState({
    active_directory: { name: "Active Directory", status: "ONLINE", logs: ["Event 4624 (Logon)", "Event 4625 (Logon Fail)", "Event 4768 (TGT)", "Event 4771 (Pre-auth Fail)"] },
    aws_cloud: { name: "AWS CloudTrail", status: "ONLINE", logs: ["AssumeRole Events", "CreateUser Events", "ConsoleLogin Events"] },
    firewall: { name: "Next-Gen Firewall", status: "ONLINE", logs: ["Session Block Logs", "Packet Bandwidth Spikes", "Port Scan Events"] },
    edr_antivirus: { name: "EDR & Antivirus", status: "ONLINE", logs: ["Process Creation logs", "DLL Injection alerts", "File Quarantine events"] },
    gcp_cloud: { name: "GCP Pub/Sub Audits", status: "OFFLINE", logs: ["Admin Activity Logs", "Storage bucket Access logs"] },
    email_gateway: { name: "Email Secure Gateway", status: "OFFLINE", logs: ["SMTP Header Logs", "DMARC/SPF Failures", "Spam Alert logs"] }
  });

  // Use cases inventory list mapped from sheet
  const useCaseList = [
    { id: "UC-SEC-01", name: "Brute Force Attack on Active Directory", category: "Account Misuse / Compromise", priority: "HIGH", mitre: "T1110", sourceKey: "active_directory" },
    { id: "UC-SEC-02", name: "Google Initiated Review - Access from rare geolocation", category: "Account Misuse / Compromise", priority: "HIGH", mitre: "T1078", sourceKey: "gcp_cloud" },
    { id: "UC-SEC-03", name: "Activity from a Rare Country - Admin Accounts", category: "Account Misuse / Compromise", priority: "HIGH", mitre: "T1078", sourceKey: "active_directory" },
    { id: "UC-SEC-04", name: "Rare account performing admin activity", category: "Privilege misuse", priority: "MEDIUM", mitre: "T1078", sourceKey: "active_directory" },
    { id: "UC-SEC-05", name: "Rare privilege escalation through IAM instance profile", category: "Privilege misuse", priority: "MEDIUM", mitre: "T1548", sourceKey: "aws_cloud" },
    { id: "UC-SEC-06", name: "Potential Phishing URL received over email", category: "Phishing", priority: "MEDIUM", mitre: "T1566", sourceKey: "email_gateway" },
    { id: "UC-SEC-07", name: "Possible external host enumeration over ports", category: "Network", priority: "LOW", mitre: "T1046", sourceKey: "firewall" },
    { id: "UC-SEC-08", name: "Host with a recurring malware infection", category: "Malware", priority: "HIGH", mitre: "T1204", sourceKey: "edr_antivirus" }
  ];

  // Alerts array populated with MITRE tags and syslog context
  const [alerts, setAlerts] = useState([
    {
      id: "SEC-902",
      title: "Account Takeover (ATO) - Impossible Travel Anomaly",
      mitre: "T1078",
      entity: "KVM:4a12c984:AppInstance-B",
      source: "Tokyo, JP & Boston, US",
      syslog: "sshd: Accepted publickey for sridhargs from 185.220.101.5",
      severity: "CRITICAL",
      status: "ACTIVE"
    },
    {
      id: "SEC-903",
      title: "Active Directory Password Spray Attack",
      mitre: "T1110",
      entity: "ESXi:f0f1882a:AppInstance-C",
      source: "10.101.40.2 (Local vNIC)",
      syslog: "krb5: Kerberos login failure for user admin - Preauth failed",
      severity: "HIGH",
      status: "ACTIVE"
    },
    {
      id: "SEC-904",
      title: "Container Privilege Elevation eBPF Alert",
      mitre: "T1548",
      entity: "KVM:4a12c984:AppInstance-A",
      source: "Container ID: c52ea7b",
      syslog: "auditd: execve command: sudo rm -rf /etc/hosts (uid=1001)",
      severity: "HIGH",
      status: "ACTIVE"
    },
    {
      id: "SEC-905",
      title: "Tandem Legacy System SMF Journal Level Override",
      mitre: "T1562",
      entity: "ZOS:LPAR2:RACF_MGR",
      source: "Tandem LegacyTel Bridge",
      syslog: "LegacyTel: RACF Audit override level set to: NONE",
      severity: "CRITICAL",
      status: "ACTIVE"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEps((prev) => prev + Math.floor(Math.random() * 201 - 100));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const triggerPlaybook = (alertId, playbookName) => {
    setActivePlaybookId(alertId);
    setIsExecuting(true);
    setPlaybookLogs([
      `[Playbook Core] Starting containment sequence for Alert ${alertId}...`,
      `[OTel Network] Resolving virtual interface routes...`,
      `[Playbook] Triggering quarantine action: ${playbookName}...`
    ]);

    setTimeout(() => {
      setPlaybookLogs((prev) => [
        ...prev,
        `[Agent TLS] Authenticated gRPC socket with endpoint client successfully.`,
        `[Containment] Pushed iptables route block config packet.`,
        `[Containment] Host VM network interface disabled except loopback.`
      ]);
    }, 1500);

    setTimeout(() => {
      setPlaybookLogs((prev) => [
        ...prev,
        `[Postgres Cases] Updated case status to: CONTAINED.`,
        `🟢 SUCCESS: Telemetry agent quarantined. Cluster status stabilized.`
      ]);
      setIsExecuting(false);

      // Mark the alert as resolved in grid
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) =>
          a.id === alertId ? { ...a, status: "CONTAINED" } : a
        )
      );
    }, 3500);
  };

  const handleCreateCase = (alertId, alertTitle) => {
    alert(`🎟️ Case ticket created successfully in PostgreSQL cases DB for ${alertId}: "${alertTitle}". System notifications dispatched to Exchange/Google mail servers!`);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Security Operations Center (Overview)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Hybrid workspace consolidating Sentinel analytics metrics and Google Chronicle entity tracking.
          </p>
        </div>
      </div>

      {/* MS Sentinel style KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="enterprise-panel p-5">
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Ingestion Rate</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-sky-600">{eps.toLocaleString()} <span className="text-xs font-normal text-slate-500">EPS</span></span>
            <span className="sentinel-kpi-trend-up">▲ +12.4%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-sky-500 h-full w-[70%]"></div>
          </div>
        </div>

        <div className="enterprise-panel p-5">
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Unstructured Ingestion</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-violet-600">4,852 <span className="text-xs font-normal text-slate-500">EPS</span></span>
            <span className="sentinel-kpi-trend-up">▲ +34.1%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-violet-500 h-full w-[45%]"></div>
          </div>
        </div>

        <div className="enterprise-panel p-5">
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Active Incidents</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-rose-600">{activeAlerts} <span className="text-xs font-normal text-slate-500">Open</span></span>
            <span className="sentinel-kpi-trend-down">▼ -18.2%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-rose-500 h-full w-[35%]"></div>
          </div>
        </div>

        <div className="enterprise-panel p-5">
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Monitored Assets</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">1,489 <span className="text-xs font-normal text-slate-500">Active</span></span>
            <span className="sentinel-kpi-trend-up">▲ +2.1%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full w-[85%]"></div>
          </div>
        </div>

        <div className="enterprise-panel p-5">
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Consensus Health</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-indigo-600">100% <span className="text-xs font-normal text-slate-500">Stable</span></span>
            <span className="sentinel-kpi-trend-up">▲ 0.0%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-indigo-500 h-full w-[100%]"></div>
          </div>
        </div>

        <div className="enterprise-panel p-5 border border-violet-200 bg-violet-50/10">
          <span className="text-[10px] font-bold font-mono text-violet-600 uppercase tracking-wider block">MITRE ATT&CK Deployed</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold font-mono text-violet-850 text-violet-700">{mitreCount} <span className="text-[10px] font-normal text-slate-500">/ 410</span></span>
            <span className="text-[9px] font-mono text-violet-600 font-bold bg-violet-50 border border-violet-200 px-1 rounded">Active</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-3">
            <div className="bg-violet-600 h-full" style={{ width: `${Math.round((mitreCount / 410) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Center Row: Geovelocity Visualizer & Mart Health & SIEM Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Google Chronicle style Geovelocity Visualizer */}
        <div className="enterprise-panel lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Geovelocity Impossible Travel Visualizer</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Real-time mapping of concurrent geolocation SSO credentials requests</p>
          </div>

          <div className="geovelocity-visualizer flex items-center justify-between px-16 relative">
            {/* Geolocation nodes mapping */}
            <div className="text-center z-10">
              <div className="w-4 h-4 rounded-full bg-sky-500 animate-ping absolute left-[12%] top-[35%]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-sky-600 border border-white absolute left-[12%] top-[35%]"></div>
              <span className="text-[10px] font-mono text-sky-700 absolute left-[8%] top-[55%] font-semibold">Boston, US<br/>(User Host)</span>
            </div>

            <div className="flex-1 border-t border-dashed border-rose-500/40 relative mx-4">
              <div className="absolute left-[40%] top-[-8px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[9px] font-mono text-rose-600 uppercase font-bold">
                Impossible Travel
              </div>
            </div>

            <div className="text-center z-10">
              <div className="w-4 h-4 rounded-full bg-rose-500 animate-ping absolute right-[12%] top-[35%]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white absolute right-[12%] top-[35%]"></div>
              <span className="text-[10px] font-mono text-rose-700 absolute right-[8%] top-[55%] font-semibold">Tokyo, JP<br/>(Unauthorized login)</span>
            </div>
          </div>
        </div>

        {/* Data Mart Performance */}
        <div className="enterprise-panel lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Telemetry Data Marts</h2>
          <div className="space-y-2.5">
            {[
              { name: "Windows Event Mart", desc: "Active Directory logs", state: "STABLE", color: "text-emerald-600" },
              { name: "Linux Syslog & eBPF", desc: "Syslog kernel traces", state: "STABLE", color: "text-emerald-600" },
              { name: "Firewall Flow Mart", desc: "Ingestion flow records", state: "STABLE", color: "text-emerald-600" },
              { name: "Identity Governance Mart", desc: "MFA, Saviynt log traces", state: "ALERT", color: "text-rose-600" },
              { name: "Unstructured Log Mart", desc: "Raw logs and unstructured flows", state: "STABLE", color: "text-emerald-600" }
            ].map((mart, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded flex items-center justify-between" style={{ padding: "10px 12px" }}>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{mart.name}</span>
                  <span className="text-[10px] text-slate-500">{mart.desc}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${mart.color}`}>{mart.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIEM Dashboard Coverage */}
        <div className="enterprise-panel lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">SIEM Dashboard Coverage</h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mb-1">
                <span>WINDOWS OS</span>
                <span>450/500 Nodes (90%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div className="bg-sky-500 h-full w-[90%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mb-1">
                <span>LINUX OS</span>
                <span>800/840 Nodes (95%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full w-[95%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mb-1">
                <span>Z/OS MAINFRAME</span>
                <span>10/10 LPARs (100%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div className="bg-indigo-500 h-full w-[100%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mb-1">
                <span>ACTIVE DIRECTORY</span>
                <span>5/5 Controllers (100%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div className="bg-cyan-500 h-full w-[100%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mb-1">
                <span>APACHE / WEB SERVERS</span>
                <span>240/300 Instances (80%)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div className="bg-violet-500 h-full w-[80%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Use Case Deployment & Ingestion Enabler Console */}
      <div className="enterprise-panel space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Use Case Deployment & Ingestion Enabler</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Activate threat detection policies, review required logs streams, and verify API data ingestion status.</p>
        </div>

        {/* Priority Filter and Category Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          
          {/* Priority and Category Select Column */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-bold mb-2">1. Select Policy Priority Level</label>
              <div className="flex gap-2">
                {["HIGH", "MEDIUM", "LOW"].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setPriorityFilter(level);
                      setSelectedUseCases([]);
                      setSelectedLogs([]);
                    }}
                    className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${
                      priorityFilter === level
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-violet-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1.5">2. Threat Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedUseCases([]);
                  setSelectedLogs([]);
                }}
                className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-none focus:border-violet-500 font-sans text-xs"
              >
                {Array.from(new Set(useCaseList.map(u => u.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Use Case Selection Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
            <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1.5">3. Select Use Cases</label>
            <div className="space-y-2 max-h-[140px] overflow-y-auto bg-white p-3 border border-slate-200 rounded font-sans">
              {useCaseList
                .filter(u => u.priority === priorityFilter && u.category === selectedCategory)
                .map((u) => (
                  <label key={u.id} className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedUseCases.includes(u.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUseCases(prev => [...prev, u.name]);
                        } else {
                          setSelectedUseCases(prev => prev.filter(item => item !== u.name));
                        }
                      }}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                    />
                    <div>
                      <span className="text-slate-800 font-medium block leading-tight">{u.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.2 rounded mt-1 inline-block">MITRE: {u.mitre}</span>
                    </div>
                  </label>
                ))}
              {useCaseList.filter(u => u.priority === priorityFilter && u.category === selectedCategory).length === 0 && (
                <div className="text-slate-400 text-xs text-center py-4 font-sans">No use cases matching criteria.</div>
              )}
            </div>
          </div>

          {/* Ingestion Check & Log Selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
            {selectedUseCases.length > 0 ? (() => {
              // Get the source key of the first selected usecase
              const selectedUc = useCaseList.find(u => u.name === selectedUseCases[0]);
              const source = dataSourcesState[selectedUc?.sourceKey];
              const isOnline = source?.status === "ONLINE";

              return (
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">4. Ingestion Status</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                        isOnline 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse" 
                          : "bg-rose-50 text-rose-600 border-rose-200"
                      }`}>
                        {isOnline ? "🟢 ONLINE" : "🔴 OFFLINE"}
                      </span>
                    </div>
                    
                    {isOnline ? (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-sans block leading-normal">
                          Ingesting data from **{source.name}**. Select active logs to monitor:
                        </span>
                        <div className="space-y-1 bg-white p-2 border border-slate-200 rounded font-sans text-xs">
                          {source.logs.map((log) => (
                            <label key={log} className="flex items-center gap-2 cursor-pointer py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedLogs.includes(log)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLogs(prev => [...prev, log]);
                                  } else {
                                    setSelectedLogs(prev => prev.filter(l => l !== log));
                                  }
                                }}
                                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                              />
                              <span className="text-slate-700">{log}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-white p-3 border border-rose-200 rounded text-slate-600">
                        <p className="text-[10px] font-sans leading-normal">
                          ⚠️ Data feed **{source.name}** is not connected. API access keys are required to establish connection.
                        </p>
                        <a
                          href="/integrations"
                          className="inline-block text-[9px] font-bold font-mono text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded transition-all mt-1 uppercase"
                        >
                          Go to Lakehouse API Integrations
                        </a>
                      </div>
                    )}
                  </div>

                  {isOnline && (
                    <button
                      onClick={() => {
                        setMitreCount(prev => prev + selectedUseCases.length);
                        alert(`Success! Successfully deployed usecase(s):\n${selectedUseCases.join("\n")}\n\nIngestion rule mappings registered in Vector & ClickHouse.`);
                        setSelectedUseCases([]);
                        setSelectedLogs([]);
                      }}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold p-2 rounded uppercase tracking-wider text-[10px] text-center"
                    >
                      🚀 Deploy Active Use Cases
                    </button>
                  )}
                </div>
              );
            })() : (
              <div className="text-slate-400 text-[10px] flex items-center justify-center text-center h-full font-sans">
                Select a use case to verify ingestion pipeline status.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Grid: Actionable Alert Manager */}
      <div className="enterprise-panel space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Actionable Security Alerts Grid</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Correlated security events mapped to MITRE TTPs and inline containment triggers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="enterprise-grid">
            <thead>
              <tr>
                <th>Threat ID</th>
                <th>Incident Details</th>
                <th>MITRE TTP</th>
                <th>Exposure Entity Target</th>
                <th>Raw Syslog Preview</th>
                <th>Severity</th>
                <th>Status</th>
                <th>SIEM Operations</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="font-mono text-sky-600 font-bold">{alert.id}</td>
                  <td>
                    <div className="font-semibold text-slate-800">{alert.title}</div>
                    <div className="text-[10px] text-slate-500">Source: {alert.source}</div>
                  </td>
                  <td className="font-mono"><span className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-600">{alert.mitre}</span></td>
                  <td className="font-mono text-[10px] text-slate-600">{alert.entity}</td>
                  <td className="font-mono text-[10px] text-slate-600 max-w-[220px] truncate" title={alert.syslog}>{alert.syslog}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      alert.severity === "CRITICAL" ? "badge-critical" : "badge-high"
                    }`}>{alert.severity}</span>
                  </td>
                  <td>
                    <span className={`text-[10px] font-bold font-mono ${alert.status === "CONTAINED" ? "text-emerald-600" : "text-rose-600"}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {alert.status === "ACTIVE" ? (
                        <button
                          onClick={() => triggerPlaybook(alert.id, "quarantine_host_vm")}
                          disabled={isExecuting}
                          className="btn-sentinel"
                        >
                          ⚡ Isolate
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold font-mono self-center">CONTAINED</span>
                      )}
                      <button
                        onClick={() => handleCreateCase(alert.id, alert.title)}
                        className="btn-sentinel"
                        style={{ background: "rgba(99, 102, 241, 0.08)", borderColor: "rgba(99, 102, 241, 0.25)", color: "#4f46e5" }}
                      >
                        🎟️ Ticket
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Playbook Action Console */}
        {activePlaybookId && (
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Live Playbook Execution Terminal</h3>
            <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-md font-mono text-[11px] text-cyan-400 space-y-1.5 max-h-[160px] overflow-y-auto">
              {playbookLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span>&gt;</span>
                  <span className={log.includes("SUCCESS") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
