"use client";

import { useState } from "react";

export default function Vulnerabilities() {
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isPatching, setIsPatching] = useState(false);
  const [patchLogs, setPatchLogs] = useState([]);

  const vulnerabilities = [
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
      patchCode: "# Mythos-Synthesized WAF & SSH Configuration Patch\n# Applied completely offline via Local LLM\n\n# 1. Update sshd configuration to drop dynamic preload loaders\nexport LD_PROFILE=\nexport LD_BIND_NOW=1\n\n# 2. Block vulnerable Port 22 connections outside management subnets\niptables -A INPUT -p tcp --dport 22 -s 10.100.0.0/16 -j ACCEPT\niptables -A INPUT -p tcp --dport 22 -j DROP\n\n# 3. Trigger immediate fallback container downgrade\napt-get install --allow-downgrades liblzma5=5.4.1-0.2 -y"
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
      patchCode: "# Mythos-Synthesized Patch\n# Status: Unnecessary (Exploit Unreachable on current platform CPU revision)"
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
      patchCode: "# Mythos-Synthesized Log4j Hotfix\n# 1. Inject JVM system property flag into application configurations\nexport JAVA_OPTS=\"$JAVA_OPTS -Dlog4j2.formatMsgNoLookups=true\"\n\n# 2. Strip JndiLookup.class from existing archive binaries\nzip -q -d /var/lib/tomcat9/webapps/axis/WEB-INF/lib/log4j-core-2.14.1.jar org/apache/logging/log4j/core/lookup/JndiLookup.class\n\n# 3. Reload application services\nsystemctl restart tomcat9"
    }
  ];

  const handleApplyPatch = (vuln) => {
    setIsPatching(true);
    setPatchLogs(["Initialising gRPC Dual-Signature Control Handshake...", "Validating cryptographic developer signature...", "Validating local administrator authorization..."]);
    
    setTimeout(() => {
      setPatchLogs(prev => [...prev, "Signing verified! Sending payload to agent...", "Executing hotfix script on remote host...", "Verifying process status post-execution..."]);
    }, 1500);

    setTimeout(() => {
      setPatchLogs(prev => [...prev, "Patch applied! Downgraded package libraries verified.", "Status: SECURE (Reachability Rating -> 0.0)"]);
      setIsPatching(false);
      vuln.reachability = "RESOLVED";
      vuln.reachabilityScore = 0.0;
    }, 3500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Mythos AI & Vulnerability Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Local, self-hosted LLM defending assets by mapping active exploit reachability and synthesizing configuration hotfixes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vulnerability Table list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Local Vulnerability Registry</h2>
          <div className="space-y-4">
            {vulnerabilities.map((vuln) => {
              const isActive = vuln.reachability === "ACTIVE_EXPOSURE";
              const isResolved = vuln.reachability === "RESOLVED";
              
              const reachBg = 
                isResolved ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/30" :
                isActive ? "bg-rose-950/20 text-rose-400 border-rose-500/30" : 
                "bg-slate-900/30 text-slate-400 border-slate-800";

              return (
                <div
                  key={vuln.cve}
                  onClick={() => setSelectedVuln(vuln)}
                  className={`p-5 rounded-lg border cursor-pointer glass-panel ${
                    selectedVuln?.cve === vuln.cve ? "border-violet-500 bg-violet-950/10" : "border-slate-800"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{vuln.cve}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${reachBg}`}>
                          {vuln.reachability}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 mt-1">{vuln.title}</h3>
                      <p className="text-xs text-slate-400 font-mono">Affected package: {vuln.package}</p>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-center shrink-0">
                      <div>
                        <span className="text-[9px] text-slate-500 block">STATIC SEVERITY</span>
                        <span className="text-sm font-bold text-slate-300">{vuln.staticSeverity.toFixed(1)}</span>
                      </div>
                      <div className="border-l border-slate-800 pl-6">
                        <span className="text-[9px] text-slate-500 block">REACHABILITY SCORE</span>
                        <span className={`text-sm font-extrabold ${isResolved ? "text-emerald-400" : isActive ? "text-rose-400" : "text-slate-400"}`}>
                          {vuln.reachabilityScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Vulnerability Detail Panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[450px] flex flex-col justify-between">
            {selectedVuln ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedVuln.cve}</span>
                    <h3 className="text-lg font-bold text-slate-200 mt-0.5">{selectedVuln.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded border border-slate-900">
                    {selectedVuln.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Reachability Audit Analysis</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-violet-500 pl-3">
                      {selectedVuln.analysis}
                    </p>
                  </div>

                  {selectedVuln.reachability !== "UNREACHABLE" && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Synthesized hotfix Patch</span>
                      <pre className="p-3 bg-black/60 border border-slate-900 rounded font-mono text-[9px] text-cyan-300/90 overflow-x-auto whitespace-pre">
                        {selectedVuln.patchCode}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-4">
                  {selectedVuln.reachability === "ACTIVE_EXPOSURE" && (
                    <button
                      onClick={() => handleApplyPatch(selectedVuln)}
                      disabled={isPatching}
                      className="w-full btn-glass btn-glass-success justify-center text-xs py-2.5 font-bold uppercase tracking-wider font-mono"
                    >
                      {isPatching ? "⚡ Applying Dual-Signed Patch..." : "🛡️ Apply Synthesized Hotfix"}
                    </button>
                  )}

                  {selectedVuln.reachability === "RESOLVED" && (
                    <div className="text-center text-xs font-mono font-bold text-emerald-400 uppercase py-2 bg-emerald-950/20 border border-emerald-500/30 rounded">
                      ✅ Vulnerability Patched
                    </div>
                  )}

                  {selectedVuln.reachability === "UNREACHABLE" && (
                    <div className="text-center text-xs font-mono font-bold text-slate-400 uppercase py-2 bg-slate-900/30 border border-slate-800 rounded">
                      🔒 No Exposure Patch Required
                    </div>
                  )}

                  {patchLogs.length > 0 && (
                    <div className="bg-black/50 p-3 rounded border border-slate-900 text-[10px] font-mono text-cyan-400 space-y-1.5 max-h-[120px] overflow-y-auto">
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
                <h3 className="text-sm font-bold text-slate-300">Exploit Reachability Details</h3>
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
