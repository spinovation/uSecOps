"use client";

import { useState } from "react";

export default function EntityDemux() {
  const [selectedEntity, setSelectedEntity] = useState(null);

  const virtualEntities = [
    {
      id: "KVM:4a12c984-90a1-4322-998f-01127d14210a:AppInstance-A",
      hypervisor: "KVM (Proxmox/RedHat)",
      uuid: "4a12c984-90a1-4322-998f-01127d14210a",
      appId: "AppInstance-A (Apache Server)",
      ip: "10.100.12.44",
      status: "STABLE",
      logsProcessed: "245,180",
      threatRating: "LOW"
    },
    {
      id: "KVM:4a12c984-90a1-4322-998f-01127d14210a:AppInstance-B",
      hypervisor: "KVM (Proxmox/RedHat)",
      uuid: "4a12c984-90a1-4322-998f-01127d14210a",
      appId: "AppInstance-B (PostgreSQL Case DB)",
      ip: "10.100.12.45",
      status: "ATTACK_ATTEMPT",
      logsProcessed: "1,894,221",
      threatRating: "HIGH"
    },
    {
      id: "ESXi:f0f1882a-e274-4b5c-a55e-990a012e8412:AppInstance-C",
      hypervisor: "VMware ESXi Cluster",
      uuid: "f0f1882a-e274-4b5c-a55e-990a012e8412",
      appId: "AppInstance-C (Active Directory Controller)",
      ip: "10.101.40.2",
      status: "STABLE",
      logsProcessed: "8,419,252",
      threatRating: "MEDIUM"
    },
    {
      id: "HyperV:912fa84b-0104-e5e8-f99a-a82f14309ba8:AppInstance-D",
      hypervisor: "Microsoft Hyper-V Server",
      uuid: "912fa84b-0104-e5e8-f99a-a82f14309ba8",
      appId: "AppInstance-D (Legacy IBM System Adapter)",
      ip: "10.102.5.18",
      status: "COMPROMISED",
      logsProcessed: "84,210",
      threatRating: "CRITICAL"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Virtual Entity Demultiplexing Map
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Resolving log duplication across hypervisor infrastructures by mapping telemetry to static, isolated composite keys.
        </p>
      </div>

      {/* Concept Alert Banner */}
      <div className="glass-panel p-4 bg-violet-50 border border-violet-200 flex items-start gap-4">
        <span className="text-2xl mt-0.5">ℹ️</span>
        <div className="text-sm text-slate-700 space-y-1">
          <p className="font-semibold text-slate-800">The Virtual Entity Concept</p>
          <p>
            Traditional agents cluster logs per VM host, creating duplication when a single VM runs multiple distinct security containers. 
            uSecOps demultiplexes incoming streams by mapping them to an immutable 3-part composite key:
          </p>
          <div className="bg-slate-50 p-2.5 rounded font-mono text-cyan-700 mt-2 inline-block border border-slate-200">
            Virtual Entity ID = [Hypervisor Type] + [Host VM UUID] + [Application Instance ID]
          </div>
        </div>
      </div>

      {/* Node Matrix and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity Node Selector */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Active Virtual Host Clusters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {virtualEntities.map((entity) => {
              const ratingColor = 
                entity.threatRating === "CRITICAL" ? "border-rose-200 bg-rose-50 hover:border-rose-500 text-rose-700" :
                entity.threatRating === "HIGH" ? "border-amber-200 bg-amber-50 hover:border-amber-500 text-amber-700" :
                "border-slate-200 bg-slate-50 hover:border-violet-500/50 text-slate-800";

              return (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className={`p-5 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col justify-between ${ratingColor}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-cyan-600 font-semibold">{entity.hypervisor}</span>
                      <span className="font-bold">{entity.status}</span>
                    </div>
                    <h3 className="text-sm font-bold truncate mt-2">{entity.appId}</h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] font-mono text-slate-500">
                    <span>IP: {entity.ip}</span>
                    <span className="text-slate-600">{entity.logsProcessed} logs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Entity Context Display */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[380px] flex flex-col justify-between">
            {selectedEntity ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Composite Key Details</h3>
                  <p className="text-xs text-slate-500 mt-1">Decoded payload parameters</p>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Hypervisor Cluster</span>
                    <span className="text-slate-800 font-semibold text-sm">{selectedEntity.hypervisor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">VM UUID (Hardware)</span>
                    <span className="text-cyan-700 font-semibold break-all text-xs">{selectedEntity.uuid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Application Instance scope</span>
                    <span className="text-violet-600 font-semibold text-sm">{selectedEntity.appId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">IP Address</span>
                    <span className="text-slate-800 font-semibold">{selectedEntity.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Threat Severity Rating</span>
                    <span className={`font-semibold ${selectedEntity.threatRating === "CRITICAL" ? "text-rose-600" : "text-amber-600"}`}>
                      {selectedEntity.threatRating}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[10px] text-cyan-700 break-all select-all">
                  Composite Key:<br/>{selectedEntity.id}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-4xl mb-4">🔍</span>
                <h3 className="text-sm font-bold text-slate-600">Select an Entity</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Click on any virtual host cluster to decode its composite log-demultiplexing registry key.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
