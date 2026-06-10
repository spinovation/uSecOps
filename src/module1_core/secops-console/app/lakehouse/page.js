"use client";

import { useState, useEffect } from "react";

export default function Lakehouse() {
  const [ingestionRate, setIngestionRate] = useState(5120);
  const [storageUsed, setStorageUsed] = useState(86.42);
  const [retentionDays, setRetentionDays] = useState(365);
  
  // Selected drill-down Data Mart
  const [selectedMart, setSelectedMart] = useState("unstructured");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time raw log stream simulator state
  const [rawLogs, setRawLogs] = useState([
    { time: "10:59:02", ip: "10.100.12.45", msg: "INFO: secops-run daemon: heartbeat verified", type: "UNSTRUCTURED" },
    { time: "10:59:05", ip: "10.100.14.78", msg: "SECURITY: Auth checked for user admin - session 449", type: "STRUCTURED_IDENTITY" },
    { time: "10:59:10", ip: "10.100.15.12", msg: "ERROR: nxlog syslog handler - socket timeout on port 514", type: "UNSTRUCTURED" },
    { time: "10:59:11", ip: "10.100.12.45", msg: "FLOW: outbound TCP connection to 8.8.8.8:53 allowed", type: "STRUCTURED_FLOW" }
  ]);

  // Dynamic ingestion rates
  useEffect(() => {
    const interval = setInterval(() => {
      setIngestionRate(prev => Math.floor(prev + (Math.random() * 400 - 200)));
      setStorageUsed(prev => +(prev + 0.01).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Schemas metadata
  const schemas = {
    unstructured: {
      name: "Unstructured Raw Logs",
      dbTable: "clickhouse.raw_logs",
      description: "Stores raw, unparsed syslog streams, event dump JSON payloads, and unclassified text outputs forwarded from agents.",
      columns: [
        { name: "timestamp", type: "DateTime", desc: "Ingestion timestamp on the Lakehouse server" },
        { name: "source_ip", type: "String (IPv4/IPv6)", desc: "Originating host IP address" },
        { name: "log_level", type: "Enum('INFO', 'WARN', 'ERROR')", desc: "Extracted log priority marker" },
        { name: "raw_payload", type: "String", desc: "Full text block of the raw unparsed message" }
      ]
    },
    identity: {
      name: "Structured Identity Mart",
      dbTable: "postgres.identity_logs",
      description: "Parsed database of session authentications, token exchanges, dynamic directory changes, and credential status reports.",
      columns: [
        { name: "session_id", type: "UUID", desc: "Unique session tracker identifier" },
        { name: "user_principal", type: "String", desc: "User email or identity identifier (e.g. sridhargs@spinovation.com)" },
        { name: "auth_provider", type: "String", desc: "Source authentication mechanism (e.g. AzureAD, Okta, LDAP)" },
        { name: "auth_status", type: "Enum('SUCCESS', 'FAILED', 'LOCKOUT')", desc: "Outcome of authentication process" },
        { name: "timestamp", type: "DateTime", desc: "Time validation was completed by identity provider" }
      ]
    },
    flow: {
      name: "Structured Network Flow Mart",
      dbTable: "postgres.flow_logs",
      description: "Aggregated flow records depicting packet transits, connection routes, bytes transferred, and local firewall states.",
      columns: [
        { name: "flow_id", type: "Int64", desc: "Unique flow table incremental index" },
        { name: "src_ip", type: "String", desc: "Source IP address" },
        { name: "dest_ip", type: "String", desc: "Destination IP address" },
        { name: "dest_port", type: "Int32", desc: "Target application port" },
        { name: "protocol", type: "Enum('TCP', 'UDP', 'ICMP')", desc: "Transit network layer protocol" },
        { name: "bytes_sent", type: "Int64", desc: "Data payload volume in bytes" }
      ]
    },
    software: {
      name: "Structured Software Inventory",
      dbTable: "postgres.software_inventory",
      description: "Dynamic catalog of installed agent binary revisions, system dependencies, library paths, and operational applications.",
      columns: [
        { name: "record_id", type: "Int64", desc: "Unique software registry row ID" },
        { name: "hostname", type: "String", desc: "Device hostname where software is installed" },
        { name: "software_name", type: "String", desc: "Common binary or package name (e.g. splunkforwarder, nxlog)" },
        { name: "version", type: "String", desc: "Version build signature number" },
        { name: "install_path", type: "String", desc: "File system installation path" },
        { name: "last_scan_date", type: "DateTime", desc: "Time of last security audit assessment" }
      ]
    },
    hardware: {
      name: "Structured Hardware Inventory",
      dbTable: "postgres.hardware_inventory",
      description: "Complete asset inventory of CPU layout core architectures, RAM metrics, interface MACs, and device hardware classifications.",
      columns: [
        { name: "device_id", type: "UUID", desc: "Unique asset hardware tracking ID" },
        { name: "device_type", type: "Enum('SERVER', 'WORKSTATION', 'ROUTER', 'SWITCH', 'FIREWALL')", desc: "Device network hardware tier" },
        { name: "hostname", type: "String", desc: "Hostname or local name representation" },
        { name: "ip_address", type: "String", desc: "Primary interface network address" },
        { name: "cpu_cores", type: "Int32", desc: "Total physical CPU cores" },
        { name: "memory_gb", type: "Int32", desc: "Installed system memory capacity in GB" },
        { name: "mac_address", type: "String", desc: "Physical link network adapter MAC address" }
      ]
    }
  };

  // Mock Rows data
  const mockRows = {
    unstructured: [
      { timestamp: "10:59:02", source_ip: "10.100.12.45", log_level: "INFO", raw_payload: "INFO: secops-run daemon: heartbeat verified" },
      { timestamp: "10:59:10", source_ip: "10.100.15.12", log_level: "ERROR", raw_payload: "ERROR: nxlog syslog handler - socket timeout on port 514" },
      { timestamp: "10:59:14", source_ip: "10.200.4.5", log_level: "WARN", raw_payload: "SYS: kernel module loaded successfully: ebpf_probe_console" },
      { timestamp: "10:59:22", source_ip: "10.100.14.78", log_level: "INFO", raw_payload: "WARNING: high disk I/O load detected on ClickHouse replica partition 'db_partition_3'" }
    ],
    identity: [
      { session_id: "8c9a2c30-f822-4a00-b1d5-9988ffeeddcc", user_principal: "sridhargs@spinovation.com", auth_provider: "AzureAD", auth_status: "SUCCESS", timestamp: "10:59:05" },
      { session_id: "a1a2b3b4-c5c6-7d7d-8e8e-9f9f0a0a1b1b", user_principal: "admin@spinovation.com", auth_provider: "Okta SSO", auth_status: "SUCCESS", timestamp: "10:58:32" },
      { session_id: "e5e5f6f6-a7a7-8b8b-9c9c-0d0d1e1e2f2f", user_principal: "unknown_intruder@attack.com", auth_provider: "LDAP Direct", auth_status: "FAILED", timestamp: "10:57:11" }
    ],
    flow: [
      { flow_id: 1049281, src_ip: "10.100.12.45", dest_ip: "8.8.8.8", dest_port: 53, protocol: "UDP", bytes_sent: 84 },
      { flow_id: 1049282, src_ip: "10.100.14.78", dest_ip: "10.100.12.45", dest_port: 443, protocol: "TCP", bytes_sent: 2450 },
      { flow_id: 1049283, src_ip: "10.200.4.5", dest_ip: "192.168.10.1", dest_port: 9997, protocol: "TCP", bytes_sent: 128400 }
    ],
    software: [
      { record_id: 1001, hostname: "boston-ws-01", software_name: "nxlog-agent", version: "2.1.0", install_path: "/Program Files/nxlog/nxlog.exe", last_scan_date: "2026-06-10 09:30" },
      { record_id: 1002, hostname: "london-ws-02", software_name: "splunkforwarder", version: "9.2.0", install_path: "/opt/splunk/bin/splunkd", last_scan_date: "2026-06-10 10:15" },
      { record_id: 1003, hostname: "mainframe-prod-01", software_name: "usecops-daemon", version: "1.2.0", install_path: "/usr/bin/secops-daemon", last_scan_date: "2026-06-10 10:45" },
      { record_id: 1004, hostname: "tokyo-ws-03", software_name: "openssl-lib", version: "1.1.1t", install_path: "/usr/lib/libcrypto.so", last_scan_date: "2026-06-10 08:00" }
    ],
    hardware: [
      { device_id: "d9e8d7c6-b5a4-3c2b-1a0f-9e8d7c6b5a43", device_type: "WORKSTATION", hostname: "boston-ws-01", ip_address: "10.100.12.45", cpu_cores: 8, memory_gb: 16, mac_address: "00:50:56:C0:00:01" },
      { device_id: "f8e7d6c5-b4a3-2c1b-0a9f-8e7d6c5b4a32", device_type: "WORKSTATION", hostname: "london-ws-02", ip_address: "10.100.14.78", cpu_cores: 16, memory_gb: 32, mac_address: "00:50:56:C0:00:02" },
      { device_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", device_type: "SERVER", hostname: "mainframe-prod-01", ip_address: "10.200.4.5", cpu_cores: 128, memory_gb: 1024, mac_address: "00:1A:2B:3C:4D:5E" },
      { device_id: "c8d7e6f5-a4b3-2c1d-0e9f-8a7b6c5d4e3f", device_type: "ROUTER", hostname: "core-gateway-01", ip_address: "10.100.1.1", cpu_cores: 4, memory_gb: 8, mac_address: "00:0F:E2:3D:4E:5F" },
      { device_id: "7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d", device_type: "FIREWALL", hostname: "border-edge-fw", ip_address: "10.100.1.2", cpu_cores: 8, memory_gb: 16, mac_address: "00:0E:F1:2C:3B:4A" }
    ]
  };

  // Dynamic filter logic per mart table
  const getFilteredRows = () => {
    const rows = mockRows[selectedMart] || [];
    if (!searchQuery) return rows;
    
    return rows.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const currentMartSchema = schemas[selectedMart];
  const activeRows = getFilteredRows();

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Unified Ingestion Lakehouse & Data Marts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time log lakehouse capturing structured identity, flow, software, hardware, and raw unstructured event payloads from workstation and server agents.
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Real-Time Ingestion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{ingestionRate}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">EPS</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">▲ +5.6% Log Flow Rate</span>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Lakehouse Storage Used</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{storageUsed.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">GB</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1 font-bold">Of 5,000 GB Allocated Capacity</span>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Configured Retention Policy</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{retentionDays}</span>
            <span className="text-xs font-mono text-slate-500 font-bold">Days</span>
          </div>
          <span className="text-[10px] text-violet-600 block mt-1 font-bold">Automatic partition rollover active</span>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Connected Fleet Devices</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">1,502</span>
            <span className="text-xs font-mono text-slate-500 font-bold">Assets</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">● Streaming Workstations, Servers, Routers</span>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left columns - Drill-down Details & Search Registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-slate-200 bg-white flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{currentMartSchema.name}</h2>
                  <code className="text-xs font-mono text-cyan-600 bg-slate-100 px-2 py-0.5 rounded">
                    Table: {currentMartSchema.dbTable}
                  </code>
                </div>

                {/* Data Mart drill-down selectors */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold flex-wrap">
                  {Object.keys(schemas).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedMart(key);
                        setSearchQuery("");
                      }}
                      className={`px-2.5 py-1.5 rounded-md transition-all ${
                        selectedMart === key ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Query Input */}
              <div className="relative mb-4">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${currentMartSchema.name} database table...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 pl-9 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Drill-down Results Table */}
            <div className="flex-1 my-2 overflow-x-auto min-h-[250px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase bg-slate-50">
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
                      <td colSpan={currentMartSchema.columns.length} className="text-center py-12 text-slate-400">
                        No rows found matching search query filter in {currentMartSchema.dbTable}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right column - Data mart schema column details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Table Schema metadata fields */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Table Fields Schema Definition</h3>
            <p className="text-xs text-slate-400">{currentMartSchema.description}</p>

            <div className="space-y-3 font-mono text-xs">
              {currentMartSchema.columns.map((col) => (
                <div key={col.name} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{col.name}</span>
                    <span className="text-[10px] text-cyan-600 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded">
                      {col.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Retention settings action */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Retention & Data Rollover</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 font-mono">Retention Threshold</span>
                <span className="font-mono font-bold text-violet-600">{retentionDays} Days</span>
              </div>
              <input
                type="range"
                min="90"
                max="730"
                step="30"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <button 
                onClick={() => alert(`Retention threshold updated to rollover data older than ${retentionDays} days.`)}
                className="w-full text-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-bold font-mono"
              >
                Apply Retention Rule
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
