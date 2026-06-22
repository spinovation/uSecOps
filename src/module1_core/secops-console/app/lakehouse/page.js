"use client";

import { useState, useEffect } from "react";

export default function Lakehouse() {
  const [ingestionRate, setIngestionRate] = useState(10240); // Raw Inbound
  const [routedRate, setRoutedRate] = useState(4820); // Routed Outbound
  const [storageUsed, setStorageUsed] = useState(86.42);
  const [retentionDays, setRetentionDays] = useState(365);
  const [selectedMart, setSelectedMart] = useState("unstructured");
  const [searchQuery, setSearchQuery] = useState("");

  // Inbound API Sources (Legacy & On-Prem)
  const [inboundAPIs] = useState([
    { id: "api-1", name: "IBM AS/400 QAUDJRN Feed", type: "Legacy Pull", endpoint: "10.200.4.5:9450/api/journal", interval: "30s", status: "ACTIVE" },
    { id: "api-2", name: "On-Prem Oracle Audit Log", type: "DB Poller", endpoint: "jdbc:oracle:thin:@10.100.22.4:1521/audit", interval: "60s", status: "ACTIVE" },
    { id: "api-3", name: "z/OS SMF Real-Time Stream", type: "Legacy Push", endpoint: "10.200.4.6:3090/api/smf", interval: "Real-time", status: "ACTIVE" }
  ]);

  // Ingestion Pipeline Routing rules (Cribl-style Vector Engine - $0 License)
  const [routingRules, setRoutingRules] = useState([
    { id: "rule-1", name: "Drop Debug Logs", desc: "Filters out dev/debug syslog levels to prevent tool overload", action: "DROP", matches: "log_level == 'DEBUG'", enabled: true },
    { id: "rule-2", name: "Route Raw Logs to clickhouse.unstructured_raw", desc: "Pipes all original, unaltered telemetry directly to raw cold marts", action: "ROUTE", matches: "data_type == 'RAW_SYSLOG'", enabled: true },
    { id: "rule-3", name: "Mask SSN & Credit Card numbers", desc: "Replaces PII pattern strings with masks", action: "MASK", matches: "regex('[0-9]{3}-[0-9]{2}-...')", enabled: true },
    { id: "rule-4", name: "Forward Security Logons to postgres.windows_logs", desc: "Filters and routes active security logs to core Sentinel engines", action: "FORWARD", matches: "event_id == 4624", enabled: true }
  ]);

  // Data Jurisdiction & Regional Residency state
  const [jurisdictions, setJurisdictions] = useState([
    { id: "jur-1", region: "European Union (EU)", code: "EU_WEST_1", volume: "42.1 TB", complianceRule: "Store logs on EU partition tables. Prohibit cross-border copy.", status: "COMPLIANT" },
    { id: "jur-2", region: "United States (US)", code: "US_EAST_2", volume: "31.8 TB", complianceRule: "Archive to Parquet Parquet after 90 days. AES-256 GCM enforce.", status: "COMPLIANT" },
    { id: "jur-3", region: "Asia-Pacific (APAC)", code: "AP_SOUTH_1", volume: "12.5 TB", complianceRule: "Retain local audit access key traces.", status: "COMPLIANT" }
  ]);

  const [migrationSource, setMigrationSource] = useState("US_EAST_2");
  const [migrationDest, setMigrationDest] = useState("EU_WEST_1");
  const [isMigrating, setIsMigrating] = useState(false);

  // Excel-style Pivot Data Mart Builder state
  const [pivotSource, setPivotSource] = useState("unstructured");
  const [pivotRows, setPivotRows] = useState([]);
  const [pivotAggCol, setPivotAggCol] = useState("source_ip");
  const [pivotFunction, setPivotFunction] = useState("COUNT");
  const [newMartName, setNewMartName] = useState("custom_pivot_mart");
  const [dynamicMarts, setDynamicMarts] = useState({});
  const [isGeneratingPivot, setIsGeneratingPivot] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIngestionRate(prev => Math.floor(prev + (Math.random() * 400 - 200)));
      setRoutedRate(prev => Math.floor(prev + (Math.random() * 200 - 100)));
      setStorageUsed(prev => +(prev + 0.01).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRule = (id) => {
    setRoutingRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleTriggerMigration = () => {
    if (migrationSource === migrationDest) {
      alert("Source and Destination regions must be different!");
      return;
    }
    setIsMigrating(true);
    setTimeout(() => {
      setIsMigrating(false);
      alert(`Data migration completed! Relocated matching telemetry partitions from ${migrationSource} to ${migrationDest} in accordance with data sovereignty rules.`);
    }, 2000);
  };

  const coreSchemas = {
    unstructured: {
      name: "Unstructured & Raw Logs",
      dbTable: "clickhouse.unstructured_raw",
      count: "12.4M rows",
      eps: "2,400 EPS",
      description: "Stores raw syslogs, emails, chat logs, images, and unparsed system events.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Ingestion time" },
        { name: "source_ip", type: "String", desc: "Origin host IP" },
        { name: "data_type", type: "Enum('CHAT', 'EMAIL', 'IMAGE', 'RAW_SYSLOG')", desc: "Type of unstructured payload" },
        { name: "raw_content", type: "String", desc: "Unstructured payload text" },
        { name: "jurisdiction_region", type: "String", desc: "Sovereign location code (e.g. EU_WEST_1)" }
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

  const coreMockRows = {
    unstructured: [
      { timestamp: "11:33:02", source_ip: "10.100.12.45", data_type: "EMAIL", raw_content: "Subject: Security Alert - phishing reported", jurisdiction_region: "EU_WEST_1" },
      { timestamp: "11:33:10", source_ip: "10.100.14.78", data_type: "CHAT", raw_content: "Slack: vm containment executed", jurisdiction_region: "US_EAST_2" }
    ],
    windows: [
      { timestamp: "11:28:05", event_id: 4624, hostname: "boston-ws-01", user_principal: "sridhargs@spinovation.com" }
    ],
    linux: [
      { timestamp: "11:28:07", pid: 902, process: "sshd", message: "Accepted publickey for admin" }
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

  // Compile active schemas and mock rows with user-created custom data marts
  const schemas = { ...coreSchemas, ...dynamicMarts };
  const mockRows = {
    ...coreMockRows,
    ...Object.keys(dynamicMarts).reduce((acc, cur) => {
      acc[cur] = dynamicMarts[cur].rowsData;
      return acc;
    }, {})
  };

  const handleBuildPivot = () => {
    if (!newMartName) {
      alert("Please enter a target custom table name!");
      return;
    }
    if (pivotRows.length === 0) {
      alert("Please select at least one row dimension to pivot!");
      return;
    }

    setIsGeneratingPivot(true);

    setTimeout(() => {
      const baseRows = mockRows[pivotSource] || [];
      const groups = {};

      baseRows.forEach(row => {
        const keyParts = pivotRows.map(dim => row[dim] || "N/A");
        const key = keyParts.join(" | ");
        if (!groups[key]) {
          groups[key] = {
            dimensions: {},
            values: []
          };
          pivotRows.forEach((dim, idx) => {
            groups[key].dimensions[dim] = keyParts[idx];
          });
        }
        
        let rawVal = row[pivotAggCol];
        let val = parseFloat(rawVal);
        if (isNaN(val)) {
          val = typeof rawVal === "string" ? rawVal.length : 1;
        }
        groups[key].values.push(val);
      });

      const summaryRows = Object.keys(groups).map(k => {
        const group = groups[k];
        let aggValue = 0;
        if (pivotFunction === "COUNT") {
          aggValue = group.values.length;
        } else if (pivotFunction === "SUM") {
          aggValue = group.values.reduce((sum, v) => sum + v, 0);
        } else if (pivotFunction === "AVG") {
          aggValue = group.values.length > 0 ? (group.values.reduce((sum, v) => sum + v, 0) / group.values.length) : 0;
        } else if (pivotFunction === "MAX") {
          aggValue = Math.max(...group.values);
        }

        return {
          ...group.dimensions,
          aggregated_value: Number(aggValue.toFixed(2))
        };
      });

      const customCols = pivotRows.map(dim => {
        const baseCol = schemas[pivotSource].columns.find(c => c.name === dim);
        return {
          name: dim,
          type: baseCol ? baseCol.type : "String",
          desc: `Dimension: ${dim}`
        };
      });
      customCols.push({
        name: "aggregated_value",
        type: "Float64",
        desc: `${pivotFunction} of ${pivotAggCol}`
      });

      const martKey = newMartName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      const customMart = {
        name: `Pivot: ${newMartName}`,
        dbTable: `clickhouse.custom_${martKey}`,
        count: `${summaryRows.length} rows`,
        eps: "Materialized View",
        description: `Pivoted view of ${schemas[pivotSource].name} grouped by ${pivotRows.join(", ")}.`,
        columns: customCols,
        rowsData: summaryRows
      };

      setDynamicMarts(prev => ({
        ...prev,
        [martKey]: customMart
      }));

      setSelectedMart(martKey);
      setIsGeneratingPivot(false);
      alert(`Success! Materialized View "clickhouse.custom_${martKey}" generated successfully.`);
    }, 1200);
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
          Open-source, zero-cost ingestion pipeline built on **Vector (Rust)** and **Redpanda Community Edition** ($0 license fee). Manage dynamic log routing and enforce regional data residency.
        </p>
      </div>

      {/* Ingestion & Retention Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Raw Inbound Ingestion</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{ingestionRate}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">EPS</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Total unfiltered stream</span>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Routed to uSecOps Engine</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-violet-650 text-violet-600">{routedRate}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">EPS</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">
            ▲ Ingestion Savings: {Math.round((1 - routedRate / ingestionRate) * 100)}%
          </span>
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

      {/* Dynamic Data Routing & Location Jurisdiction Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vector Routing Rules */}
        <div className="lg:col-span-2 glass-panel p-6 border border-slate-200 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Vector Log Routing Pipeline</h3>
              <p className="text-xs text-slate-400">Apply filter rules to drop redundant noise or route raw data to clickhouse.unstructured_raw.</p>
            </div>
            <span className="text-[9px] font-mono text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded font-bold uppercase">
              $0 License Fee
            </span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {routingRules.map((rule) => (
              <div 
                key={rule.id}
                className={`p-3 rounded-lg border flex justify-between items-center font-mono text-xs ${
                  rule.enabled ? "border-violet-200 bg-violet-50/20" : "border-slate-200 bg-slate-50/50 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{rule.name}</span>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded ${
                      rule.action === "DROP" ? "bg-rose-50 text-rose-600 border border-rose-200" :
                      rule.action === "ROUTE" ? "bg-cyan-50 text-cyan-600 border border-cyan-200" :
                      "bg-violet-50 text-violet-600 border border-violet-200"
                    }`}>{rule.action}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">{rule.desc}</p>
                  <code className="text-[9px] text-cyan-700 bg-slate-100 px-1 py-0.2 rounded mt-1.5 block">matches: {rule.matches}</code>
                </div>
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${
                    rule.enabled ? "border-rose-200 text-rose-600 hover:bg-rose-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {rule.enabled ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Jurisdiction & Residency Rules */}
        <div className="lg:col-span-1 glass-panel p-6 border border-slate-200 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Data Sovereignty & Jurisdictions</h3>
            <div className="space-y-3 font-mono text-xs mt-2">
              {jurisdictions.map((jur) => (
                <div key={jur.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-855">{jur.region}</span>
                    <span className="text-[9px] text-cyan-650 text-cyan-600 bg-cyan-50 px-1.5 py-0.2 rounded font-bold">{jur.code}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal font-sans">{jur.complianceRule}</p>
                  <div className="text-[10px] flex justify-between font-bold text-slate-650 pt-1 border-t border-slate-200/50 mt-1.5">
                    <span>Volume: {jur.volume}</span>
                    <span className="text-emerald-600">● {jur.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Migration tool */}
          <div className="pt-4 border-t border-slate-200 space-y-3 font-mono text-xs">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Compliance Data Migration</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400">Source</label>
                <select 
                  value={migrationSource}
                  onChange={(e) => setMigrationSource(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5"
                >
                  <option value="US_EAST_2">US_EAST_2</option>
                  <option value="EU_WEST_1">EU_WEST_1</option>
                  <option value="AP_SOUTH_1">AP_SOUTH_1</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-400">Destination</label>
                <select 
                  value={migrationDest}
                  onChange={(e) => setMigrationDest(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5"
                >
                  <option value="EU_WEST_1">EU_WEST_1</option>
                  <option value="US_EAST_2">US_EAST_2</option>
                  <option value="AP_SOUTH_1">AP_SOUTH_1</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleTriggerMigration}
              disabled={isMigrating}
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded uppercase tracking-wider text-[10px] text-center"
            >
              {isMigrating ? "Relocating telemetry partitions..." : "Migrate Jurisdictional Data"}
            </button>
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
                    <span className="text-sm font-extrabold text-slate-855">{value.name}</span>
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

      {/* EXCEL-STYLE PIVOT DATA MART BUILDER */}
      <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Pivot-Table Custom Data Mart Builder</h2>
          <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop or select fields from raw streams to provision new materialized views and custom structured data marts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
          {/* Controls Column */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {/* Step 1: Base Source Table & Row Dimensions */}
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">1. Select Base Stream Source</label>
                <select 
                  value={pivotSource}
                  onChange={(e) => {
                    setPivotSource(e.target.value);
                    setPivotRows([]); // Reset chosen dimensions
                    // default aggregation column
                    const firstCol = schemas[e.target.value]?.columns[0]?.name || "";
                    setPivotAggCol(firstCol);
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:border-violet-500 font-sans"
                >
                  {Object.entries(coreSchemas).map(([key, schema]) => (
                    <option key={key} value={key}>{schema.name} ({schema.dbTable})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1.5">2. Group By Dimensions (Rows)</label>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto bg-white p-2 border border-slate-200 rounded font-sans">
                  {schemas[pivotSource]?.columns.map((col) => (
                    <label key={col.name} className="flex items-center gap-2 hover:bg-slate-50 p-0.5 rounded cursor-pointer text-xs">
                      <input 
                        type="checkbox"
                        checked={pivotRows.includes(col.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPivotRows(prev => [...prev, col.name]);
                          } else {
                            setPivotRows(prev => prev.filter(r => r !== col.name));
                          }
                        }}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-slate-700 font-medium">{col.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">{col.type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Aggregation, Dest & Generate */}
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">3. Function</label>
                    <select
                      value={pivotFunction}
                      onChange={(e) => setPivotFunction(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:border-violet-500 font-sans"
                    >
                      <option value="COUNT">COUNT</option>
                      <option value="SUM">SUM</option>
                      <option value="AVG">AVG</option>
                      <option value="MAX">MAX</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">4. Agg Column</label>
                    <select
                      value={pivotAggCol}
                      onChange={(e) => setPivotAggCol(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:border-violet-500 font-sans"
                    >
                      {schemas[pivotSource]?.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">5. Custom Table Target Name</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1.5 focus-within:border-violet-500">
                    <span className="text-slate-400 text-[10px] mr-1">clickhouse.custom_</span>
                    <input 
                      type="text" 
                      value={newMartName} 
                      onChange={(e) => setNewMartName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} 
                      className="bg-transparent focus:outline-none w-full text-slate-800 font-semibold"
                      placeholder="e.g. windows_auth_summary"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuildPivot}
                disabled={isGeneratingPivot}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold rounded p-2 text-center uppercase tracking-wider text-[10px] mt-4"
              >
                {isGeneratingPivot ? "⚡ Provisioning Materialized View..." : "📊 Materialize Custom Pivot Mart"}
              </button>
            </div>
          </div>

          {/* Diagram / Preview Column */}
          <div className="lg:col-span-1 p-4 border border-dashed border-slate-200 rounded-lg flex flex-col justify-between text-xs font-mono bg-slate-50/50">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Logical MatView Pipeline Preview</span>
              <div className="bg-[#0f172a] text-cyan-400 p-3 rounded text-[10px] space-y-1.5 leading-relaxed overflow-x-auto min-h-[140px]">
                <div><span className="text-pink-400">CREATE MATERIALIZED VIEW</span> clickhouse.custom_{newMartName || "table"}</div>
                <div><span className="text-pink-400">ENGINE</span> = Distributed</div>
                <div><span className="text-pink-400">POPULATE AS</span></div>
                <div><span className="text-pink-400">SELECT</span></div>
                {pivotRows.map((r, idx) => (
                  <div key={r} className="pl-4">  {r}{idx < pivotRows.length - 1 ? "," : ""},</div>
                ))}
                <div className="pl-4"><span className="text-yellow-400">{pivotFunction}</span>({pivotAggCol}) <span className="text-pink-400">AS</span> aggregated_value</div>
                <div><span className="text-pink-400">FROM</span> {schemas[pivotSource]?.dbTable}</div>
                <div><span className="text-pink-400">GROUP BY</span> {pivotRows.join(", ") || "[Choose dimensions]"}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-sans">
              ℹ️ Materializing this pivot maps the query pipeline directly into the Vector routing streams. ClickHouse distributes partitions automatically to prevent data stalls.
            </div>
          </div>
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
