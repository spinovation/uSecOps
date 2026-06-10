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
        { name: "Overview Dashboard", path: "/", icon: "dashboard" },
        { name: "Incident Cases (SOAR)", path: "/cases", icon: "cases" },
        { name: "Virtual Entity Demux", path: "/entities", icon: "entities" }
      ]
    },
    {
      title: "Analytics & Detections",
      items: [
        { name: "Mythos AI & Vulns", path: "/vulnerabilities", icon: "ai" }
      ]
    },
    {
      title: "Appliance Management",
      items: [
        { name: "OTA Upgrade Server", path: "/upgrades", icon: "upgrades" },
        { name: "Self-Auditing Log", path: "/audit", icon: "audit" }
      ]
    }
  ];

  const renderIcon = (iconType, isActive) => {
    const colorClass = isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600";
    
    switch (iconType) {
      case "dashboard":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "cases":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "entities":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case "ai":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "upgrades":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      case "audit":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

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
      <body className="min-h-screen bg-[#f4f6f9] text-[#0f172a] font-sans antialiased overflow-hidden flex">
        {/* Microsoft Sentinel Style Sidebar in Light Theme */}
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0 z-30 select-none">
          {/* Brand header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  uSecOps
                </span>
                <span className="text-[9px] font-mono border border-sky-500/30 text-sky-600 px-1.5 py-0.2 rounded uppercase bg-sky-50 font-bold">
                  SEC-OS
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider font-bold">
                Consolidated Security Console
              </p>
            </div>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navigationSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-sky-50 text-sky-600 border-l-2 border-sky-500"
                            : "text-slate-600 hover:text-black hover:bg-slate-50"
                        }`}
                      >
                        {renderIcon(item.icon, isActive)}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Appliance Status */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center text-slate-500">
              <span>Security State:</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider">AIR-GAPPED</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Consensus Quorum:</span>
              <span className="text-sky-600 font-bold">3/3 ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Right Workspace Shell */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header - Google Chronicle style Search Bar */}
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-20">
            {/* Center: Global Google Chronicle search bar */}
            <form onSubmit={handleSearchSubmit} className="chronicle-search-container">
              <span className="absolute left-4 top-2.5 text-slate-400 text-sm">🔍</span>
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>ROLE: ADMIN_SOC_LEAD</span>
              </div>
            </div>
          </header>

          {/* Page Viewport */}
          <main className="flex-1 overflow-y-auto p-8 relative bg-[#f4f6f9]">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
