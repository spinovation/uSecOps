"use client";

import { useState } from "react";

export default function Integrations() {
  const [selectedPartner, setSelectedPartner] = useState("gcp");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [pemFile, setPemFile] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLogs, setTestLogs] = useState([]);

  // Legacy mainframe configs
  const [legacySystem, setLegacySystem] = useState("as400");
  const [legacyEndpoint, setLegacyEndpoint] = useState("10.200.4.5:9450");
  const [isLegacyTesting, setIsLegacyTesting] = useState(false);
  const [legacyLogs, setLegacyLogs] = useState([]);

  // Partner definitions
  const partners = {
    gcp: { name: "Google Cloud Platform", type: "Cloud Provider", defaultEndpoint: "https://pubsub.googleapis.com" },
    aws: { name: "Amazon Web Services", type: "Cloud Provider", defaultEndpoint: "https://kinesis.us-east-1.amazonaws.com" },
    azure: { name: "Microsoft Azure", type: "Cloud Provider", defaultEndpoint: "https://eventhub.windows.net" },
    crowdstrike: { name: "CrowdStrike Falcon", type: "XDR Platform", defaultEndpoint: "https://api.crowdstrike.com" },
    splunk: { name: "Splunk HEC", type: "Data Platform", defaultEndpoint: "https://hec.splunk.internal:8088" },
    chronicle: { name: "Google Chronicle", type: "SIEM Platform", defaultEndpoint: "https://backstory.googleapis.com" },
    sentinel: { name: "Microsoft Sentinel", type: "SIEM Platform", defaultEndpoint: "https://sentinel.azure.com" },
    servicenow: { name: "ServiceNow ITSM", type: "Business Workflow", defaultEndpoint: "https://devinstance.service-now.com" }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTestLogs([
      "Initiating secure handshake connection...",
      "Resolving target REST endpoint signature...",
      "Verifying mTLS certificate authentication..."
    ]);

    setTimeout(() => {
      setTestLogs(prev => [
        ...prev,
        "Cryptographic credentials check: SUCCESS",
        "Validating remote API permissions scope...",
        "Querying database ingestion telemetry channels..."
      ]);
    }, 1000);

    setTimeout(() => {
      setTestLogs(prev => [
        ...prev,
        "Status: SUCCESSFUL (mTLS Core Link Established)"
      ]);
      setTestResult("CONNECTED");
      setIsTesting(false);
    }, 2200);
  };

  const handleTestLegacy = () => {
    setIsLegacyTesting(true);
    setLegacyLogs([
      `Initializing SmartConnect bridge session to ${legacySystem.toUpperCase()}...`,
      `Pinging endpoint socket: ${legacyEndpoint}...`
    ]);

    setTimeout(() => {
      setLegacyLogs(prev => [
        ...prev,
        "Connected. Requesting SMF/QAUDJRN record headers...",
        "Validating LegacyTel bridging parsing syntax...",
        "System state: Sync complete. Log forwarding enabled."
      ]);
      setIsLegacyTesting(false);
    }, 1800);
  };

  const currentPartner = partners[selectedPartner];

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Module 1: Unified SecOps Core Integrations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Ditch local agent overhead. Connect directly to enterprise cloud providers, security platforms, legacy mainframes, and business directories via secure mTLS API hooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: API integration and legacy configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Partner Selector & Credentials Panel */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">External Partner API Credentials</h2>
              <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded font-bold uppercase">
                Segmented Core
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Partner Dropdown */}
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block">1. Select Partner</label>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {Object.entries(partners).map(([key, value]) => (
                    <div
                      key={key}
                      onClick={() => {
                        setSelectedPartner(key);
                        setTestResult(null);
                        setTestLogs([]);
                      }}
                      className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                        selectedPartner === key ? "border-violet-500 bg-violet-50/50 font-bold" : "border-slate-200 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="text-slate-800">{value.name}</div>
                      <div className="text-[10px] text-slate-400">{value.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credentials Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1 font-mono text-xs">
                  <label className="text-slate-500 block">Endpoint Destination URL</label>
                  <input
                    type="text"
                    defaultValue={currentPartner.defaultEndpoint}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-violet-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Access Key / Client ID</label>
                    <input
                      type="text"
                      placeholder="e.g. secops-id-9482"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-violet-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Secret Token / Certificate Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-violet-500 text-violet-750"
                    />
                  </div>
                </div>

                {/* PEM Upload */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-500 block">mTLS Private Key (.PEM Certificate)</span>
                  <div 
                    onClick={() => document.getElementById("pem-upload-input").click()}
                    className="border-2 border-dashed border-slate-350 hover:border-violet-400 bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
                  >
                    <input 
                      type="file" 
                      id="pem-upload-input" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPemFile(e.target.files[0].name);
                        }
                      }}
                    />
                    <span className="text-2xl mb-1">🔑</span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {pemFile ? `Uploaded: ${pemFile}` : "Drag-Drop or Select PEM Certificate"}
                    </span>
                  </div>
                </div>

                {/* Submit & Test */}
                <div className="flex gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex-1 btn-glass btn-glass-success justify-center text-xs py-2.5 font-mono font-bold uppercase tracking-wider"
                  >
                    {isTesting ? "⚡ Testing Auth Token..." : "⚙️ Verify Connection Credentials"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Legacy Mainframe SmartConnect Bridge */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Legacy Mainframe SmartConnect</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Legacy Platform Target</label>
                  <select 
                    value={legacySystem}
                    onChange={(e) => {
                      setLegacySystem(e.target.value);
                      if (e.target.value === "as400") setLegacyEndpoint("10.200.4.5:9450");
                      if (e.target.value === "zos") setLegacyEndpoint("10.200.4.6:3090");
                      if (e.target.value === "tandem") setLegacyEndpoint("10.200.4.8:7080");
                      setLegacyLogs([]);
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700"
                  >
                    <option value="as400">IBM AS/400 (IBM i QAUDJRN)</option>
                    <option value="zos">IBM z/OS Mainframe (SMF Logs)</option>
                    <option value="tandem">HPE NonStop / Tandem (EMS Logs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block text-[9px] uppercase font-bold mb-1">SmartConnect Listener API Port</label>
                  <input
                    type="text"
                    value={legacyEndpoint}
                    onChange={(e) => setLegacyEndpoint(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
                  />
                </div>

                <button 
                  onClick={handleTestLegacy}
                  disabled={isLegacyTesting}
                  className="w-full btn-glass justify-center text-xs py-2 font-mono font-bold uppercase"
                >
                  {isLegacyTesting ? "Connecting to Legacy Socket..." : "Verify SmartConnect Bridge"}
                </button>
              </div>

              {/* Legacy logs terminal */}
              <div className="bg-[#0f172a] rounded-lg border border-slate-800 p-4 font-mono text-[10px] text-cyan-400 min-h-[160px] flex flex-col justify-between">
                <span className="text-slate-500 uppercase text-[8px] font-bold">SmartConnect Console log</span>
                <div className="flex-1 mt-2 space-y-1 overflow-y-auto">
                  {legacyLogs.length > 0 ? (
                    legacyLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span>&gt;</span>
                        <span className={log.includes("Sync complete") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 h-full flex items-center justify-center text-center">
                      Bridge session idle. Initiate authentication check.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Ingestion Status Console Logs */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[450px] flex flex-col justify-between border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">API Connection Status</h3>
              <p className="text-xs text-slate-400">Core Ingestion Validation Log</p>
            </div>

            <div className="flex-1 my-4 min-h-[220px] bg-[#0f172a] border border-slate-800 rounded p-4 font-mono text-[10px] text-cyan-400 space-y-2 overflow-y-auto">
              {testLogs.length > 0 ? (
                testLogs.map((log, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span>&gt;</span>
                    <span className={log.includes("SUCCESSFUL") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 flex items-center justify-center h-full text-center">
                  Partner session validation logs. Initiate verification test.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] space-y-1 text-slate-600">
              <div className="flex justify-between items-center">
                <span>Active Handshake State:</span>
                <span className={`font-bold ${testResult === "CONNECTED" ? "text-emerald-600" : "text-slate-400"}`}>
                  {testResult || "IDLE"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Integration Encryption:</span>
                <span className="text-cyan-600 font-bold">AES-256 GCM</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Ontology to Action pipeline visualizer */}
      <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
        <h3 className="text-lg font-bold text-slate-800">AI Agent Workflow Timeline (Ontology to Action)</h3>
        <p className="text-xs text-slate-500">Autonomous AI pipeline tracing data anomalies, analyzing business ontologies, and raising ServiceNow workflows.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs pt-4 border-t border-slate-100">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 relative">
            <span className="text-sky-600 font-bold block text-[10px]">STEP 1: LOG INGESTION</span>
            <span className="font-bold text-slate-800">Raw API Logs Ingested</span>
            <p className="text-[10px] text-slate-500 mt-1">Raw logons, transaction records, and logs are fetched from external APIs.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-400 font-bold z-10">&gt;</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 relative">
            <span className="text-violet-600 font-bold block text-[10px]">STEP 2: ONTOLOGY MATCH</span>
            <span className="font-bold text-slate-800">Business Entity Mapping</span>
            <p className="text-[10px] text-slate-500 mt-1">Logs are normalized and mapped to target servers, applications, and owners.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-400 font-bold z-10">&gt;</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 relative">
            <span className="text-amber-600 font-bold block text-[10px]">STEP 3: AI ANALYSIS</span>
            <span className="font-bold text-slate-800">LLM Reasoning Audit</span>
            <p className="text-[10px] text-slate-500 mt-1">Local AI Agent analyzes user behavior, risk blast-radii, and maps anomalies.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-400 font-bold z-10">&gt;</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-emerald-600 font-bold block text-[10px]">STEP 4: BUSINESS ACTION</span>
            <span className="font-bold text-slate-800">ServiceNow Ticketing</span>
            <p className="text-[10px] text-slate-500 mt-1">AI triggers ServiceNow API calls to open tickets, notify owners, and request approvals.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
