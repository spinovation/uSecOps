"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [eps, setEps] = useState(14852);
  const [activeAlerts, setActiveAlerts] = useState(6);
  const [activePlaybookId, setActivePlaybookId] = useState(null);
  const [playbookLogs, setPlaybookLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

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

  const triggerSOARPlaybook = (alertId, playbookName) => {
    setActivePlaybookId(alertId);
    setIsExecuting(true);
    setPlaybookLogs([
      `[SOAR Core] Starting containment sequence for Alert ${alertId}...`,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div>

      {/* Center Row: Geovelocity Visualizer & Mart Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Google Chronicle style Geovelocity Visualizer */}
        <div className="enterprise-panel p-5 lg:col-span-2 space-y-4">
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
        <div className="enterprise-panel p-5 lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Telemetry Data Marts</h2>
          <div className="space-y-2.5">
            {[
              { name: "Windows Event Mart", desc: "Active Directory logs", state: "STABLE", color: "text-emerald-600" },
              { name: "Linux Syslog & eBPF", desc: "Syslog kernel traces", state: "STABLE", color: "text-emerald-600" },
              { name: "Firewall Flow Mart", desc: "Ingestion flow records", state: "STABLE", color: "text-emerald-600" },
              { name: "Identity Governance Mart", desc: "MFA, Saviynt log traces", state: "ALERT", color: "text-rose-600" }
            ].map((mart, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{mart.name}</span>
                  <span className="text-[10px] text-slate-500">{mart.desc}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${mart.color}`}>{mart.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Actionable Alert Manager */}
      <div className="enterprise-panel p-6 space-y-6">
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
                <th>Actions</th>
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
                    {alert.status === "ACTIVE" ? (
                      <button
                        onClick={() => triggerSOARPlaybook(alert.id, "quarantine_host_vm")}
                        disabled={isExecuting}
                        className="btn-sentinel"
                      >
                        ⚡ Isolate Node
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">CONTAINED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic SOAR Action Console */}
        {activePlaybookId && (
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Live SOAR Playbook Execution Terminal</h3>
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
