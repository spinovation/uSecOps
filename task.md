# Project Task Checklist – Unified SecOps Platform

This living document tracks our execution progress across the four primary modules of our AI-Native, Air-Gapped Unified SecOps Platform.

---

## Module 1: Unified SecOps Software Core (Lakehouse, SIEM, SOAR, UEBA, TIP, Dashboards)

- [ ] **1.1 Cross-Cloud Lakehouse & Ingestion Setup**
  - [ ] Standardize the unified telemetry JSON/Protobuf schemas mapping.
  - [ ] Establish OTel collector endpoints to receive incoming logs.
  - [ ] Design and initialize the six **Provisioned-by-Default Data Mart** tables in ClickHouse:
    - [ ] `Legacy Telemetry Mart` (structured for `LegacyTel` adapter outputs)
    - [ ] `Windows Telemetry Mart` (optimized for AD, Event Logs, and Sysmon)
    - [ ] `Linux Telemetry Mart` (structured for Syslog and eBPF kernel traces)
    - [ ] `Firewall Telemetry Mart` (optimized for multi-tenant firewall flows)
    - [ ] `Proxy Telemetry Mart` (optimized for egress proxy and DNS requests)
    - [ ] `Identity & Governance Mart` (structured for SSO, MFA, and SailPoint/Saviynt IGA)
  - [ ] Implement the **Dynamic Data Mart Provisioning Engine**:
    - [ ] Build the Admin Console API to dynamically Add (Register) and Remove (Deregister) custom technology data marts.
    - [ ] Code the ClickHouse storage manager to dynamically create/drop partition tables on-the-fly.
    - [ ] Develop the OTel configuration engine to compile and hot-reload stream routing filters in memory without packet drops.
  - [ ] Implement the **Virtual Entity Demultiplexing & VM-Application Instance Mapping**:
    - [ ] Design the composite entity registration parser (`Virtual Entity ID = [Hypervisor Type] + [Host VM UUID] + [Application Instance ID]`).
    - [ ] Write ClickHouse demultiplexing query logic to separate single VM logs across multiple virtual entity scopes.
    - [ ] Design the interactive node mapper to represent single VMs hosting multiple apps as distinct, isolated virtual host dashboard nodes.

- [ ] **1.2 Real-time Detection, OOTB Use Cases & UEBA Engine**
  - [ ] Integrate Sigma-rule parsing and compilation pipelines in ClickHouse/Python.
  - [ ] Develop YARA-L matching logic for behavioral data flows.
  - [ ] Build UEBA anomaly baseline profiling engines for identity and host telemetry.
  - [ ] Implement Out-of-the-Box (OOTB) MITRE ATT&CK correlation rules across specialized Data Marts (Active Directory, Proxy, Firewall, Workday, Tanium, Oracle, SQL, Autobahn, Terminal Emulation):
    - [ ] `Account Takeover (ATO)` (T1078 - Valid Accounts geovelocity impossible travel & unmanaged hosts)
    - [ ] `Brute Force` (T1110 - Single target logons spike detection)
    - [ ] `Password Spraying` (T1110 - Multi-account same password spray detection)
    - [ ] `Short-lived User Account` (T1136/T1098 - Account creation followed closely by deletion backdoor checks)
    - [ ] `User Login after Offboarding` (T1078 - Active Directory logins matching terminated status in Workday HR)
    - [ ] `Multiple Locked User Accounts & Suspicious Lockout` (T1110/T1531 - Distributed account lockout audits)

- [ ] **1.3 Native Ticketing & Case Management System**
  - [ ] Develop the incident ticket database models (States: New, Assigned, Under Investigation, Resolved).
  - [ ] Build the real-time collaboration canvas backend supporting evidence pinning and analyst timelines.
  - [ ] Design a dynamic user interface for alert triage and incident grouping.

- [ ] **1.4 SOAR Playbook Orchestration Engine**
  - [ ] Implement the visual drag-and-drop playbook workflow parser.
  - [ ] Code automated containment connectors (e.g., calling endpoint agent firewall controls, Active Directory accounts disablement, network routing modifications).
  - [ ] Integrate human-in-the-loop supervisor approval gates for high-impact playbook steps.

- [ ] **1.5 Air-Gapped Local AI Copilot**
  - [ ] Provision and optimize the local GPU inference container (Ollama or vLLM).
  - [ ] Configure local model serving (Llama-3-8B-Instruct / Mistral-7B-Instruct).
  - [ ] Implement the **8-Step Autonomous AI Agent investigation loop**:
    - [ ] Alert reading, Log pulling, TIP matching, Identity/UEBA auditing, MITRE mapping, Blast radius calculations, Containment recommendations, and approved Playbook execution.
  - [ ] Build automated false-positive verification and ticket closure.

- [ ] **1.6 Dynamic PII Privacy & Access Control Pipeline**
  - [ ] Construct hashing and masking middleware at the data lake ingestion layer.
  - [ ] Develop a supervisor-approval ticket request workflow for raw PII access.
  - [ ] Code a background TTL daemon to automatically revoke PII clearance tokens and restore masking exactly 24 hours after approval.

- [x] **1.7 Main Console Dashboard UI**
  - [x] Implement a premium Next.js glassmorphism admin dashboard.
  - [x] Design visual metrics boards, alert flow lines, interactive node exposure maps, and the update/patch control UI.

- [ ] **1.8 Zero Trust & Identity Threat Detection (ITDR) Integration**
  - [ ] Configure the OTel receiver layer to enforce strict **mTLS v1.3 continuous authentication** checks for all incoming streams.
  - [ ] Develop dynamic authorization middleware rejecting control queries without active least-privilege tokens.
  - [ ] Program the **Just-in-Time (JIT) Entitlement Correlation Engine** connecting Data Mart queries to the Identity Governance Mart (SailPoint/Saviynt):
    - [ ] Compare database/application transaction requests against verified recertification status.
    - [ ] Auto-trigger SOAR playbook actions to disable credentials upon detecting expired/unapproved entitlements.
  - [ ] Implement the client-side binary validation checks executing dual-signature verification before software patches.

- [ ] **1.9 Appliance Self-Monitoring, Privilege & Break-Glass Auditing**
  - [ ] Develop GUI self-monitoring interceptors in the administrator Next.js console router and API Gateway.
  - [ ] Set up local `auditd` command and keystroke tracking on host OS serial/CLI shells.
  - [ ] Implement dynamic monitoring of systemd and container runtime daemon (Docker/K3s) API event streams.
  - [ ] Code the "Break-Glass" Emergency Bypass logins and PII unmasking override mechanisms.
  - [ ] Program the write-once local kernel-level immutable audit log partition.
  - [ ] Establish secure broadcast and streaming connections forwarding Break-Glass log streams directly to Module 4 Ceph object storage under WORM policy locks.

---

## Module 2: Lightweight Telemetry Agents

- [/] **2.1 Core Agent Architecture (C/Rust/Go)**
  - [/] Initialize the high-performance agent framework targeting Linux, Windows, and macOS.
  - [ ] Build the mutual TLS (mTLS) secure transport client, integrating with local, air-gapped PKI.
  - [/] Design an encrypted local disk spool queue to buffer logs during network disconnections.

- [/] **2.2 Platform-Specific Log & Hypervisor Collection Adapters**
  - [ ] Build the Windows Event Log and Sysmon collector.
  - [/] Develop the Linux Syslog, `auditd` monitor, and eBPF syscall telemetry hook.
  - [/] Develop the macOS Unified Logging System (ULS) and Endpoint Security Framework integration.
  - [/] Implement local system hypervisor environment auditing context:
    - [/] Code hypervisor detection filters for Type 1 (Bare-Metal e.g. ESXi, Hyper-V, KVM).
    - [/] Code hypervisor detection filters for Type 2 (Hosted e.g. VMware Workstation, VirtualBox, UTM).
    - [/] Map and attach the detected Hypervisor type to outgoing telemetry packets.

- [ ] **2.3 Expanded Application & Network Device Monitoring**
  - [ ] Develop local application monitor process hooks to trace core software processes and configurations.
  - [ ] Build local network device Syslog & SNMP Trap listeners to concentrate network hardware telemetry.

- [ ] **2.4 Legacy Systems Telemetry Innovation (`LegacyTel`)**
  - [ ] Integrate `LegacyTel` APIs (`https://github.com/spinovation/LegacyTel`).
  - [ ] Implement log parsers to map legacy AS/400 QAUDJRN journals, z/OS SMF records, and HPE NonStop EMS logs into standardized OTel telemetry JSON.

- [ ] **2.5 Agent Self-Protection & Configuration Hot-Reloading**
  - [ ] Develop file-integrity self-monitoring and process protection rules.
  - [ ] Implement memory-resident configuration reloading without restarting the agent daemon.

---

## Module 3: Patch & Deployment Server (with Vulnerability Scanner)

- [ ] **3.1 Centralized Control Plane Architecture**
  - [ ] Build the centralized Go-based Patch & Deployment microservice.
  - [ ] Establish secure, bi-directional gRPC control connections to all registered agents.

- [ ] **3.2 Air-Gapped Vulnerability Scanner (Mythos-Class AI Auditing)**
  - [ ] Build a local-agent module parser scanning endpoint configurations and library trees.
  - [ ] Connect the scanner to the self-hosted Local LLM to act as a **Mythos-class defensive security researcher**.
  - [ ] Implement **Exploit Reachability Analysis** by mapping open ports, active subnets, and memory-mapped process calls to prioritize active exposures over static CVE lists.
  - [ ] Develop the **Proactive Patch Synthesis Engine** utilizing the Local LLM to write configuration hotfixes or firewall rules for active vulnerabilities.
  - [ ] Expose dynamic reachability scores, AI-generated mitigations, and compliance metrics to the Main Console.

- [ ] **3.3 Secure Upgrade & Patch Management Engine**
  - [ ] Integrate the offline dual-signature cryptographic verification engine.
  - [ ] Build staged canary deployment orchestration (1% -> 10% -> 50% -> 100%).
  - [ ] Implement the automatic rollback and recovery daemon on endpoints to revert failed upgrades within 10 minutes.
  - [ ] Design active-passive (blue-green) self-patching systems for the deployment server itself.
  - [ ] Build the console API letting administrators trigger fleet-wide upgrades directly from the central dashboard.

---

## Module 4: Data Archive & Cold Storage Server

- [ ] **4.1 Lifecycle Data-Tiering Worker**
  - [ ] Build the cron-based worker to age partitioned data out of ClickHouse after 180 days.
  - [ ] Code the high-compression Apache Parquet formatting pipeline.

- [ ] **4.2 5-Year Cold Audit Repository**
  - [ ] Develop local object storage connections (Ceph, MinIO, or private S3) supporting compliance locks (WORM locks).
  - [ ] Ensure archived incident packages contain **both the alert summaries and all raw underlying telemetry events**.

- [ ] **4.3 Forensic Hydration & Replay Engine**
  - [ ] Develop the forensically sound data hydration tool to decompress and load chosen Parquet archives back into ClickHouse on demand.
  - [ ] Integrate in-place query federation tools (e.g., using DuckDB) to audit cold storage without full index restoration.

- [ ] **4.4 Appliance Virtualization Packaging & High Availability (HA) Integration**
  - [ ] Package the entire hardened OS and containerized application stack into enterprise appliance formats:
    - [ ] Build the VMware ESXi OVA/OVF template build scripts.
    - [ ] Build the Microsoft Hyper-V VHDX virtual hard disk templates.
    - [ ] Build the QCOW2 image configurations for KVM/OpenStack environments.
  - [ ] Implement and test the **4-vNIC Segmented Network Architecture**:
    - [ ] Configure virtual interface mapping for vNIC 0 (Ingestion), vNIC 1 (Control), vNIC 2 (Management), and vNIC 3 (Storage).
    - [ ] Verify separate network routes and iptables firewall rules enforcing strict segment isolation.
  - [ ] Deploy and validate the **Module-Specific HA Failover Matrix**:
    - [ ] Set up HAProxy / Keepalived Active-Active load balancing with Virtual IPs (VIP) for OTel ingestion collectors.
    - [ ] Configure ClickHouse Keeper and multi-master replication clusters for zero-query-loss storage HA.
    - [ ] Configure Active-Passive deployment server clusters utilizing shared virtual IP (VIP) and stateful gRPC reconnection.
    - [ ] Deploy Ceph Erasure-Coded ($3+2$) storage pools to ensure on-premises data healing.
