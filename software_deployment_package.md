# Unified SecOps Platform – Software Deployment Package & SBOM Specification

This document details the enterprise software packaging structure, the **Software Bill of Materials (SBOM)**, and the **Pre-Deployment Connection & Port Configuration Checklist** that an enterprise must install, provision, and configure before deploying the VM Appliance.

---

## 1. Unified Appliance Directory & Packaging Model

The entire platform is delivered as a consolidated, tar-gzipped archive (`secops-appliance-v2.0.0.tar.gz`) designed to be extracted on the designated virtual machines (Module 1, 2, 3, and 4) running Rocky Linux Core or RHEL Core.

### 1.1 Package Directory Structure (`/opt/secops/`)

When extracted on a target VM, the installer parses the host role and activates only the respective directory configuration:

```text
/opt/secops/
├── bin/
│   ├── install.sh                       # Unified master installation and deployment script
│   ├── cert-gen.sh                      # Local PKI utility to generate agent mTLS certificates
│   └── test_runner.py                   # Master integration test suite and validation engine
├── config/
│   ├── otel-collector-config.yaml       # Module 1 & 2 OTel collector configuration
│   ├── clickhouse-keeper.xml            # ClickHouse Keeper clustering configuration
│   └── postgresql.conf                  # Relational database parameters
├── database/
│   ├── clickhouse-schema.sql            # Columnar security lakehouse schema
│   └── postgres-schema.sql              # Transactional case management schema
├── modules/
│   ├── module1_core/
│   │   ├── ingestion/
│   │   │   ├── entity_demux.py          # Virtual Entity Demultiplexing pre-processor
│   │   │   └── data_mart_manager.py     # Dynamic Data Mart provisioning agent
│   │   └── soar/
│   │       └── soar_playbook_engine.py  # SOAR playbook engine with supervisor gates
│   ├── module2_agents/
│   │   ├── agent_daemon.py              # Lightweight endpoint telemetry daemon with spooler
│   │   └── legacy_tel_bridge.py         # Mainframe AS/400 and z/OS bridging adapter
│   ├── module3_patch/
│   │   ├── grpc_control_pipeline.py     # Secure gRPC client/server upgrade pipeline
│   │   └── mythos_vuln_scanner.py       # Mythos-class AI-native reachability scanner
│   └── module4_archive/
│       └── parquet_archiver.py          # Parquet lifecycle data tiering archiver
└── sys/
    ├── systemd/
    │   ├── secops-core.service          # Module 1 systemd service unit
    │   ├── secops-collector.service     # Module 2 systemd service unit
    │   ├── secops-patch.service         # Module 3 systemd service unit
    │   └── secops-archive.service       # Module 4 systemd service unit
    └── security/
        └── se_policy.te                 # SELinux type enforcement security policies
```

### 1.2 Master Extraction & Bootstrap Script (`install.sh`)

This script runs on the target VM, checks the host hardware profile, allocates directories, configures iptables firewall rules, and starts systemd service runtimes:

```bash
#!/usr/bin/env bash
# /opt/secops/bin/install.sh
# Master Bootstrap Installer for Unified SecOps VM Appliance

set -eo pipefail

logger() {
    echo -e "\033[1;32m[SecOps Installer] $(date '+%Y-%m-%d %H:%M:%S') - $1\033[0m"
}

error_logger() {
    echo -e "\033[1;31m[SecOps ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1\033[0m" >&2
}

# 1. Enforce Root Execution
if [ "$EUID" -ne 0 ]; then
   error_logger "This installer must be run as root (sudo)."
   exit 1
fi

# 2. Identify System Role
ROLE=$1
if [ -z "$ROLE" ]; then
    error_logger "Please specify a module target role: 'core', 'agent_concentrator', 'patch', 'archive'"
    exit 1
fi

logger "Initializing extraction and bootstrap sequence for target role: $ROLE..."

# 3. Create Operational Paths
mkdir -p /etc/secops/certs
mkdir -p /var/log/secops
mkdir -p /var/lib/secops/data

# 4. Deploy Role-Specific Runtimes
case "$ROLE" in
    core)
        logger "Provisioning Module 1 (Unified SecOps Core)..."
        # Deploy ClickHouse databases, PostgreSQL, Next.js UI console, and Local LLM (Ollama)
        cp /opt/secops/sys/systemd/secops-core.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable secops-core.service
        logger "Module 1 systemd service initialized."
        ;;
    agent_concentrator)
        logger "Provisioning Module 2 (Agent Telemetry Concentrator)..."
        cp /opt/secops/sys/systemd/secops-collector.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable secops-collector.service
        ;;
    patch)
        logger "Provisioning Module 3 (Patch & Mythos Deployment Server)..."
        cp /opt/secops/sys/systemd/secops-patch.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable secops-patch.service
        ;;
    archive)
        logger "Provisioning Module 4 (Cold Archive Server)..."
        cp /opt/secops/sys/systemd/secops-archive.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable secops-archive.service
        ;;
    *)
        error_logger "Unknown role target specified: $ROLE"
        exit 1
        ;;
esac

logger "Installation and bootstrap completed successfully for $ROLE."
```

---

## 2. Software Bill of Materials (SBOM)

Formatted in compliance with standard **CycloneDX v1.5** JSON/XML structures, this list covers all dependencies, runtimes, and libraries packaged inside the appliance.

| Component Name | Version | License | Category / Function | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Rocky Linux Core** | 9.3 | GPL / Various | Hardened base Operating System | Stripped OS with no GUI overhead; SELinux targeted profiles enabled by default. |
| **OpenTelemetry Collector** | 0.95.0 | Apache 2.0 | Telemetry Ingestion Receiver | Standardized data collection framework; removes vendor lock-in. |
| **ClickHouse Server** | 24.3-LTS | Apache 2.0 | Warm Database (OLAP) | Sub-second columnar search speeds over a 180-day active window. |
| **PostgreSQL** | 16.2 | PostgreSQL | Transactional Database (OLTP) | Relational case ticketing and SOAR playbook run storage with ACID safety. |
| **Ollama Runtime** | 0.1.32 | MIT | Local AI Copilot Engine | Standardized container to host local AI model weights in air-gapped environments. |
| **Llama-3-8B-Instruct** | Meta-Llama-3 | Llama 3 | Local LLM Weights | Local models running on GPU nodes executing the 8-Step Security Agent loop. |
| **HAProxy** | 2.9 | GPL 2.0 | Load Balancing & Routing | Provides active-active L4/L7 routing across ingestion and dashboard ports. |
| **Keepalived** | 2.2.8 | GPL 2.0 | High Availability VRRP | Exposes the Ingestion, Control, and Management Virtual IPs (VIPs) for failover. |
| **Ceph Storage Cluster** | 18.2.1 | LGPL 2.1 | Cold Storage (5-Year WORM) | Distributed, erasure-coded storage hosting cold Apache Parquet files. |
| **Python Standard Libs** | 3.11.x | PSF | Scripting & Engines | Runs local `entity_demux.py`, `data_mart_manager.py`, and WORM archiving daemons. |

---

## 3. Pre-Deployment Configuration & Network Port Requirements

Before extracting the appliance, the enterprise network administrators and virtualization engineers must configure their host hypervisors and core switches to meet the following parameters:

### 3.1 Dynamic Segmented Network Interfaces (VLAN Mapping)

The host hypervisor must map four virtual network interfaces (vNICs) to the respective segmented VLANs on the physical switch:

```text
Physical Host Trunk Port
  ├── vNIC 0 ── VLAN 100 (Ingestion Network)  --> OTel Ingress, Syslog Streams (mTLS)
  ├── vNIC 1 ── VLAN 101 (Control Network)    --> Patch Engine, Agent gRPC (mTLS)
  ├── vNIC 2 ── VLAN 102 (Management Network) --> React/Next.js Console UI, REST API
  └── vNIC 3 ── VLAN 103 (Storage Network)    --> ClickHouse clusters, Ceph replication, Parquet exports
```

### 3.2 Network Port & Firewall Matrix

The core switches/internal firewalls must permit traffic along the following channels:

| Inbound Interface | Outbound Interface | Port / Protocol | Traffic Direction | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **VLAN 100** (Ingestion) | **Module 1 Core** | `4317` / TCP | Inbound | OpenTelemetry gRPC mTLS Protobuf log ingestion. |
| **VLAN 100** (Ingestion) | **Module 1 Core** | `4318` / TCP | Inbound | OpenTelemetry HTTP mTLS log ingestion. |
| **VLAN 100** (Ingestion) | **Module 1 Core** | `514` / UDP & TCP | Inbound | Concentrated network device Syslog streams. |
| **VLAN 101** (Control) | **Agent Endpoints** | `50051` / TCP | Bi-directional | Secure patch updates, configuration push, and gRPC control channels. |
| **VLAN 102** (Management) | **Analyst Workstation** | `443` / TCP (HTTPS) | Inbound | Secure Web UI access to the React console dashboard. |
| **VLAN 103** (Storage) | **Module 4 (Ceph)** | `6789` / TCP & `6800-7300` | Inbound | Ceph object storage monitor and dynamic OSD data synchronization. |
| **VLAN 103** (Storage) | **Module 1 Cluster** | `9000` / TCP | Inter-node | ClickHouse Keeper replication synchronization and data clustering. |

### 3.3 Operating System & Hypervisor Prerequisite Steps

The target VM operating systems must satisfy the following baseline configurations before starting `/opt/secops/bin/install.sh`:

1.  **SELinux Configuration**:
    *   Set SELinux to `enforcing`. Use our pre-packaged policy templates located at `/opt/secops/sys/security/se_policy.te` to authorize OTel and database operations.
2.  **Kernel Parameters (`/etc/sysctl.conf`)**:
    *   Increase maximum socket buffer size for high-throughput packet ingestion:
        ```text
        net.core.rmem_max = 67108864
        net.core.wmem_max = 67108864
        ```
    *   Allow virtual memory mapping for ClickHouse Keeper operations:
        ```text
        vm.max_map_count = 262144
        ```
3.  **Local Certificate Provisioning (PKI)**:
    *   The enterprise security administrators must generate internally trusted **CA certificates**, **Server certificates**, and **Client certificates** using their local Root CA (e.g. Active Directory Certificate Services or private PKI).
    *   These certificates must be placed in `/etc/secops/certs/` before starting mTLS collectors.
