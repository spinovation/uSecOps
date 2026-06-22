"use client";

import { useState, useEffect } from "react";

export default function Lakehouse() {
  const [ingestionRate, setIngestionRate] = useState(5120);
  const [storageUsed, setStorageUsed] = useState(86.42);
  const [retentionDays, setRetentionDays] = useState(365);
  const [selectedMart, setSelectedMart] = useState("unstructured");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Ingestion Rate Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setIngestionRate(prev => Math.floor(prev + (Math.random() * 400 - 200)));
      setStorageUsed(prev => +(prev + 0.01).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Custom Mart Builder States
  const [customMartName, setCustomMartName] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  
  // Available fields to choose from for custom pivot mart
  const availableFields = [
    "timestamp", "source_ip", "event_id", "hostname", "user_principal",
    "pid", "process", "message", "job_id", "user_id", "action",
    "src_ip", "dest_ip", "dest_port", "protocol", "device_type", "software_name"
  ];

  // Data feeds list (active or paused)
  const [dataFeeds, setDataFeeds] = useState({
    unstructured: {
      name: "Unstructured & Raw Logs",
      dbTable: "clickhouse.unstructured_raw",
      count: "12.4M rows",
      eps: "2,400 EPS",
      status: "ACTIVE",
      description: "Stores raw syslogs, emails, chat logs, images, and unparsed system events.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Ingestion time" },
        { name: "source_ip", type: "String", desc: "Origin host IP" },
        { name: "data_type", type: "Enum('CHAT', 'EMAIL', 'IMAGE', 'RAW_SYSLOG')", desc: "Type of unstructured payload" },
        { name: "raw_content", type: "String", desc: "Unstructured payload text" }
      ]
    },
    windows: {
      name: "Windows Events",
      dbTable: "postgres.windows_logs",
      count: "4.8M rows",
      eps: "950 EPS",
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
      status: "ACTIVE",
      description: "Installed agent binary versions and local dependency paths.",
      columns: [
        { name: "record_id", type: "Int64", desc: "Software package row identifier" },
        { name: "hostname", type: "String", desc: "Host location hostname" },
        { name: "software_name", type: "String", desc: "Binary application name" },
        { name: "version", type: "String", desc: "Binary build version" }
      ]
    }
  });

  // Mock Rows data
  const mockRows = {
    unstructured: [
      { timestamp: "11:33:02", source_ip: "10.100.12.45", data_type: "EMAIL", raw_content: "Subject: Security Alert Alert - phishing reported on node 'BOS-01'" },
      { timestamp: "11:33:10", source_ip: "10.100.14.78", data_type: "CHAT", raw_content: "Slack: #incident-response: vm containment executed by orchestrator" }
    ],
    windows: [
      { timestamp: "11:28:05", event_id: 4624, hostname: "boston-ws-01", user_principal: "sridhargs@spinovation.com" },
      { timestamp: "11:28:15", event_id: 4720, hostname: "dc-prod-01", user_principal: "administrator" }
    ],
    linux: [
      { timestamp: "11:28:07", pid: 902, process: "sshd", message: "Accepted publickey for admin from 10.100.1.10" }
    ],
    legacy: [
      { timestamp: "11:28:01", job_id: "JOB09281", user_id: "IBMUSER1", action: "SELECT * FROM db2.customer_ledger" }
    ],
    firewall: [
      { src_ip: "10.100.12.45", dest_ip: "8.8.8.8", dest_port: 53, action: "ALLOW" }
    ],
    identity: [
      { request_id: "c8d7e6f5-a4b3-2c1d-0e9f-8a7b6c5d4e3f", user: "sridhargs@spinovation.com", role_granted: "SOC_OPERATOR", approver: "supervisor_alpha" }
    ],
    hardware: [
      { device_id: "d9e8d7c6-b5a4-3c2b-1a0f-9e8d7c6b5a43", device_type: "WORKSTATION", hostname: "boston-ws-01", cpu_cores: 8, memory_gb: 16 }
    ],
    software: [
      { record_id: 1001, hostname: "boston-ws-01", software_name: "nxlog-agent", version: "2.1.0" }
    ]
  };

  const handleToggleFeedStatus = (key) => {
    const currentStatus = dataFeeds[key].status;
    const updatedStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    
    setDataFeeds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: updatedStatus
      }
    }));
    alert(`Data Ingestion feed for ${dataFeeds[key].name} set to: ${updatedStatus}`);
  };

  const handleGenerateCustomMart = () => {
    if (!customMartName) {
      alert("Please provide a name for your custom data mart!");
      return;
    }
    if (selectedFields.length === 0) {
      alert("Please select at least one field to pivot!");
      return;
    }

    const cleanKey = customMartName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const generatedColumns = selectedFields.map(f => ({
      name: f,
      type: "String (Pivoted)",
      desc: `Pivoted column field: ${f}`
    }));

    const newMart = {
      name: `Custom: ${customMartName}`,
      dbTable: `clickhouse.custom_${cleanKey}`,
      count: "0 rows",
      eps: "On Demand",
      status: "ACTIVE",
      description: `User-defined custom mart containing pivoted fields: ${selectedFields.join(", ")}`,
      columns: generatedColumns
    };

    setDataFeeds(prev => ({
      ...prev,
      [cleanKey]: newMart
    }));

    // Mock row entry
    mockRows[cleanKey] = [
      selectedFields.reduce((acc, field) => {
        acc[field] = "pivoted_value";
        return acc;
      }, {})
    ];

    setSelectedMart(cleanKey);
    setCustomMartName("");
    setSelectedFields([]);
    alert(`Custom Database Mart dynamic provisioning complete! Table ${newMart.dbTable} generated.`);
  };

  const handleToggleFieldSelection = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const currentMartSchema = dataFeeds[selectedMart];
  const activeRows = mockRows[selectedMart] || [];

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Module 2: Unified Ingestion Lakehouse
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
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Operational Data Marts</h2>
          <span className="text-[10px] font-mono text-slate-400">Right-click or toggle to deactivate default streams</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(dataFeeds).map(([key, value]) => {
            const isSelected = selectedMart === key;
            const isActive = value.status === "ACTIVE";
            return (
              <div 
                key={key}
                onClick={() => setSelectedMart(key)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[130px] ${
                  isSelected ? "border-violet-500 bg-violet-50/40 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50/50"
                } ${!isActive ? "opacity-60" : ""}`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-850">{value.name}</span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}>{value.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{value.description}</p>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMart(key);
                    }}
                    className={`flex-1 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-center border transition-all ${
                      isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-slate-200 text-slate-600 hover:border-violet-400"
                    }`}
                  >
                    Drill Down
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeedStatus(key);
                    }}
                    className="px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-250 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    {isActive ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query & Schema detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Drill-down Results Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-slate-200 bg-white flex flex-col justify-between min-h-[380px]">
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
            <div className="flex-1 my-2 overflow-x-auto min-h-[200px]">
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

        {/* Right Panel: Database fields / Excel pivot custom mart builder */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Table Schema metadata */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Database Fields Schema</h3>
            <div className="space-y-3 font-mono text-xs max-h-[160px] overflow-y-auto pr-1">
              {currentMartSchema.columns.map((col) => (
                <div key={col.name} className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-850">{col.name}</span>
                    <span className="text-[9px] text-cyan-600 bg-cyan-50 px-1.5 py-0.2 rounded font-bold">
                      {col.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pivot Table Custom Mart Builder */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Excel-Pivot Data Mart Creator</h3>
              <p className="text-[10px] text-slate-400">Select fields from visible ingestion logs to compile custom partitions</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block text-[9px] uppercase font-bold">New Custom Mart Name</label>
                <input
                  type="text"
                  placeholder="e.g. ad_audit_pivot"
                  value={customMartName}
                  onChange={(e) => setCustomMartName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
                />
              </div>

              {/* Field checklist */}
              <div className="space-y-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Pivot Ingestion Fields</span>
                <div className="border border-slate-200 rounded p-2 bg-slate-50 max-h-[120px] overflow-y-auto grid grid-cols-2 gap-2">
                  {availableFields.map(f => (
                    <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(f)}
                        onChange={() => handleToggleFieldSelection(f)}
                        className="rounded text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-slate-655 truncate">{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateCustomMart}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded uppercase tracking-wider text-[10px]"
              >
                ⚙️ Generate Custom Data Mart
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
