"use client";

import { useState } from "react";

export default function Settings() {
  // Subdomain provisioner states
  const [companyPrefix, setCompanyPrefix] = useState("");
  const [subdomainsList, setSubdomainsList] = useState([
    { prefix: "spinovation", url: "https://spinovation.usecops.com", port: 5000, status: "ACTIVE" },
    { prefix: "alphaforce", url: "https://alphaforce.usecops.com", port: 5001, status: "ACTIVE" }
  ]);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // RBAC Role State
  const [activeRole, setActiveRole] = useState("super_admin");

  const rolesConfig = {
    super_admin: {
      title: "Super Administrator",
      description: "Holds global highest access level. Full capabilities including managing users, indexes, apps, and knowledge objects across all 4 modules, plus Break-Glass overrides.",
      modules: ["Module 1 (Core)", "Module 2 (Lakehouse)", "Module 3 (Patch)", "Module 4 (Archive)", "Break-Glass"]
    },
    module_admin: {
      title: "Module Administrator",
      description: "Confined to a single designated module. Holds highest level of access, including user management and local knowledge objects for that module only.",
      modules: ["Module 1 (Core) (Selective)", "Module 2 (Lakehouse) (Selective)"]
    },
    power_user: {
      title: "Power User",
      description: "Limited query access across resources in all modules. Can edit shared objects, create custom alerts, tag logs, and manage local knowledge objects.",
      modules: ["Module 1 (Query)", "Module 2 (Query)", "Module 4 (Query)"]
    },
    regular_user: {
      title: "Regular User",
      description: "Standard read-only user access. Runs search queries, edits personal saved searches, and views dashboard reports.",
      modules: ["Module 1 (Dashboard Read-only)", "Module 2 (Dashboard Read-only)"]
    },
    can_delete: {
      title: "Can Delete Operator",
      description: "Specifically authorized privilege role. Grants capabilities to purge events and logs by keyword using the 'delete' search command operator.",
      modules: ["Log Deletion / Purging Tools"]
    }
  };

  const handleProvisionSubdomain = () => {
    if (!companyPrefix) {
      alert("Please enter a valid company prefix name!");
      return;
    }

    setIsProvisioning(true);
    const nextPort = subdomainsList.length > 0 ? subdomainsList[subdomainsList.length - 1].port + 1 : 5000;
    const cleanPrefix = companyPrefix.toLowerCase().replace(/[^a-z0-9]/g, "");

    setTimeout(() => {
      const newTenant = {
        prefix: cleanPrefix,
        url: `https://${cleanPrefix}.usecops.com`,
        port: nextPort,
        status: "ACTIVE"
      };

      setSubdomainsList(prev => [...prev, newTenant]);
      setCompanyPrefix("");
      setIsProvisioning(false);
      alert(`Provisioning successful! Link generated: ${newTenant.url} mapped to Docker isolated Port ${newTenant.port} (Nginx tenant_ports.map reloaded).`);
    }, 1500);
  };

  return (
    <div className="space-y-8" style={{ padding: "12px 24px" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Module 1: Multi-Tenant Settings & Roles
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure single sign-on (SSO), multi-factor authentication (MFA), dynamic subdomain wildcard routing, and role-based permissions matrix.
        </p>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Multi-tenancy & SSO */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subdomain Provisioning & Port Mappings */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Dynamic Subdomain Tenant Provisioner</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[9px] uppercase font-bold">Company Subdomain Prefix</label>
                  <input
                    type="text"
                    placeholder="e.g. acmecorp"
                    value={companyPrefix}
                    onChange={(e) => setCompanyPrefix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-violet-500 text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Generates subdomain: [prefix].usecops.com</span>
                </div>

                <button
                  onClick={handleProvisionSubdomain}
                  disabled={isProvisioning}
                  className="w-full btn-glass btn-glass-success justify-center text-xs py-2 font-bold uppercase tracking-wider"
                >
                  {isProvisioning ? "Provisioning Docker Environment..." : "🚀 Provision Client Tenant Space"}
                </button>
              </div>

              {/* Subdomains Port Map Grid */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Nginx Maps (tenant_ports.map)</span>
                <div className="border border-slate-200 rounded-lg max-h-[160px] overflow-y-auto divide-y divide-slate-100 bg-slate-50">
                  {subdomainsList.map((tenant) => (
                    <div key={tenant.prefix} className="p-3 flex justify-between items-center hover:bg-slate-100/50">
                      <div>
                        <a 
                          href={tenant.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-violet-650 hover:underline"
                        >
                          {tenant.prefix}.usecops.com
                        </a>
                        <div className="text-[10px] text-slate-400">Mapped Port: localhost:{tenant.port}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold">
                        {tenant.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wildcard DNS & SSL Configurations */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Automated Proxy & Wildcard Certificate Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              
              <div className="p-3 bg-slate-50 border border-slate-250 rounded-lg space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Wildcard DNS A-Record</span>
                <span className="font-bold text-slate-800">*.usecops.com</span>
                <span className="text-[10px] text-emerald-600 block">● ACTIVE (Cloudflare proxy)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-250 rounded-lg space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Wildcard SSL (DNS-01 certbot)</span>
                <span className="font-bold text-slate-800">Valid: *.usecops.com</span>
                <span className="text-[10px] text-emerald-600 block">● SECURE (90 days remaining)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-250 rounded-lg space-y-1">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Docker Port Isolation</span>
                <span className="font-bold text-slate-800">127.0.0.1 Binding Only</span>
                <span className="text-[10px] text-violet-600 block">● ENFORCED (Bypass prevented)</span>
              </div>

            </div>
          </div>

          {/* SSO & MFA Setup Panel */}
          <div className="glass-panel p-6 border border-slate-200 bg-white space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">SSO (SAML 2.0 / OIDC) & Multi-Factor Config</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[9px] uppercase font-bold">Identity Provider Metadata URL</label>
                  <input
                    type="text"
                    defaultValue="https://okta.spino.internal/saml/metadata"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[9px] uppercase font-bold">MFA Auth Protocol</label>
                  <select className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700">
                    <option>SAML 2.0 + TOTP Auth</option>
                    <option>OIDC + Hardware FIDO2 Security Keys</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-center space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Consolidated Security Rule</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Activating SSO disables local file password stores. Users are redirected to the company-prefixed subdomain identity provider endpoints.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" defaultChecked className="rounded text-violet-600 focus:ring-violet-500" />
                  <span className="text-[11px] font-bold text-slate-700">Enforce Multi-Factor (MFA) Challenges</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - RBAC Roles Matrix */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-8 min-h-[450px] border border-slate-200 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">RBAC Role Matrix</h3>
                <p className="text-xs text-slate-400">Alter console UI capability profiles</p>
              </div>

              {/* Selector */}
              <div className="space-y-2">
                {Object.keys(rolesConfig).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveRole(key)}
                    className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition-all ${
                      activeRole === key ? "border-violet-500 bg-violet-50/50 font-bold" : "border-slate-200 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <span>{rolesConfig[key].title}</span>
                  </button>
                ))}
              </div>

              {/* Display config */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 font-mono text-xs text-slate-700">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Role Target Details</span>
                  <p className="text-[11px] leading-relaxed mt-1 text-slate-600">{rolesConfig[activeRole].description}</p>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Authorized Domains</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {rolesConfig[activeRole].modules.map((mod, i) => (
                      <span key={i} className="px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-600 rounded text-[9px] font-bold">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert(`Active Session Override: Swapped user role access profile to: ${rolesConfig[activeRole].title}`)}
              className="w-full mt-6 btn-glass justify-center text-xs py-2 font-mono font-bold uppercase"
            >
              Apply Active Session Override
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
