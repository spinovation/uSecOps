#!/usr/bin/env bash
# bin/setup_vnic_simulation.sh
# Sets up and simulates the 4-vNIC Segmented Network Architecture
# Creates tagged VLAN sub-interfaces and applies iptables firewall rules to enforce isolation.

set -eo pipefail

logger() {
    echo -e "\033[1;34m[vNIC Simulator] $(date '+%Y-%m-%d %H:%M:%S') - $1\033[0m"
}

error_logger() {
    echo -e "\033[1;31m[vNIC ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1\033[0m" >&2
}

# 1. Enforce Root
if [ "$EUID" -ne 0 ]; then
   error_logger "This script must be run as root (sudo)."
   exit 1
fi

# 2. Automatically detect active physical interface
PHYS_IF=$(ip -o -4 route show to default | awk '{print $5}' | head -n1)
if [ -z "$PHYS_IF" ]; then
    logger "No default physical interface found. Falling back to 'eth0'."
    PHYS_IF="eth0"
fi

logger "Detected active physical interface: $PHYS_IF"

# 3. Enable 802.1q VLAN Module
logger "Loading 8021q Linux kernel virtualization modules..."
modprobe 8021q || true

# 4. Create Segmented VLAN Interfaces (vNIC 0 - 3)
logger "Creating virtual segmented interfaces (VLANs 100 - 103)..."

VLANS=(100 101 102 103)
IPS=("10.100.0.100/24" "10.101.0.100/24" "10.102.0.100/24" "10.103.0.100/24")
NAMES=("Ingestion_vNIC0" "Control_vNIC1" "Management_vNIC2" "Storage_vNIC3")

for i in "${!VLANS[@]}"; do
    VLAN_ID=${VLANS[$i]}
    IF_NAME="${PHYS_IF}.${VLAN_ID}"
    IP_ADDR=${IPS[$i]}
    ALIAS=${NAMES[$i]}
    
    logger "Creating $ALIAS on interface $IF_NAME with IP $IP_ADDR..."
    
    # Delete if already exists to prevent duplicate failures
    ip link delete "$IF_NAME" 2>/dev/null || true
    
    # Create VLAN interface
    ip link add link "$PHYS_IF" name "$IF_NAME" type vlan id "$VLAN_ID"
    ip addr add "$IP_ADDR" dev "$IF_NAME"
    ip link set dev "$IF_NAME" up
done

# 5. Apply iptables Firewall Segregation Rules
logger "Applying iptables network isolation rules..."

# Reset existing rules for our segments to avoid rules clutter
iptables -F FORWARD || true

# Rule A: Ingestion segment (VLAN 100) must NEVER communicate with Storage (VLAN 103) directly
# This prevents external agent compromises from pivoting directly to raw ClickHouse / Ceph databases
logger " -> Enforcing Rule A: Drop Ingestion (VLAN 100) -> Storage (VLAN 103) direct access"
iptables -A FORWARD -i "${PHYS_IF}.100" -o "${PHYS_IF}.103" -j DROP
iptables -A FORWARD -i "${PHYS_IF}.103" -o "${PHYS_IF}.100" -j DROP

# Rule B: Ingestion segment (VLAN 100) can ONLY send traffic to OTel Ingest VIP (10.100.0.100) on Port 4317/4318
logger " -> Enforcing Rule B: Restrict Ingestion (VLAN 100) to OTel Collector ports"
iptables -A FORWARD -i "${PHYS_IF}.100" -d 10.100.0.100 -p tcp --dport 4317 -j ACCEPT
iptables -A FORWARD -i "${PHYS_IF}.100" -d 10.100.0.100 -p tcp --dport 4318 -j ACCEPT

# Rule C: Storage segment (VLAN 103) only accepts SQL queries from Management (VLAN 102)
logger " -> Enforcing Rule C: Restrict Storage (VLAN 103) SQL queries to Management (VLAN 102) origin"
iptables -A FORWARD -i "${PHYS_IF}.102" -o "${PHYS_IF}.103" -p tcp --dport 9000 -j ACCEPT # ClickHouse native
iptables -A FORWARD -i "${PHYS_IF}.102" -o "${PHYS_IF}.103" -p tcp --dport 5432 -j ACCEPT # Postgres native
iptables -A FORWARD -o "${PHYS_IF}.103" -j DROP # Drop all other traffic into storage segment

logger "vNIC Segmentation Rules applied successfully!"

# 6. Print Active Interfaces Summary
echo -e "\n======================================================================"
echo -e "                   VIRTUAL vNIC SEGMENTATION SUMMARY                 "
echo -e "======================================================================"
ip -d link show | grep -E "(${PHYS_IF}\.10[0-3])" -A 1 || true
echo -e "======================================================================\n"

logger "vNIC Testbed configuration Complete. To verify rules, run ping/curl tests across interfaces."
