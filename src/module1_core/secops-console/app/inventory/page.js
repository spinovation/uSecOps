"use client";

import { useState } from "react";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("hardware");
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const hardwareAssets = [
    { hostname: "boston-ws-01", ip: "10.100.12.45", type: "Workstation", cpu: "Intel Core i7 (8 Cores)", memory: "16 GB DDR4 RAM", storage: "512 GB NVMe SSD", mac: "00:50:56:C0:00:01", serial: "SN-BOS-94921", status: "Active" },
    { hostname: "london-ws-02", ip: "10.100.14.78", type: "Workstation", cpu: "Intel Core i9 (16 Cores)", memory: "32 GB DDR4 RAM", storage: "1 TB NVMe SSD", mac: "00:50:56:C0:00:02", serial: "SN-LDN-30192", status: "Active" },
    { hostname: "mainframe-prod-01", ip: "10.200.4.5", type: "Server", cpu: "IBM z16 (128 Cores)", memory: "1024 GB ECC RAM", storage: "20 TB SAN LUN", mac: "00:1A:2B:3C:4D:5E", serial: "SN-MF-PROD-01", status: "Active" },
    { hostname: "border-edge-fw", ip: "10.100.1.2", type: "Firewall", cpu: "AMD EPYC (8 Cores)", memory: "16 GB RAM", storage: "64 GB M.2 flash", mac: "00:0E:F1:2C:3B:4A", serial: "SN-FW-BORDER", status: "Active" }
  ];

  const softwareAssets = [
    { name: "nxlog-agent", version: "v2.1.0", path: "/Program Files/nxlog/nxlog.exe", host: "boston-ws-01", installDate: "2026-04-12", status: "Verified & Running" },
    { name: "splunkforwarder", version: "v9.2.0", path: "/opt/splunk/bin/splunkd", host: "london-ws-02", installDate: "2026-05-18", status: "Verified & Running" },
    { name: "usecops-daemon", version: "v1.2.0", path: "/usr/bin/secops-daemon", host: "mainframe-prod-01", installDate: "2026-06-02", status: "Verified & Running" },
    { name: "openssl-lib", version: "v1.1.1t", path: "/usr/lib/libcrypto.so", host: "tokyo-ws-03", installDate: "2026-03-20", status: "Outdated (CVE vulnerability)" }
  ];

  const filteredHardware = hardwareAssets.filter(asset => 
    asset.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.ip.includes(searchQuery) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSoftware = softwareAssets.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.version.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Appliance Asset Inventory
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete database of registered appliance server nodes, workstation endpoints, firewall assets, and installed software agents.
        </p>
      </div>

      <div className="glass-panel p-6 space-y-6 border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
          {/* Inventory Category Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold">
            <button
              onClick={() => {
                setActiveTab("hardware");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === "hardware" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Hardware Inventory ({filteredHardware.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("software");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === "software" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Software Inventory ({filteredSoftware.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3.5 top-2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 pl-9 font-mono text-xs focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Inventory List */}
          <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {activeTab === "hardware" ? (
              filteredHardware.length > 0 ? (
                filteredHardware.map((asset) => (
                  <div 
                    key={asset.hostname}
                    onClick={() => setSelectedHardware(asset)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 ${
                      selectedHardware?.hostname === asset.hostname ? "border-violet-500 bg-violet-50/20" : "border-slate-200"
                    }`}
                  >
                    <div className="font-mono text-xs space-y-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">{asset.type}</span>
                      <span className="font-bold text-slate-800 text-sm">{asset.hostname}</span>
                      <span className="text-slate-500 block">{asset.ip}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded">
                      {asset.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 font-mono text-xs text-slate-400">No hardware assets found.</div>
              )
            ) : (
              filteredSoftware.length > 0 ? (
                filteredSoftware.map((pkg) => (
                  <div 
                    key={pkg.name}
                    onClick={() => setSelectedSoftware(pkg)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 ${
                      selectedSoftware?.name === pkg.name ? "border-violet-500 bg-violet-50/20" : "border-slate-200"
                    }`}
                  >
                    <div className="font-mono text-xs space-y-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Node Host: {pkg.host}</span>
                      <span className="font-bold text-slate-800 text-sm">{pkg.name}</span>
                      <span className="text-slate-500 block">Version: {pkg.version}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                      pkg.status.includes("Outdated") ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 font-mono text-xs text-slate-400">No software packages found.</div>
              )
            )}
          </div>

          {/* Right Panel: Drill Down Details Card */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col justify-between min-h-[300px]">
            {activeTab === "hardware" ? (
              selectedHardware ? (
                <div className="space-y-4 font-mono text-xs text-slate-700">
                  <h4 className="font-extrabold text-base text-slate-850 border-b border-slate-200 pb-3 flex items-center gap-1.5">
                    🖥️ {selectedHardware.hostname}
                  </h4>
                  <div className="space-y-3">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Device IP</span> {selectedHardware.ip}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Device Type</span> {selectedHardware.type}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">CPU Topology</span> {selectedHardware.cpu}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">ECC Memory</span> {selectedHardware.memory}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Storage Partition</span> {selectedHardware.storage}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">MAC Address</span> {selectedHardware.mac}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Serial Number</span> {selectedHardware.serial}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 font-mono text-xs py-10">
                  <span>🖥️ Select a hardware asset node to drill down and inspect parameters.</span>
                </div>
              )
            ) : (
              selectedSoftware ? (
                <div className="space-y-4 font-mono text-xs text-slate-700">
                  <h4 className="font-extrabold text-base text-slate-850 border-b border-slate-200 pb-3 flex items-center gap-1.5">
                    📦 {selectedSoftware.name}
                  </h4>
                  <div className="space-y-3">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Active Version</span> {selectedSoftware.version}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Executable Binary Path</span> {selectedSoftware.path}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Installed Node</span> {selectedSoftware.host}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Date Registered</span> {selectedSoftware.installDate}</div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Status Profile</span> {selectedSoftware.status}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 font-mono text-xs py-10">
                  <span>📦 Select a software package file to drill down and inspect metadata.</span>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
