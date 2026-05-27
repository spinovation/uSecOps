# Unified SecOps Platform – Architecture & System Integration Specification

This document details the **System Architecture, Integration Pathways, and Sub-component Specifications** for the Unified SecOps Platform, bringing all four core modules into a single, cohesive, air-gapped system.

---

## 1. Connected System Architecture Diagram

```mermaid
graph LR
    %% Styling Definitions
    classDef m1 fill:#1e1e2f,stroke:#6c5ce7,stroke-width:2px,color:#ffffff;
    classDef m2 fill:#112233,stroke:#00b894,stroke-width:2px,color:#ffffff;
    classDef m3 fill:#2d1f3d,stroke:#fd79a8,stroke-width:2px,color:#ffffff;
    classDef m4 fill:#1f2d2d,stroke:#0984e3,stroke-width:2px,color:#ffffff;
    classDef nic fill:#2d3436,stroke:#dfe6e9,stroke-width:2px,color:#ffffff;

    %% MODULE 2: LIGHTWEIGHT AGENTS (Left-Aligned Source - External)
    subgraph M2["Module 2: Lightweight Agents"]
        AgentCore[Agent Core <br> Rust / Go Daemon]:::m2
        LocalSpool[Local Disk Spooler <br> Encrypted Buffer]:::m2
        Adapters[OS & Hypervisor Adapters <br> Windows, Linux, macOS, Type 1 & 2]:::m2
        LegacyTel[LegacyTel Bridge <br> AS/400, z/OS, Tandem]:::m2
        AppNetMon[App & Network Monitor <br> Process Hooks & Syslog/SNMP]:::m2
        
        Adapters --> AgentCore
        LegacyTel --> AgentCore
        AppNetMon --> AgentCore
        AgentCore <--> LocalSpool
    end

    %% APPLIANCE vNIC PORTS GATEWAY (Dedicated Parent Subgraph)
    subgraph vNICs["Appliance Segmented Interfaces"]
        vNIC0[vNIC 0: Ingestion Port <br> VLAN 100]:::nic
        vNIC1[vNIC 1: Control Port <br> VLAN 101]:::nic
        vNIC2[vNIC 2: Management Port <br> VLAN 102]:::nic
        vNIC3[vNIC 3: Storage Port <br> VLAN 103]:::nic
    end

    %% MODULE 3: PATCH & DEPLOYMENT SERVER (Segmented Control Plane)
    subgraph M3["Module 3: Deployment Server"]
        DepServer[Go gRPC Server <br> Active-Passive VIP]:::m3
        VulnScanner[Vulnerability Scanner]:::m3
        CryptoSign[Dual-Signature Engine]:::m3
        
        DepServer --> VulnScanner
        DepServer --> CryptoSign
    end

    %% MODULE 1: UNIFIED SECOPS SOFTWARE CORE (Segmented Core)
    subgraph M1["Module 1: Unified SecOps Software Core"]
        OTelIngest[OTel Ingestion Receivers]:::m1
        EntityMap[VM Demultiplexer & Entity Mapper <br> Composite VM-App Mapping]:::m1
        DataMarts[Cross-Cloud Data Marts <br> Default & Plug-In]:::m1
        ClickHouse[ClickHouse Database <br> Multi-Master Replica Cluster]:::m1
        Detection[Sigma / YARA-L Correlation]:::m1
        AIAgent[8-Step Autonomous AI Agent]:::m1
        LocalLLM[Self-Hosted Local LLM]:::m1
        SOAR[Native SOAR Playbooks]:::m1
        Ticketing[Native Ticketing & Cases]:::m1
        PIIMask[PII Masking & 24h Expiry]:::m1
        ConsoleUI[Console Dashboard UI]:::m1
        SelfMonitor[Appliance Self-Monitor <br> GUI / Non-GUI & PAM Loops]:::m1


        OTelIngest --> EntityMap
        EntityMap --> DataMarts
        DataMarts --> ClickHouse
        ClickHouse --> Detection
        ClickHouse --> AIAgent
        LocalLLM <--> AIAgent
        Detection --> SOAR
        AIAgent --> SOAR
        SOAR --> Ticketing
        Ticketing --> PIIMask
        PIIMask --> ConsoleUI
    end

    %% MODULE 4: DATA ARCHIVE SERVER (Segmented Archive)
    subgraph M4["Module 4: Data Archive Server"]
        Lifecycle[Lifecycle Tiering Worker]:::m4
        CephStorage[Ceph / MinIO Storage <br> 5-Year Parquet WORM]:::m4
        Hydration[Forensic Replay & Hydration]:::m4
        
        Lifecycle --> CephStorage
        Hydration --> ClickHouse
    end

    %% INTEGRATION PROTOCOLS AND FLOWS (Direct, Linear Connections crossing vNICs)
    AgentCore ====>|1. Telemetry Ingest <br> mTLS Protobuf| vNIC0
    vNIC0 ====> OTelIngest

    CryptoSign ====>|2. Signed Upgrades <br> gRPC mTLS| vNIC1
    vNIC1 ====> AgentCore

    VulnScanner ====>|3. Vuln Reports <br> Secure gRPC| vNIC3
    vNIC3 ====> ClickHouse

    ConsoleUI ====>|4. Trigger Upgrades <br> HTTPS REST API| vNIC1
    vNIC1 ====> DepServer

    ClickHouse ====>|5. Data Aging <br> Parquet S3| vNIC3
    vNIC3 ====> Lifecycle

    CephStorage ====>|6. Forensic Hydration| vNIC3
    vNIC3 ====> Hydration

    ConsoleUI -.->|7. GUI Audit Logs| SelfMonitor
    SelfMonitor -->|8. Host Telemetry Logs| OTelIngest
    SelfMonitor ====>|9. Break-Glass Logs <br> Direct Ceph Streaming| vNIC3
    vNIC3 ====> CephStorage

    %% Apply Distinct, Clear Colors to Module Boundaries (Indicies verified)
    %% Ingress & Egress Link Styles
    %% Links 19 & 20 (Telemetry Ingestion) -> Emerald Green
    linkStyle 19 stroke:#00b894,stroke-width:2.5px,color:#00b894;
    linkStyle 20 stroke:#00b894,stroke-width:2.5px,color:#00b894;
    %% Links 21 & 22 (Canary Upgrades) -> Hot Pink
    linkStyle 21 stroke:#fd79a8,stroke-width:2.5px,color:#fd79a8;
    linkStyle 22 stroke:#fd79a8,stroke-width:2.5px,color:#fd79a8;
    %% Links 23 & 24 (Vulnerability Reports) -> Royal Purple
    linkStyle 23 stroke:#9b59b6,stroke-width:2.5px,color:#9b59b6;
    linkStyle 24 stroke:#9b59b6,stroke-width:2.5px,color:#9b59b6;
    %% Links 25 & 26 (Console REST to Deployment Server) -> Crimson Red
    linkStyle 25 stroke:#e74c3c,stroke-width:2.5px,color:#e74c3c;
    linkStyle 26 stroke:#e74c3c,stroke-width:2.5px,color:#e74c3c;
    %% Links 27 & 28 (Data Aging) -> Bright Blue
    linkStyle 27 stroke:#0984e3,stroke-width:2.5px,color:#0984e3;
    linkStyle 28 stroke:#0984e3,stroke-width:2.5px,color:#0984e3;
    %% Links 29 & 30 (Forensic Hydration) -> Amber Orange
    linkStyle 29 stroke:#e67e22,stroke-width:2.5px,color:#e67e22;
    linkStyle 30 stroke:#e67e22,stroke-width:2.5px,color:#e67e22;
    %% Links 31 & 32 (Appliance Self-Auditing) -> Dotted Slate Grey
    linkStyle 31 stroke:#7f8c8d,stroke-width:2px,stroke-dasharray:5 5,color:#7f8c8d;
    linkStyle 32 stroke:#7f8c8d,stroke-width:2px,stroke-dasharray:5 5,color:#7f8c8d;
    %% Links 33 & 34 (Break-Glass WORM Log Streaming) -> Deep Emergency Crimson Red
    linkStyle 33 stroke:#c0392b,stroke-width:2.5px,color:#c0392b;
    linkStyle 34 stroke:#c0392b,stroke-width:2.5px,color:#c0392b;

    %% Styling Application
    class M1 m1;
    class M2 m2;
    class M3 m3;
    class M4 m4;
```

---

## 2. Technical Integration Pathways

*   **🟢 Emerald Line (1. Telemetry Ingestion)**: Dynamic streaming of normalized, high-density telemetry from systems (Linux, Windows, macOS, and mainframe components) into the appliance **vNIC 0 Ingestion Port** via secure **mTLS v1.3** and Protobuf.
*   **💗 Pink Line (2. Fleet Configuration & Upgrades)**: Dedicated bi-directional **gRPC** pipes routing through the appliance **vNIC 1 Control Port** to the deployment control plane for configuration updates and signed patches.
*   **💜 Purple Line (3. Vulnerability Logs & Agent Policies)**: Secure control channels transmitting vulnerability logs, dependency metrics, and local system compliance metrics directly into the active database core via **vNIC 3 Storage Port**.
*   **🔴 Red Line (4. Console Patch REST API)**: ephemerally authorized HTTPS channels enabling administrators to trigger vulnerability scans and approve upgrades directly from the central UI console crossing to the control server via **vNIC 1**.
*   **🔵 Blue Line (5. 180-Day Data Partition Aging)**: High-speed local database operations that offload partition blocks, compress them into columnar Parquet files, and push them to long-term storage crossing **vNIC 3**.
*   **🟠 Orange Line (6. Forensic Replay & Hydration)**: A read-only verification pipeline to securely decompress and stream historical 5-year cold archives back into the active indexing database crossing **vNIC 3**.
*   **⚪ Dotted Grey Line (7 & 8. Appliance Self-Auditing)**: A closed loop capturing all Web Console GUI clicks/API calls (7) and routing them alongside host-level shell execution/auditd (8) telemetry straight into the local OTel ingestion queue.
*   **🛑 Crimson Line (9. Break-Glass Log Streaming)**: An immutable emergency line bypassing all external authentication systems, capturing serial console shell recovery sessions, and streaming WORM logs directly to Module 4 Ceph cold storage over **vNIC 3**.

---

## 3. Pluggable, Dynamic Data Mart Ingestion Architecture

To accommodate rapid scale and changing technologies, the platform rejects hard-coded storage architectures, employing a **Dynamic Data Mart Engine** inside the Cross-Cloud Lakehouse.

### 3.1 Provisioned-by-Default Data Marts
Out-of-the-box (OOTB), the platform automatically provisions six default, optimized data marts in the warm storage layer:
1.  **Legacy Telemetry Mart**: Normalized using the `LegacyTel` parser library for IBM and HPE midrange/mainframe operations.
2.  **Windows Telemetry Mart**: Optimized for Windows Event ID streams, Active Directory events, and Sysmon.
3.  **Linux Telemetry Mart**: Configured for host logging, `auditd` output, and low-latency eBPF kernel traces.
4.  **Firewall Telemetry Mart**: Engineered for fast ingestion and searching of network flow (NetFlow/IPFIX) files.
5.  **Proxy Telemetry Mart**: Structured for DNS resolution records, HTTP gateway headers, and egress proxies.
6.  **Identity & Governance Mart**: Stores SSO credentials, active MFA logs (challenges/replies), and IGA entitlement/recertification events (SailPoint/Saviynt).

### 3.2 Dynamic Registration & Hot-Reloading Pipeline
Enterprise administrators can dynamically **Add (Register)** or **Remove (Deregister)** custom data marts for specific technologies (e.g., adding a `Workday Mart`, an `Oracle DB Mart`, or a specific department group subnet) via the central console interface without incurring system downtime:

```mermaid
graph LR
    classDef step fill:#1e1e2f,stroke:#6c5ce7,stroke-width:1.5px,color:#ffffff;
    
    A[Admin Console UI]:::step -->|1. Define schema & technology| B[API Registration Gateway]:::step
    B -->|2. Provision ClickHouse Partition| C[Storage Schema Creator]:::step
    B -->|3. Compile & Push OTel Routing| D[OTel Router Engine]:::step
    D -->|4. Hot-Reload Config| E[Ingestion Receivers]:::step
```

*   **Workflow Operations**:
    *   **Registering a Data Mart**:
        1.  The administrator inputs the new technology name (e.g., `workday`), defines the event mapping, and configures the identifier schema through the administrative interface.
        2.  The database **Storage Schema Creator** dynamically creates a new, isolated columnar partition table in the ClickHouse Lakehouse (`dm_custom_workday`).
        3.  The **OTel Router Engine** generates a new routing rule assigning the source identifier (e.g., `service: workday`) to the new table partition target.
        4.  The ingestion receivers automatically perform a **Hot-Reload configuration sweep**, updating stream filters in memory without dropping in-flight telemetry packets.
    *   **Deregistering a Data Mart**:
        1.  Deregistration removes active OTel ingestion routes, instantly dropping further traffic to the designated mart.
        2.  The warm partition table is unlinked from active search queries, and its contents are either archived directly to cold storage (Ceph/MinIO) or deleted, depending on the enterprise data lifecycle policy.
