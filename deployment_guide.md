# Unified SecOps Platform – Enterprise Hypervisor Deployment Guide

This document provides step-by-step instructions, administrative commands, and prerequisites required to configure, deploy, and verify the Unified SecOps Platform VM Appliance across the three major enterprise hypervisors: **VMware ESXi / vSphere**, **Microsoft Hyper-V**, and **Enterprise KVM (QEMU/Libvirt)** under strict air-gapped conditions.

---

## 1. Global Network & Interface Preparation

Before initiating hypervisor-specific setups, the core switch trunk ports connected to the physical hosts must be configured to pass tagged traffic for our segmented VLANs:
*   **VLAN 100** (Ingestion Network - OTel mTLS endpoints)
*   **VLAN 101** (Control Network - Agent gRPC patch server)
*   **VLAN 102** (Management Network - Analyst Console HTTPS Web UI)
*   **VLAN 103** (Storage Network - clickhouse Keeper and Ceph sync)

---

## 2. Hypervisor-Specific Setup Instructions

### 2.1 VMware ESXi & vSphere (Type 1 Bare-Metal)

#### Prerequisites & Host Configuration
1.  **Virtual Switch (vSwitch) Configuration**:
    *   Ensure an Active Standard Virtual Switch (`vSwitch0` or a Distributed vSwitch `vDS`) is bound to the physical uplink ports supporting 802.1Q VLAN trunking.
2.  **Create Tagged Port Groups**:
    *   Log in to the **vSphere Client** or ESXi host UI.
    *   Navigate to **Networking** > **Port Groups** > **Add Port Group**.
    *   Create four distinct port groups mapped to your virtual switch:
        *   `PortGroup-Ingestion-V100` (VLAN ID: `100`)
        *   `PortGroup-Control-V101`   (VLAN ID: `101`)
        *   `PortGroup-Management-V102`(VLAN ID: `102`)
        *   `PortGroup-Storage-V103`   (VLAN ID: `103`)

#### VM Provisioning & OVA Extraction
1.  **Deploy OVA Template**:
    *   In the vSphere client, right-click your cluster/host and select **Deploy OVF Template**.
    *   Select your locally downloaded `secops-appliance-v2.0.0.ova`.
2.  **Network Mapping**:
    *   When prompted to map source networks to destination port groups, map the four appliance virtual interfaces exactly:
        *   `Source Interface 0 (vNIC 0)` $\rightarrow$ `PortGroup-Ingestion-V100`
        *   `Source Interface 1 (vNIC 1)` $\rightarrow$ `PortGroup-Control-V101`
        *   `Source Interface 2 (vNIC 2)` $\rightarrow$ `PortGroup-Management-V102`
        *   `Source Interface 3 (vNIC 3)` $\rightarrow$ `PortGroup-Storage-V103`
3.  **Hardware Resource Reservation**:
    *   Set **CPU Reservation** to **100%** (ensure no CPU cycle overcommit).
    *   Check **Reserve all guest memory (All locked)**.

---

### 2.2 Microsoft Hyper-V (Server 2022 / Azure Stack HCI)

#### Prerequisites & Host Configuration
1.  **Create External Virtual Switch**:
    *   Open **Hyper-V Manager**, select your host, and click **Virtual Switch Manager**.
    *   Select **External**, click **Create Virtual Switch**, name it `SecOps-External-Switch`, and bind it to your physical 25GbE uplink card.
2.  **Powershell Host Configuration**:
    *   Execute these commands in an Administrative PowerShell shell to allocate the VM and configure the four virtual network adapters with specific VLAN tagging.

```powershell
# 1. Create the base VM Appliance
New-VM -Name "SecOps-Core-Production" -MemoryStartupBytes 64GB -Generation 2 -NewVHDPath "C:\Hyper-V\Virtual Hard Disks\SecOps-Core.vhdx" -VHDSizeBytes 100GB

# 2. Set CPU Core Reservations (16 Cores)
Set-VMProcessor -VMName "SecOps-Core-Production" -Count 16 -Reserve 100

# 3. Add the three additional Network Adapters (vNIC 0 is created by default)
Add-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Control-NIC"
Add-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Management-NIC"
Add-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Storage-NIC"

# 4. Map the Adapters to the External Virtual Switch
Connect-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Network Adapter" -SwitchName "SecOps-External-Switch"
Connect-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Control-NIC" -SwitchName "SecOps-External-Switch"
Connect-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Management-NIC" -SwitchName "SecOps-External-Switch"
Connect-VMNetworkAdapter -VMName "SecOps-Core-Production" -Name "Storage-NIC" -SwitchName "SecOps-External-Switch"

# 5. Enforce VLAN Identification Tagging on each NIC adapter
Set-VMNetworkAdapterVlan -VMName "SecOps-Core-Production" -VMNetworkAdapterName "Network Adapter" -Access -VlanId 100
Set-VMNetworkAdapterVlan -VMName "SecOps-Core-Production" -VMNetworkAdapterName "Control-NIC" -Access -VlanId 101
Set-VMNetworkAdapterVlan -VMName "SecOps-Core-Production" -VMNetworkAdapterName "Management-NIC" -Access -VlanId 102
Set-VMNetworkAdapterVlan -VMName "SecOps-Core-Production" -VMNetworkAdapterName "Storage-NIC" -Access -VlanId 103
```

---

### 2.3 Enterprise KVM (QEMU / Libvirt / OpenStack)

#### Prerequisites & Host Configuration
1.  **Define Linux Bridges on the KVM Host**:
    *   Configure network interfaces in your Linux netplan or interface configs (`/etc/network/interfaces` or `/etc/sysconfig/network-scripts/`) to bridge VLAN interfaces to target bridges:
        *   `br100` bridged to physical trunk interface sub-interface `eth0.100`.
        *   `br101` bridged to `eth0.101`.
        *   `br102` bridged to `eth0.102`.
        *   `br103` bridged to `eth0.103`.
2.  **Define Libvirt Domain XML configurations**:
    *   Ensure your VM domain XML file allocates and binds the interfaces directly to the Linux bridges with low-latency VirtIO drivers:

```xml
<!-- Libvirt XML snippet for Network Segment Interfaces -->
<devices>
  <!-- vNIC 0: Ingestion Bridge (VLAN 100) -->
  <interface type='bridge'>
    <source bridge='br100'/>
    <model type='virtio'/>
    <driver name='vhost' queues='4'/>
  </interface>
  <!-- vNIC 1: Control Bridge (VLAN 101) -->
  <interface type='bridge'>
    <source bridge='br101'/>
    <model type='virtio'/>
  </interface>
  <!-- vNIC 2: Management Bridge (VLAN 102) -->
  <interface type='bridge'>
    <source bridge='br102'/>
    <model type='virtio'/>
  </interface>
  <!-- vNIC 3: Storage Bridge (VLAN 103) -->
  <interface type='bridge'>
    <source bridge='br103'/>
    <model type='virtio'/>
  </interface>
</devices>
```

3.  **Boot using QCOW2 image**:
    *   Deploy using the virtual command line:
        ```bash
        virt-install --name secops-core-prod \
          --ram 65536 \
          --vcpus 16,cpuset=0-15 \
          --cpu host-passthrough \
          --disk path=/var/lib/libvirt/images/secops-core.qcow2,device=disk,bus=virtio \
          --network bridge=br100,model=virtio \
          --network bridge=br101,model=virtio \
          --network bridge=br102,model=virtio \
          --network bridge=br103,model=virtio \
          --import --noautoconsole
        ```

---

## 3. Step-by-Step Appliance Bootstrapping

Once the host VM is allocated, started, and the hardened base Rocky Linux Core OS is running:

### Step 1: Upload and Extract Package
Upload the secure tarball payload using an offline data channel (USB, air-gapped staging host) and extract to `/opt/`:
```bash
sudo tar -xzvf secops-appliance-v2.0.0.tar.gz -C /
cd /opt/secops/
```

### Step 2: Establish Cryptographic Keys (PKI)
Ensure CA and Server/Client SSL certificates generated by your organization's private PKI are located in the target certs directories:
*   `server.crt` & `server.key` placed at `/etc/secops/certs/ingestion.crt` and `/etc/secops/certs/ingestion.key` respectively.
*   `client_ca.crt` placed at `/etc/secops/certs/client_ca.crt` to enforce client validation checks.

### Step 3: Run the Master Bootstrap Installer
Execute the master installation helper, passing the target server role parameter. For the primary central VM:
```bash
sudo chmod +x bin/install.sh
sudo ./bin/install.sh core
```
*For secondary patch deployment servers or distributed storage archives, run `./bin/install.sh patch` or `./bin/install.sh archive` respectively on those specific VM systems.*

---

## 4. Post-Deployment Verification & Smoke Tests

To confirm that the OTel ingestion pipelines, database schemas, dynamic data mart controllers, Mythos vulnerability scanner, secure gRPC control pipelines, and SOAR approval gates are 100% stable, run our automated **Master Integration Test Suite**:

```bash
# Execute master integration test suite locally
sudo chmod +x bin/test_runner.py
python3 bin/test_runner.py
```

### Expected Output Report:
The integration verification report should display clean, error-free results across all major modules:

```text
======================================================================
                      INTEGRATION VERIFICATION REPORT                 
======================================================================
 - Virtual Entity Demultiplexing Engine                              : 🟢 PASSED
 - Dynamic Data Mart Provisioning Engine                             : 🟢 PASSED
 - PostgreSQL & ClickHouse Schema Migrations Syntax Check            : 🟢 PASSED
 - Mythos-Class AI Vulnerability & Reachability Scanner              : 🟢 PASSED
 - gRPC Control Plane & Dual-Signature Upgrade Pipeline              : 🟢 PASSED
 - SOAR Playbook Orchestration Engine & Supervisor Approval Gates    : 🟢 PASSED
======================================================================
VERIFICATION RESULTS: 6/6 Tests Passed.
======================================================================
Verification Suite: ALL PROTO-ENGINE SYSTEMS STABLE.
```
