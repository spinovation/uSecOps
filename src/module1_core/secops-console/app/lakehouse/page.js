"use client";

import { useState, useEffect, useRef } from "react";

export default function Lakehouse() {
  const [ingestionRate, setIngestionRate] = useState(4820);
  const [storageUsed, setStorageUsed] = useState(84.6); // GB
  const [retentionDays, setRetentionDays] = useState(365);
  const [selectedMart, setSelectedMart] = useState("unstructured");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real-time raw log stream simulator
  const [rawLogs, setRawLogs] = useState([
    { time: "10:43:02", ip: "10.100.12.45", msg: "INFO: secops-run daemon: heartbeat verified", type: "UNSTRUCTURED" },
    { time: "10:43:05", ip: "10.100.14.78", msg: "SECURITY: Auth checked for user admin - session 449", type: "STRUCTURED_IDENTITY" },
    { time: "10:43:10", ip: "10.100.15.12", msg: "ERROR: nxlog syslog handler - socket timeout on port 514", type: "UNSTRUCTURED" },
    { time: "10:43:11", ip: "10.100.12.45", msg: "FLOW: outbound TCP connection to 8.8.8.8:53 allowed", type: "STRUCTURED_FLOW" }
  ]);

  const logEndRef = useRef(null);

  // Simulate incoming real-time logs from workstations
  useEffect(() => {
    const ips = ["10.100.12.45", "10.100.14.78", "10.100.15.12", "10.200.4.5"];
    const messages = [
      "INFO: secops-run process spawn: git pull executed under standard credentials",
      "SECURITY: User session authenticated via AzureAD token",
      "ERROR: failed authentication attempt from 192.168.1.100 - user: guest",
      "FLOW: inbound UDP connection allowed from 10.100.12.1:123 to local NTP",
      "SYS: kernel module loaded successfully: ebpf_probe_console",
      "WARNING: high disk I/O load detected on ClickHouse replica partition 'db_partition_3'"
    ];
    const types = ["UNSTRUCTURED", "STRUCTURED_IDENTITY", "UNSTRUCTURED", "STRUCTURED_FLOW", "UNSTRUCTURED", "STRUCTURED_METRICS"];

    const interval = setInterval(() => {
      const randomIp = ips[Math.floor(Math.random() * ips.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const now = new Date().toTimeString().split(' ')[0];

      const newLog = { time: now, ip: randomIp, msg: randomMsg, type: randomType };
      
      setRawLogs(prev => {
        const updated = [...prev, newLog];
        // Keep last 50 logs
        return updated.slice(-50);
      });

      // Fluctuate ingestion rate
      setIngestionRate(prev => Math.floor(prev + (Math.random() * 400 - 200)));
      setStorageUsed(prev => +(prev + 0.01).toFixed(2));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = rawLogs.filter(log => {
    const matchesQuery = log.msg.toLowerCase().includes(searchQuery.toLowerCase()) || log.ip.includes(searchQuery);
    if (!matchesQuery) return false;
    
    if (selectedMart === "all") return true;
    if (selectedMart === "unstructured") return log.type === "UNSTRUCTURED";
    return log.type.startsWith("STRUCTURED");
  });

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Unified Ingestion Lakehouse & Data Marts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time log lakehouse capturing structured identity, flow, and raw unstructured event payloads from workstation agents.
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
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">▲ +4.2% Log Flow Rate</span>
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
          <span className="text-[10px] text-violet-600 block mt-1 font-bold">Automatic partition rollover applied</span>
        </div>

        <div className="glass-panel p-5 border border-slate-200 bg-white">
          <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Connected Workstations</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">1,489</span>
            <span className="text-xs font-mono text-slate-500 font-bold">Endpoints</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">● All agents streaming real-time logs</span>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left columns - Logs query & live feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-slate-200 flex flex-col justify-between min-h-[450px]">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800">Active Log Ingestion Terminal</h2>
                
                {/* Data Mart Tabs */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold">
                  <button
                    onClick={() => setSelectedMart("all")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      selectedMart === "all" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All Streams
                  </button>
                  <button
                    onClick={() => setSelectedMart("unstructured")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      selectedMart === "unstructured" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Unstructured Logs
                  </button>
                  <button
                    onClick={() => setSelectedMart("structured")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      selectedMart === "structured" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Structured Marts
                  </button>
                </div>
              </div>

              {/* Log Query Input */}
              <div className="relative mb-4">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Filter incoming real-time logs by IP, message, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-9 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Rolling log output */}
            <div className="flex-1 my-2 min-h-[300px] bg-[#0f172a] border border-slate-800 rounded p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-cyan-400 space-y-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => {
                  const isUnstructured = log.type === "UNSTRUCTURED";
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-800 pb-1.5 last:border-none">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className="text-sky-400 shrink-0 font-bold">{log.ip}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        isUnstructured ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" : "bg-violet-950 text-violet-300 border border-violet-800/40"
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-slate-300 break-all">{log.msg}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-full text-center">
                  No incoming log events match the query filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Data mart schema / metadata */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Data Mart Registries */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Lakehouse Data Mart Schema</h3>
            <p className="text-xs text-slate-400">Index registries of dynamic table schemas</p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-700">1. Unstructured raw_logs</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Stores syslog streams, event dump JSON payloads, unparsed text files.</p>
                <div className="flex justify-between mt-2 text-[10px] text-cyan-600 font-bold">
                  <span>Partition: clickhouse.raw</span>
                  <span>Active EPS: ~2,400</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-700">2. Structured identity_logs</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Processed authentication sessions, AzureAD audits, VPN authorizations.</p>
                <div className="flex justify-between mt-2 text-[10px] text-violet-600 font-bold">
                  <span>Partition: postgres.identity</span>
                  <span>Active EPS: ~900</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-700">3. Structured flow_logs</span>
                <p className="text-[10px] text-slate-400 mt-0.5">VPC route tables, inbound/outbound TCP/UDP ports, traffic weights.</p>
                <div className="flex justify-between mt-2 text-[10px] text-violet-600 font-bold">
                  <span>Partition: postgres.flow</span>
                  <span>Active EPS: ~1,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retention settings action */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-800">Retention Management</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 font-mono">Roll-off Threshold</span>
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
