"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const navigationSections = [
    {
      title: "Operations",
      items: [
        { name: "Overview Dashboard", path: "/", icon: "📊" },
        { name: "Incident Cases (SOAR)", path: "/cases", icon: "🎟️" },
        { name: "Virtual Entity Demux", path: "/entities", icon: "🌐" }
      ]
    },
    {
      title: "Analytics & Detections",
      items: [
        { name: "Mythos AI & Vulns", path: "/vulnerabilities", icon: "🧠" }
      ]
    },
    {
      title: "Appliance Management",
      items: [
        { name: "OTA Upgrade Server", path: "/upgrades", icon: "🛡️" },
        { name: "Self-Auditing Log", path: "/audit", icon: "🔌" }
      ]
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    alert(`Google SecOps Index Query: Searching all telemetry and entities for "${searchQuery}"...`);
    setSearchQuery("");
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <title>uSecOps - Enterprise Security Console</title>
        <meta name="description" content="Sentinel-Chronicle Hybrid Air-Gapped SecOps Console" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#08090d] text-[#f1f3f9] font-sans antialiased overflow-hidden flex">
        {/* Microsoft Sentinel Style Sidebar */}
        <aside className="w-72 border-r border-[rgba(255,255,255,0.05)] bg-[#0d0f14] flex flex-col h-screen shrink-0 z-30 select-none">
          {/* Brand header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  uSecOps
                </span>
                <span className="text-[9px] font-mono border border-sky-500/20 text-sky-400 px-1 py-0.2 rounded uppercase bg-sky-950/15">
                  SEC-OS
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                Consolidated Security Console
              </p>
            </div>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navigationSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-sky-500/8 text-sky-400 border-l-2 border-sky-400"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/2"
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Appliance Status */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0a0b0e] space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center text-slate-500">
              <span>Security State:</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider">AIR-GAPPED</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Consensus Quorum:</span>
              <span className="text-sky-400">3/3 ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Right Workspace Shell */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header - Google Chronicle style Search Bar */}
          <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0d0f14] flex items-center justify-between px-8 z-20">
            {/* Center: Global Google Chronicle search bar */}
            <form onSubmit={handleSearchSubmit} className="chronicle-search-container">
              <span className="absolute left-4 top-2.5 text-slate-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search raw logs, assets, IP addresses, domains, or virtual entity UUIDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="chronicle-search-input"
              />
            </form>

            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#13161c] border border-slate-800 text-[10px] font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>ROLE: ADMIN_SOC_LEAD</span>
              </div>
            </div>
          </header>

          {/* Page Viewport */}
          <main className="flex-1 overflow-y-auto p-8 relative bg-[#08090d]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
