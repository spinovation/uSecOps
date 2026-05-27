"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Dynamic alerts list for simulation
  const [alarms, setAlarms] = useState([
    { id: 1, text: "mTLS Handshake Complete (Tanium Endpoint)", type: "success" },
    { id: 2, text: "ClickHouse Partition Aged out successfully (180 days)", type: "info" }
  ]);
  
  const navItems = [
    { name: "SIEM Dashboard", path: "/", icon: "📊" },
    { name: "Virtual Entity Demux", path: "/entities", icon: "🌐" },
    { name: "Mythos AI & Vulnerability", path: "/vulnerabilities", icon: "🧠" },
    { name: "OTA Upgrade & Canary", path: "/upgrades", icon: "🛡️" },
    { name: "SOAR Case Ticketing", path: "/cases", icon: "🎟️" },
    { name: "Appliance Self-Audit", path: "/audit", icon: "🔌" }
  ];

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <title>uSecOps Appliance Admin Console</title>
        <meta name="description" content="Next-Gen Zero-Ingestion On-Premise Air-Gapped SecOps Console" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#020205] text-[#f1f3f9] font-sans antialiased overflow-hidden flex">
        {/* Sidebar Container */}
        <aside className="w-80 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,12,0.6)] backdrop-blur-2xl flex flex-col h-screen shrink-0 z-30 select-none">
          {/* Brand Logo & Strategic Slogan */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                uSecOps
              </span>
              <span className="text-[10px] font-mono border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded uppercase tracking-widest bg-cyan-950/20">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-400/60 mt-2 tracking-wide uppercase">
              Zero-Ingestion Air-Gapped SOC
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? "bg-violet-950/40 text-violet-200 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Platform Status Monitors */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-black/20 space-y-3 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>Hypervisor Engine:</span>
              <span className="text-cyan-400 font-semibold uppercase tracking-wider">KVM / ESXi</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>mTLS v1.3 Pipeline:</span>
              <div className="flex items-center gap-1.5">
                <span className="pulse-indicator pulse-success"></span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Local LLM (vLLM):</span>
              <span className="text-violet-400">ONLINE (Mythos-7B)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>ClickHouse OLAP:</span>
              <span className="text-cyan-400">6 MARTS MOUNTED</span>
            </div>
          </div>
        </aside>

        {/* Right Console Shell */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Glass Header */}
          <header className="h-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,10,0.3)] backdrop-blur-xl flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-indicator pulse-success"></div>
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                SYSTEM STATS OPERATIONAL
              </span>
            </div>

            {/* Admin Profile & Active Alarms */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800 font-mono text-xs text-slate-300">
                <span className="text-violet-400 font-semibold">ROLE:</span>
                <span>SEC-ADMINISTRATOR</span>
              </div>
              <div className="text-slate-400 text-xs font-mono">
                SEC-LOCK: <span className="text-emerald-400 font-semibold">AIR-GAPPED</span>
              </div>
            </div>
          </header>

          {/* Dynamic Page Scroll Container */}
          <main className="flex-1 overflow-y-auto p-8 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
