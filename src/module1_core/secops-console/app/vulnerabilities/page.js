"use client";

import { useState, useEffect } from "react";

export default function Vulnerabilities() {
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isPatching, setIsPatching] = useState(false);
  const [patchLogs, setPatchLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  
  // Binary upload states
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState([]);
  const [uploadedBinary, setUploadedBinary] = useState(null);

  // Load from localStorage or default
  const [vulnerabilities, setVulnerabilities] = useState([
    {
      cve: "CVE-2024-3094",
      title: "XZ Utils Backdoor RCE",
      package: "liblzma.5.6.0.so",
      staticSeverity: 10.0,
      reachability: "ACTIVE_EXPOSURE",
      reachabilityScore: 9.8,
      port: 22,
      path: "/usr/lib/liblzma.so.5.6.0",
      description: "Malicious code injected via sshd pre-auth hook allows bypass of standard authentication, leading to complete remote command execution capability.",
      analysis: "Mythos analysis: Exploit is ACTIVE. Local sshd process is bound to Port 22 and has loaded the compromised liblzma.5.6.0 in-memory process. Path verified via system eBPF dynamic loader trace.",
      patchCode: "# Mythos-Synthesized WAF & SSH Configuration Patch\n# Applied completely offline via Local LLM\n\n# 1. Update sshd configuration to drop dynamic preload loaders\nexport LD_PROFILE=\nexport LD_BIND_NOW=1\n\n# 2. Block vulnerable Port 22 connections outside management subnets\niptables -A INPUT -p tcp --dport 22 -s 10.100.0.0/16 -j ACCEPT\niptables -A INPUT -p tcp --dport 22 -j DROP\n\n# 3. Trigger immediate fallback container downgrade\napt-get install --allow-downgrades liblzma5=5.4.1-0.2 -y",
      binaryName: "system-core-libraries.deb",
      isRiskAccepted: false
    },
    {
      cve: "CVE-2023-38606",
      title: "Apple Kernel Memory Corrupt Bypass",
      package: "Kernel Framework",
      staticSeverity: 7.8,
      reachability: "UNREACHABLE",
      reachabilityScore: 1.2,
      port: 0,
      path: "/System/Library/Kernels/kernel",
      description: "State-sponsored Triangulation vulnerability enabling applications to bypass hardware memory protections and modify kernel states directly.",
      analysis: "Mythos analysis: Exploit is UNREACHABLE. Affected coprocessor registers are completely locked and unmapped on this host architecture revision. No active execution paths detected.",
      patchCode: "# Mythos-Synthesized Patch\n# Status: Unnecessary (Exploit Unreachable on current platform CPU revision)",
      binaryName: "kernel-image-apple.deb",
      isRiskAccepted: false
    },
    {
      cve: "CVE-2021-44228",
      title: "Apache Log4j RCE",
      package: "log4j-core-2.14.1.jar",
      staticSeverity: 10.0,
      reachability: "ACTIVE_EXPOSURE",
      reachabilityScore: 8.5,
      port: 8080,
      path: "/var/lib/tomcat9/webapps/axis/WEB-INF/lib/log4j-core.jar",
      description: "JNDI lookup parameter injection allows arbitrary remote code download and execution via LDAP lookups.",
      analysis: "Mythos analysis: Exploit is ACTIVE. A Java container is running on Port 8080, and raw payload strings passed into standard request headers trigger remote JNDI parser lookups. Confirmed via live memory audit.",
      patchCode: "# Mythos-Synthesized Log4j Hotfix\n# 1. Inject JVM system property flag into application configurations\nexport JAVA_OPTS=\"$JAVA_OPTS -Dlog4j2.formatMsgNoLookups=true\"\n\n# 2. Strip JndiLookup.class from existing archive binaries\nzip -q -d /var/lib/tomcat9/webapps/axis/WEB-INF/lib/log4j-core-2.14.1.jar org/apache/logging/log4j/core/lookup/JndiLookup.class\n\n# 3. Reload application services\nsystemctl restart tomcat9",
      binaryName: "tomcat-axis-webserver.war",
      isRiskAccepted: false
    }
  ]);

  // Keep track of approved OTA binaries
  const [approvedOTA, setApprovedOTA] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("approvedBinaries");
    if (saved) {
      setApprovedOTA(JSON.parse(saved));
    }
    const savedVulns = localStorage.getItem("vulnRegistry");
    if (savedVulns) {
      setVulnerabilities(JSON.parse(savedVulns));
    }
  }, []);

  const saveToStorage = (updatedVulns, updatedOTA) => {
    localStorage.setItem("vulnRegistry", JSON.stringify(updatedVulns));
    localStorage.setItem("approvedBinaries", JSON.stringify(updatedOTA));
  };

  const handleApplyPatch = (vuln) => {
    setIsPatching(true);
    setPatchLogs([
      "Initialising gRPC Dual-Signature Control Handshake...",
      "Validating cryptographic developer signature...",
      "Validating local administrator authorization..."
    ]);
    
    setTimeout(() => {
      setPatchLogs(prev => [
        ...prev,
        "Signing verified! Sending payload to agent...",
        "Executing hotfix script on remote host...",
        "Verifying process status post-execution..."
      ]);
    }, 1200);

    setTimeout(() => {
      setPatchLogs(prev => [
        ...prev,
        "Patch applied! Downgraded package libraries verified.",
        "Status: SECURE (Reachability Rating -> 0.0)"
      ]);
      setIsPatching(false);
      
      const newVulns = vulnerabilities.map(v => 
        v.cve === vuln.cve ? { ...v, reachability: "RESOLVED", reachabilityScore: 0.0 } : v
      );
      setVulnerabilities(newVulns);
      setSelectedVuln(prev => ({ ...prev, reachability: "RESOLVED", reachabilityScore: 0.0 }));
      saveToStorage(newVulns, approvedOTA);
    }, 2500);
  };

  // Accept risk of binary/vuln and promote to OTA
  const handleAcceptRiskAndApprove = (vuln) => {
    const newVulns = vulnerabilities.map(v => 
      v.cve === vuln.cve ? { ...v, isRiskAccepted: true } : v
    );
    setVulnerabilities(newVulns);
    setSelectedVuln(prev => ({ ...prev, isRiskAccepted: true }));

    // Extract binary metadata
    const binaryToApprove = {
      name: vuln.binaryName || "unknown-binary.msi",
      cveMatched: vuln.cve,
      staticSeverity: vuln.staticSeverity,
      approvedAt: new Date().toLocaleString(),
      signature: "SHA256:" + Math.random().toString(16).substr(2, 64),
      status: "APPROVED_RISK_ACCEPTED",
      type: vuln.binaryName?.includes("agent") || vuln.binaryName?.includes("forwarder") ? "Agent Binary" : "Enterprise Software"
    };

    const newOTAList = [...approvedOTA.filter(b => b.name !== binaryToApprove.name), binaryToApprove];
    setApprovedOTA(newOTAList);
    saveToStorage(newVulns, newOTAList);
    alert(`Binary '${binaryToApprove.name}' approved and queued for OTA Upgrade inventory under accepted risk protocol.`);
  };

  // Mock upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const startAnalysis = (fileName) => {
    setIsAnalyzing(true);
    setUploadedBinary(fileName);
    setAnalysisProgress(0);
    setAnalysisLogs(["Initiating binary payload analysis...", `Target file: ${fileName}`]);

    const intervals = [
      { progress: 20, log: "Extracting metadata & cryptographic signatures...", delay: 500 },
      { progress: 45, log: "Parsing binary headers and unpacking library linkages...", delay: 1000 },
      { progress: 75, log: "Running local Mythos AI vulnerability matcher...", delay: 1800 },
      { progress: 90, log: "Discovered matching vulnerability databases...", delay: 2400 },
      { progress: 100, log: "Analysis Complete. CVE profiles mapped to registry.", delay: 3000 }
    ];

    intervals.forEach((step) => {
      setTimeout(() => {
        setAnalysisProgress(step.progress);
        setAnalysisLogs(prev => [...prev, step.log]);
        if (step.progress === 100) {
          setIsAnalyzing(false);
          // Insert the discovered vulnerability based on the filename
          injectMockVulnerability(fileName);
        }
      }, step.delay);
    });
  };

  const injectMockVulnerability = (fileName) => {
    let newVulns = [];
    if (fileName.includes("nxlog")) {
      newVulns = [
        {
          cve: "CVE-2024-8891",
          title: "NXLog Local Log Injection",
          package: "nxlog-agent-v2.1.msi",
          staticSeverity: 6.2,
          reachability: "ACTIVE_EXPOSURE",
          reachabilityScore: 5.4,
          port: 514,
          path: "/Program Files/nxlog/nxlog.exe",
          description: "Unsanitized CRLF sequences in incoming event streams allow local unprivileged agents to inject arbitrary lines into audit trails.",
          analysis: "Mythos analysis: Exploit is ACTIVE. NXLog port 514 syslog daemon processes raw UDP input streams without sanitization filters.",
          patchCode: "# Synthesized Configuration Fix:\n# Filter CRLF inputs\n<Input in>\n    Module im_msvistalog\n    Exec $Message = replace($Message, '\\r\\n', ' ');\n</Input>",
          binaryName: fileName,
          isRiskAccepted: false
        },
        {
          cve: "CVE-2024-UNKNOWN-1",
          title: "Unknown Buffer Overflow in zlib module",
          package: "zlib.dll",
          staticSeverity: 8.4,
          reachability: "ACTIVE_EXPOSURE",
          reachabilityScore: 7.9,
          port: 0,
          path: "/Program Files/nxlog/zlib.dll",
          description: "Undocumented boundary handling issue in custom compression headers allows arbitrary memory writes inside the compression module.",
          analysis: "Mythos analysis: Deep code structure pattern recognition found dangerous strcpy in legacy DLL code blocks. Risk level: High.",
          patchCode: "# Recommended Action: Upgrade binary to patched branch immediately, or block custom zlib compression streams in configurations.",
          binaryName: fileName,
          isRiskAccepted: false
        }
      ];
    } else if (fileName.includes("usecops")) {
      newVulns = [
        {
          cve: "CVE-2024-9902",
          title: "uSecOps Agent RCE via Web Interface",
          package: "usecops-daemon-v1.2.0.deb",
          staticSeverity: 9.6,
          reachability: "ACTIVE_EXPOSURE",
          reachabilityScore: 9.5,
          port: 443,
          path: "/usr/bin/secops-daemon",
          description: "Unauthenticated remote command injection via admin config socket parameters enables full takeover of active nodes.",
          analysis: "Mythos analysis: Exploit path is fully reachable. Remote port 443 is exposed to external routing and handles socket calls directly.",
          patchCode: "# Block local admin socket binding\nsecurity_control_admin_interface_only_local=true\niptables -A INPUT -p tcp --dport 443 -j ACCEPT",
          binaryName: fileName,
          isRiskAccepted: false
        }
      ];
    } else {
      newVulns = [
        {
          cve: "CVE-2023-40595",
          title: "Splunk Forwarder Insecure DLL Loading",
          package: "splunkforwarder-9.2.0.rpm",
          staticSeverity: 7.2,
          reachability: "ACTIVE_EXPOSURE",
          reachabilityScore: 3.1,
          port: 9997,
          path: "/opt/splunk/bin/splunkd",
          description: "A local path validation bypass allows administrators to inject malicious libraries into the forwarder execution environment.",
          analysis: "Mythos analysis: Low active risk as execution path requires local administrator path control. Reachability score minimized.",
          patchCode: "# Enforce read-only configuration directories\nchmod 755 /opt/splunk/etc\nchown root:root /opt/splunk/etc",
          binaryName: fileName,
          isRiskAccepted: false
        },
        {
          cve: "CVE-2024-UNKNOWN-2",
          title: "Unknown Library Bug in OpenSSL Parsing",
          package: "libcrypto.so.1.1.1",
          staticSeverity: 3.8,
          reachability: "ACTIVE_EXPOSURE",
          reachabilityScore: 1.0,
          port: 0,
          path: "/opt/splunk/lib/libcrypto.so.1.1.1",
          description: "Minor assertion failure during custom client hello parsing causes process restart loop but no direct memory exposure.",
          analysis: "Mythos analysis: Low risk crash anomaly detected via static signature pattern matching.",
          patchCode: "# No local configuration fix. Standard unprivileged daemon fallback rules will auto-restart process.",
          binaryName: fileName,
          isRiskAccepted: false
        }
      ];
    }

    const updated = [...vulnerabilities, ...newVulns];
    setVulnerabilities(updated);
    saveToStorage(updated, approvedOTA);
    setSelectedVuln(newVulns[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      startAnalysis(file.name);
    }
  };

  const selectPresetBinary = (name) => {
    startAnalysis(name);
  };

  // Severity filtering logic
  const getSeverityCategory = (severity) => {
    if (severity >= 9.0) return "CRITICAL";
    if (severity >= 7.0) return "HIGH";
    if (severity >= 4.0) return "MEDIUM";
    return "LOW";
  };

  const filteredVulns = vulnerabilities.filter(v => {
    if (activeTab === "ALL") return true;
    return getSeverityCategory(v.staticSeverity) === activeTab;
  });

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Mythos AI & Vulnerability Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload binary packages, audit static & runtime dependencies, identify CVEs/unknown library flaws, and push safe versions to unprivileged OTA update services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Upload box and vulnerability table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Binary Upload simulation box */}
          <div className="glass-panel p-6 border-slate-200 border relative">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Binary Audit & Scanner</h2>
            
            {/* Hidden Input file selector */}
            <input 
              type="file" 
              id="binary-upload-input" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  startAnalysis(e.target.files[0].name);
                }
              }} 
            />

            {isAnalyzing ? (
              <div className="border-2 border-dashed border-violet-300 rounded-lg p-8 bg-violet-50/20 flex flex-col items-center justify-center space-y-4 min-h-[160px]">
                <div className="flex items-center gap-3">
                  <span className="animate-spin text-2xl">🌀</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">Analyzing Binary: {uploadedBinary} ({analysisProgress}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-md">
                  <div className="bg-violet-600 h-full transition-all duration-300" style={{ width: `${analysisProgress}%` }}></div>
                </div>
                <div className="w-full max-h-[80px] overflow-y-auto font-mono text-[10px] text-cyan-600 bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                  {analysisLogs.map((log, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span>&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("binary-upload-input").click()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all ${
                  dragActive ? "border-violet-600 bg-violet-50/50" : "border-slate-300 hover:border-violet-400 bg-slate-50/50"
                }`}
                style={{ cursor: "pointer" }}
              >
                <span className="text-4xl mb-2">📁</span>
                <p className="text-sm font-semibold text-slate-700 text-center">Drag & Drop Binary Package or Click to Select</p>
                <p className="text-xs text-slate-400 text-center mt-1">Accepts .msi, .deb, .rpm, .tar.gz (Agent Software/Enterprise Binaries)</p>
                
                {/* Preset Mock buttons */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => selectPresetBinary("nxlog-agent-v2.1.msi")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600 font-bold"
                  >
                    + nxlog-agent-v2.1.msi
                  </button>
                  <button 
                    onClick={() => selectPresetBinary("usecops-daemon-v1.2.0.deb")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600 font-bold"
                  >
                    + usecops-daemon-v1.2.0.deb
                  </button>
                  <button 
                    onClick={() => selectPresetBinary("splunkforwarder-9.2.0.rpm")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600 font-bold"
                  >
                    + splunkforwarder-9.2.0.rpm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vulnerability Table & Navigation */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800">Local Vulnerability Registry</h2>
              
              {/* Tab Category Selector */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono font-bold">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeTab === tab 
                        ? "bg-white text-violet-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredVulns.length > 0 ? (
                filteredVulns.map((vuln) => {
                  const isActive = vuln.reachability === "ACTIVE_EXPOSURE";
                  const isResolved = vuln.reachability === "RESOLVED";
                  
                  const reachBg = 
                    isResolved ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    isActive ? "bg-rose-50 text-rose-600 border-rose-200" : 
                    "bg-slate-50 text-slate-600 border-slate-200";

                  return (
                    <div
                      key={vuln.cve}
                      onClick={() => setSelectedVuln(vuln)}
                      className={`p-5 rounded-lg border cursor-pointer glass-panel ${
                        selectedVuln?.cve === vuln.cve ? "border-violet-500 bg-violet-50/60" : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-600">{vuln.cve}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${reachBg}`}>
                              {vuln.reachability}
                            </span>
                            {vuln.isRiskAccepted && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-mono font-bold">
                                RISK_ACCEPTED
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-800 mt-1">{vuln.title}</h3>
                          <p className="text-xs text-slate-500 font-mono">Affected package: {vuln.package} {vuln.binaryName && `(${vuln.binaryName})`}</p>
                        </div>

                        <div className="flex items-center gap-6 font-mono text-center shrink-0">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold">STATIC SEVERITY</span>
                            <span className={`text-sm font-bold ${
                              vuln.staticSeverity >= 9.0 ? "text-rose-600" :
                              vuln.staticSeverity >= 7.0 ? "text-orange-500" :
                              vuln.staticSeverity >= 4.0 ? "text-amber-500" :
                              "text-slate-500"
                            }`}>{vuln.staticSeverity.toFixed(1)}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-6">
                            <span className="text-[9px] text-slate-400 block font-bold">REACHABILITY SCORE</span>
                            <span className={`text-sm font-extrabold ${isResolved ? "text-emerald-600" : isActive ? "text-rose-600" : "text-slate-500"}`}>
                              {vuln.reachabilityScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 glass-panel border border-slate-200 rounded text-slate-500 text-sm font-mono">
                  No vulnerabilities discovered in this severity tab classification.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Selected Vulnerability Detail Panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[450px] flex flex-col justify-between border border-slate-200">
            {selectedVuln ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-600 font-bold">{selectedVuln.cve}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        selectedVuln.staticSeverity >= 9.0 ? "bg-rose-50 text-rose-600 border border-rose-200" :
                        selectedVuln.staticSeverity >= 7.0 ? "bg-orange-50 text-orange-600 border border-orange-200" :
                        "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}>{getSeverityCategory(selectedVuln.staticSeverity)} Severity</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mt-0.5">{selectedVuln.title}</h3>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    {selectedVuln.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Reachability Audit Analysis</span>
                    <p className="text-xs text-slate-700 leading-relaxed italic border-l-2 border-violet-500 pl-3">
                      {selectedVuln.analysis}
                    </p>
                  </div>

                  {selectedVuln.reachability !== "UNREACHABLE" && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Synthesized hotfix Patch</span>
                      <pre className="p-3 bg-[#0f172a] border border-slate-800 rounded font-mono text-[9px] text-cyan-300/90 overflow-x-auto whitespace-pre">
                        {selectedVuln.patchCode}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  
                  {/* Action buttons */}
                  {selectedVuln.reachability === "ACTIVE_EXPOSURE" && (
                    <button
                      onClick={() => handleApplyPatch(selectedVuln)}
                      disabled={isPatching}
                      className="w-full btn-glass btn-glass-success justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
                    >
                      {isPatching ? "⚡ Applying Dual-Signed Patch..." : "🛡️ Apply Synthesized Hotfix"}
                    </button>
                  )}

                  {/* Accept Risk & Promote to OTA Upgrade Server */}
                  {!selectedVuln.isRiskAccepted ? (
                    <button
                      onClick={() => handleAcceptRiskAndApprove(selectedVuln)}
                      className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider font-mono rounded transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                    >
                      ⚠️ Accept Risk & Approve for OTA
                    </button>
                  ) : (
                    <div className="text-center text-xs font-mono font-bold text-amber-700 uppercase py-2 bg-amber-50 border border-amber-200 rounded">
                      🤝 Risk Accepted & Approved for OTA
                    </div>
                  )}

                  {selectedVuln.reachability === "RESOLVED" && (
                    <div className="text-center text-xs font-mono font-bold text-emerald-600 uppercase py-2 bg-emerald-50 border border-emerald-200 rounded">
                      ✅ Vulnerability Patched
                    </div>
                  )}

                  {selectedVuln.reachability === "UNREACHABLE" && (
                    <div className="text-center text-xs font-mono font-bold text-slate-500 uppercase py-2 bg-slate-50 border border-slate-200 rounded">
                      🔒 No Exposure Patch Required
                    </div>
                  )}

                  {patchLogs.length > 0 && (
                    <div className="bg-[#0f172a] p-3 rounded border border-slate-800 text-[10px] font-mono text-cyan-400 space-y-1.5 max-h-[120px] overflow-y-auto">
                      {patchLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <span>&gt;</span>
                          <span className={idx === patchLogs.length - 1 ? "text-emerald-300" : ""}>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <span className="text-4xl mb-4">🧠</span>
                <h3 className="text-sm font-bold text-slate-600">Exploit Reachability Details</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Select a vulnerability to verify active path reachability and review AI-synthesized patches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
