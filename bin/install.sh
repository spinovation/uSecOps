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
        # Deploy systemd core service
        if [ -f "/opt/secops/sys/systemd/secops-core.service" ]; then
            cp /opt/secops/sys/systemd/secops-core.service /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable secops-core.service || true
            logger "Module 1 systemd service initialized."
        else
            logger "Note: secops-core.service template not found in sys/systemd/, skipping systemd activation."
        fi
        ;;
    agent_concentrator)
        logger "Provisioning Module 2 (Agent Telemetry Concentrator)..."
        if [ -f "/opt/secops/sys/systemd/secops-collector.service" ]; then
            cp /opt/secops/sys/systemd/secops-collector.service /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable secops-collector.service || true
            logger "Module 2 systemd service initialized."
        else
            logger "Note: secops-collector.service template not found, skipping systemd activation."
        fi
        ;;
    patch)
        logger "Provisioning Module 3 (Patch & Mythos Deployment Server)..."
        if [ -f "/opt/secops/sys/systemd/secops-patch.service" ]; then
            cp /opt/secops/sys/systemd/secops-patch.service /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable secops-patch.service || true
            logger "Module 3 systemd service initialized."
        else
            logger "Note: secops-patch.service template not found, skipping systemd activation."
        fi
        ;;
    archive)
        logger "Provisioning Module 4 (Cold Archive Server)..."
        if [ -f "/opt/secops/sys/systemd/secops-archive.service" ]; then
            cp /opt/secops/sys/systemd/secops-archive.service /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable secops-archive.service || true
            logger "Module 4 systemd service initialized."
        else
            logger "Note: secops-archive.service template not found, skipping systemd activation."
        fi
        ;;
    *)
        error_logger "Unknown role target specified: $ROLE"
        exit 1
        ;;
esac

logger "Installation and bootstrap completed successfully for $ROLE."
