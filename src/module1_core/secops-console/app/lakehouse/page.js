"use client";

import { useState, useEffect } from "react";

export default function Lakehouse() {
  const [ingestionRate, setIngestionRate] = useState(5120);
  const [storageUsed, setStorageUsed] = useState(86.42);
  const [retentionDays, setRetentionDays] = useState(365);
  const [selectedMart, setSelectedMart] = useState("unstructured");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIngestionRate(prev => Math.floor(prev + (Math.random() * 400 - 200)));
      setStorageUsed(prev => +(prev + 0.01).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Detailed schemas and fields for the 8 specific data sources
  const schemas = {
    unstructured: {
      name: "Unstructured Raw Logs",
      dbTable: "clickhouse.raw_logs",
      count: "12.4M rows",
      eps: "2,400 EPS",
      description: "Raw syslog payloads and unparsed agent event outputs.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Ingestion time" },
        { name: "source_ip", type: "String", desc: "Origin host IP" },
        { name: "payload", type: "String", desc: "Raw unparsed text string" }
      ]
    },
    windows: {
      name: "Windows Events",
      dbTable: "postgres.windows_logs",
      count: "4.8M rows",
      eps: "950 EPS",
      description: "Active Directory, Kerberos authentications, and PowerShell audits.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Event log time" },
        { name: "event_id", type: "Int32", desc: "Windows Security Event ID" },
        { name: "hostname", type: "String", desc: "Endpoint host name" },
        { name: "user_principal", type: "String", desc: "Target user identity" }
      ]
    },
    linux: {
      name: "Linux Syslog",
      dbTable: "postgres.linux_logs",
      count: "3.2M rows",
      eps: "680 EPS",
      description: "SSH logons, systemd processes, and daemon events.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "System event time" },
        { name: "pid", type: "Int32", desc: "Process Identifier" },
        { name: "process", type: "String", desc: "Daemon or service name" },
        { name: "message", type: "String", desc: "Audit syslog text" }
      ]
    },
    legacy: {
      name: "Legacy OS (AS400/zOS)",
      dbTable: "postgres.legacy_logs",
      count: "1.1M rows",
      eps: "120 EPS",
      description: "Mainframe transaction journals and RACF access logs.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Mainframe transaction time" },
        { name: "job_id", type: "String", desc: "OS/390 active job identifier" },
        { name: "user_id", type: "String", desc: "RACF access credential user" },
        { name: "action", type: "String", desc: "Database transaction statement" }
      ]
    },
    firewall: {
      name: "Firewall Traffic",
      dbTable: "postgres.firewall_logs",
      count: "8.9M rows",
      eps: "1,800 EPS",
      description: "Network transit packets, firewall rules, and port states.",
      columns: [
        { name: "src_ip", type: "String", desc: "Source network IP" },
        { name: "dest_ip", type: "String", desc: "Destination network IP" },
        { name: "dest_port", type: "Int32", desc: "Target connection port" },
        { name: "action", type: "String", desc: "Action code (ALLOW / DENY)" }
      ]
    },
    identity: {
      name: "Identity Governance",
      dbTable: "postgres.identity_governance",
      count: "150K rows",
      eps: "Scheduled Sync",
      description: "SailPoint IGA, role access changes, and SSO events.",
      columns: [
        { name: "request_id", type: "UUID", desc: "Orchestration ticket UUID" },
        { name: "user", type: "String", desc: "Employee identity account" },
        { name: "role_granted", type: "String", desc: "Active directory privilege role" },
        { name: "approver", type: "String", desc: "Authorizing SOC supervisor" }
      ]
    },
    hardware: {
      name: "Hardware Inventory",
      dbTable: "postgres.hardware_inventory",
      count: "1,502 rows",
      eps: "Scheduled Sync",
      description: "Device types, CPU layout, RAM metrics, and MAC addresses.",
      columns: [
        { name: "device_id", type: "UUID", desc: "Asset system UUID" },
        { name: "device_type", type: "String", desc: "Hardware class (SERVER / ROUTER)" },
        { name: "hostname", type: "String", desc: "Client endpoint hostname" },
        { name: "cpu_cores", type: "Int32", desc: "Physical processor cores count" },
        { name: "memory_gb", type: "Int32", desc: "System RAM capacity" }
      ]
    },
    software: {
      name: "Software Inventory",
      dbTable: "postgres.software_inventory",
      count: "4,812 rows",
      eps: "Scheduled Sync",
      description: "Installed agent binary versions and local dependency paths.",
      columns: [
        { name: "record_id", type: "Int64", desc: "Software package row identifier" },
        { name: "hostname", type: "String", desc: "Host location hostname" },
        { name: "software_name", type: "String", desc: "Binary application name" },
        { name: "version", type: "String", desc: "Binary build version" }
      ]
    }
  };

  // Mock Rows data
  const mockRows = {
    unstructured: [
      { timestamp: "11:28:02", source_ip: "10.100.12.45", payload: "INFO: secops-run daemon: heartbeat verified" },
      { timestamp: "11:28:10", source_ip: "10.100.15.12", payload: "ERROR: nxlog syslog handler - socket timeout on port 514" }
    ],
    windows: [
      { timestamp: "11:28:05", event_id: 4624, hostname: "boston-ws-01", user_principal: "sridhargs@spinovation.com" },
      { timestamp: "11:28:15", event_id: 4720, hostname: "dc-prod-01", user_principal: "administrator" }
    ],
    linux: [
      { timestamp: "11:28:07", pid: 902, process: "sshd", message: "Accepted publickey for admin from 10.100.1.10" },
      { timestamp: "11:28:19", pid: 1402, process: "systemd", message: "Started ClickHouse database server replica" }
    ],
    legacy: [
      { timestamp: "11:28:01", job_id: "JOB09281", user_id: "IBMUSER1", action: "SELECT * FROM db2.customer_ledger" },
      { timestamp: "11:28:22", job_id: "JOB09285", user_id: "SYSADM", action: "GRANT CONTROL ACCESS TO SEC_GROUP" }
    ],
    firewall: [
      { src_ip: "10.100.12.45", dest_ip: "8.8.8.8", dest_port: 53, action: "ALLOW" },
      { src_ip: "192.168.1.150", dest_ip: "10.200.4.5", dest_port: 22, action: "DENY" }
    ],
    identity: [
      { request_id: "c8d7e6f5-a4b3-2c1d-0e9f-8a7b6c5d4e3f", user: "sridhargs@spinovation.com", role_granted: "SOC_OPERATOR", approver: "supervisor_alpha" },
      { request_id: "7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d", user: "admin@spinovation.com", role_granted: "DOMAIN_ADMIN", approver: "secops_director" }
    ],
    hardware: [
      { device_id: "d9e8d7c6-b5a4-3c2b-1a0f-9e8d7c6b5a43", device_type: "WORKSTATION", hostname: "boston-ws-01", cpu_cores: 8, memory_gb: 16 },
      { device_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", device_type: "SERVER", hostname: "mainframe-prod-01", cpu_cores: 128, memory_gb: 1024 }
    ],
    software: [
      { record_id: 1001, hostname: "boston-ws-01", software_name: "nxlog-agent", version: "2.1.0" },
      { record_id: 1002, hostname: "london-ws-02", software_name: "splunkforwarder", version: "9.2.0" }
    ]
  };

  const getFilteredRows = () => {
    const rows = mockRows[selectedMart] || [];
    if (!searchQuery) return rows;
    return rows.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const currentMartSchema = schemas[selectedMart];
  const activeRows = getFilteredRows();

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Unified Ingestion Lakehouse
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time log database tracking security telemetry streams, operating systems, network events, and hardware inventories.
        </p>
      </div>

      {/* Ingestion & Retention Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Ingestion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{ingestionRate}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">EPS</span>
          </div>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Storage Utilized</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{storageUsed.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">GB</span>
          </div>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Data Retention</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{retentionDays}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">Days</span>
          </div>
        </div>
      </div>

      {/* Available Data Feeds List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Operational Data Marts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(schemas).map(([key, value]) => {
            const isSelected = selectedMart === key;
            return (
              <div 
                key={key}
                onClick={() => setSelectedMart(key)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[130px] ${
                  isSelected ? "border-violet-500 bg-violet-50/40 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-850">{value.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">{value.count}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{value.description}</p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMart(key);
                  }}
                  className={`w-full py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-center mt-3 border transition-all ${
                    isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-slate-200 text-slate-600 hover:border-violet-400"
                  }`}
                >
                  {isSelected ? "Active Stream" : "Drill Down"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query & Schema detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Drill-down Results Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 border border-slate-200 bg-white flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{currentMartSchema.name}</h3>
                  <code className="text-[10px] font-mono text-cyan-600 bg-slate-100 px-1.5 py-0.2 rounded">
                    Table: {currentMartSchema.dbTable}
                  </code>
                </div>
              </div>

              {/* Log Query Input */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${currentMartSchema.name} records...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-8 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Ingestion results table */}
            <div className="flex-1 my-2 overflow-x-auto min-h-[220px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase bg-slate-50/50">
                    {currentMartSchema.columns.map((col) => (
                      <th key={col.name} className="p-3">{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activeRows.length > 0 ? (
                    activeRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {currentMartSchema.columns.map((col) => (
                          <td key={col.name} className="p-3 text-slate-800 max-w-[200px] truncate">
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={currentMartSchema.columns.length} className="text-center py-8 text-slate-400">
                        No rows matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Schema Definition Drawer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Database Fields Schema</h3>
            <p className="text-xs text-slate-500">{currentMartSchema.description}</p>

            <div className="space-y-3 font-mono text-xs">
              {currentMartSchema.columns.map((col) => (
                <div key={col.name} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{col.name}</span>
                    <span className="text-[9px] text-cyan-600 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded font-bold">
                      {col.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
