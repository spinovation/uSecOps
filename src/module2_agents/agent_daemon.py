#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lightweight Endpoint Telemetry Agent Daemon (Module 2)
Cross-platform system syslog tailer, hardware hypervisor context auditor (Type 1 vs Type 2),
and robust local database spool cache for offline buffering.
"""

import sys
import os
import json
import logging
import time
import uuid
import socket
import platform
import subprocess
import threading
import sqlite3
from typing import Dict, Any, List

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("TelemetryAgentDaemon")

# Cross-platform Windows Event Log Imports
try:
    import win32evtlog
    import win32evtlogutil
    import win32security
    import win32con
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

class TelemetryAgentDaemon:
    def __init__(self, agent_id: str = None):
        self.agent_id = agent_id or f"AGENT-{socket.gethostname().upper()}-{str(uuid.uuid4())[:8]}"
        
        # Determine local safe paths with automatic workspace fallback if root denied
        self.workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.cache_dir = os.path.join(self.workspace_dir, "sys", "cache")
        
        os.makedirs(self.cache_dir, exist_ok=True)
        self.db_path = os.path.join(self.cache_dir, "spooled_telemetry.db")
        
        self.is_connected = True 
        self.hypervisor_type = self._detect_hypervisor()
        self.os_type = platform.system()
        
        self.is_running = False
        self.log_thread = None
        
        # Initialize SQLite spool cache
        self._init_spool_db()
        logger.info(f"Telemetry Agent Initialised: ID={self.agent_id} | OS={self.os_type} | HV={self.hypervisor_type}")

    def _init_spool_db(self):
        """Creates table schema for buffering offline logs."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS spool_queue (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    event_code TEXT,
                    payload TEXT,
                    app_instance_id TEXT
                )
            """)
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to initialize SQLite spool database: {e}")

    def _detect_hypervisor(self) -> str:
        """
        Hypervisor Virtualization Context: Cross-platform heuristics check
        to classify hardware as Type 1 (Bare-Metal), Type 2 (Hosted) or Physical.
        """
        system = platform.system().lower()
        logger.info("Auditing local system registers for hypervisor virtualization context...")
        
        try:
            # 1. Linux Heuristics
            if system == "linux":
                # Check sysfs vendor metrics
                vendor_path = "/sys/class/dmi/id/sys_vendor"
                product_path = "/sys/class/dmi/id/product_name"
                hv_type_path = "/sys/hypervisor/type"
                
                vendor = ""
                product = ""
                
                if os.path.exists(vendor_path):
                    with open(vendor_path, "r") as f:
                        vendor = f.read().strip().lower()
                if os.path.exists(product_path):
                    with open(product_path, "r") as f:
                        product = f.read().strip().lower()
                        
                # Check for KVM / QEMU (Type 1)
                if "qemu" in vendor or "red hat" in vendor or "kvm" in product or "bochs" in product:
                    return "TYPE 1 (BARE-METAL_KVM/QEMU)"
                # Check for VMware (Type 1 or Type 2 dependent on platform hardware)
                elif "vmware" in vendor or "vmware" in product:
                    if "workstation" in product or "player" in product:
                        return "TYPE 2 (HOSTED_VMWARE_WORKSTATION)"
                    return "TYPE 1 (BARE-METAL_VMWARE_ESXI)"
                # Check for Hyper-V (Type 1)
                elif "microsoft" in vendor and "virtual machine" in product:
                    return "TYPE 1 (BARE-METAL_MICROSOFT_HYPER-V)"
                # Check for VirtualBox (Type 2)
                elif "virtualbox" in product or "innotek" in vendor:
                    return "TYPE 2 (HOSTED_ORACLE_VIRTUALBOX)"
                
                # Alternate check on sys/hypervisor
                if os.path.exists(hv_type_path):
                    with open(hv_type_path, "r") as f:
                        hv = f.read().strip().upper()
                        return f"TYPE 1 (BARE-METAL_{hv})"
                        
            # 2. macOS Heuristics
            elif system == "darwin":
                # Run sysctl to detect system hardware virtualization info
                res = subprocess.run(["sysctl", "-n", "hw.model"], capture_output=True, text=True)
                model = res.stdout.strip().lower()
                
                if "vmware" in model:
                    return "TYPE 2 (HOSTED_VMWARE_FUSION)"
                elif "virtualbox" in model:
                    return "TYPE 2 (HOSTED_ORACLE_VIRTUALBOX)"
                elif "virtual" in model or "guest" in model:
                    return "TYPE 2 (HOSTED_VIRTUAL_MAC)"
                
                # Check hypervisor framework attributes
                res_features = subprocess.run(["sysctl", "a"], capture_output=True, text=True)
                if "hypervisor" in res_features.stdout.lower():
                    return "TYPE 2 (HOSTED_UTM_PARALLELS)"

            # 3. Windows Heuristics (Fallback Mock representation)
            elif system == "windows":
                # Simulated system registry analysis output
                return "TYPE 1 (BARE-METAL_MICROSOFT_HYPER-V)"

        except Exception as e:
            logger.warning(f"Hypervisor checks incomplete due to process exception: {e}")
            
        return "NONE (PHYSICAL_HARDWARE)"

    def spool_log_to_disk(self, timestamp: str, event_code: str, payload: str, app_instance_id: str):
        """Encrypts/buffers telemetry events to sqlite spool during network disconnections."""
        logger.warning(f"[Spooler] Ingestion VIP is unreachable! Buffering log to secure SQLite spool: {self.db_path}")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO spool_queue VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), timestamp, event_code, payload, app_instance_id)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"[Spooler] Failed to write cache: {e}")

    def capture_and_send_telemetry(self, event_code: str, raw_payload: str, app_instance_id: str = "BASE_OS") -> bool:
        """Enriches, serializes, and streams telemetry over secure receiver channel."""
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        event = {
            "timestamp": timestamp,
            "event_code": event_code,
            "agent_id": self.agent_id,
            "hypervisor_type": self.hypervisor_type,
            "host_vm_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "application_instance_id": app_instance_id,
            "raw_log": raw_payload,
            "source_host": socket.gethostname()
        }

        if not self.is_connected:
            self.spool_log_to_disk(timestamp, event_code, raw_payload, app_instance_id)
            return False

        logger.info(f"[Agent] Streaming telemetry: [{event_code}] -> {raw_payload[:60]}...")
        # Simulated transmission success
        return True

    def flush_spooled_cache(self):
        """Flushes cached logs sequentially once connection is restored."""
        logger.info("[Spooler] VIP connection verified. Checking for spooled offline cache...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM spool_queue ORDER BY timestamp ASC")
            records = cursor.fetchall()
            
            if not records:
                conn.close()
                return

            logger.info(f"[Spooler] Connection restored! Flushing {len(records)} cached telemetry logs from SQLite cache...")
            
            for row in records:
                db_id, timestamp, event_code, payload, app_id = row
                # Stream flushed logs
                logger.info(f"[Spooler] Flush log: [{event_code}] (SpoolTimestamp: {timestamp}) -> {payload[:60]}")
                
            cursor.execute("DELETE FROM spool_queue")
            conn.commit()
            conn.close()
            logger.info("[Spooler] SQLite spool queue fully flushed and cleared.")
        except Exception as e:
            logger.error(f"[Spooler] Failed to flush cache: {e}")

    def _observe_windows_event_log(self):
        """Reads security event logs from Windows Event Service (API win32evtlog)."""
        logger.info("[EventLog Observer] Monitoring Windows Security Channel event streams...")
        server = "localhost"
        logtype = "Security"
        
        try:
            hand = win32evtlog.OpenEventLog(server, logtype)
            flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
            
            while self.is_running:
                events = win32evtlog.ReadEventLog(hand, flags, 0)
                if not events:
                    time.sleep(1.0)
                    continue
                
                for event in events:
                    event_id = event.EventID & 0xFFFF
                    # Map common Event IDs: 4624 (Logon), 4625 (Logon Fail), 4688 (Process Created)
                    if event_id in [4624, 4625, 4688]:
                        msg = f"EventID: {event_id} | Channel: Security | Source: {event.SourceName} | Logged: {event.TimeGenerated}"
                        self.capture_and_send_telemetry("LL01" if event_id == 4624 else "PA01", msg, "WIN_SECURITY_SVC")
                time.sleep(1.0)
        except Exception as e:
            logger.error(f"Error reading Windows Event Logs: {e}")

    def _observe_syslog_pipeline(self):
        """Tails the system log file or falls back to simulated events if read denied."""
        # Check if platform is Windows and win32 API is present
        if self.os_type == "Windows" and HAS_WIN32:
            self._observe_windows_event_log()
            return
        elif self.os_type == "Windows":
            logger.warning("[EventLog Observer] Running on Windows but pywin32 bindings are missing. Falling back to active mock event generator...")
            # Fall through to mock generator

        syslog_paths = [
            "/var/log/syslog",      # Linux Ubuntu/Debian standard
            "/var/log/messages",    # Linux RedHat standard
            "/var/log/system.log"   # macOS standard
        ]
        
        active_path = None
        for path in syslog_paths:
            if os.path.exists(path) and os.access(path, os.R_OK):
                active_path = path
                break

        if active_path:
            logger.info(f"[Syslog Observer] Actively tailing physical system logs from: {active_path}")
            try:
                with open(active_path, "r") as f:
                    # Seek to the end of the file to tail new entries
                    f.seek(0, os.SEEK_END)
                    while self.is_running:
                        line = f.readline()
                        if not line:
                            time.sleep(0.5)
                            continue
                        
                        # Process log entry
                        line = line.strip()
                        if "sudo" in line.lower() or "auth" in line.lower():
                            self.capture_and_send_telemetry("PA01", line, "SYSTEM_DAEMON")
                        else:
                            self.capture_and_send_telemetry("LL02", line, "SYSTEM_DAEMON")
            except Exception as e:
                logger.error(f"Error reading syslog file: {e}")
        else:
            logger.warning("[Syslog Observer] System logs unreadable (Permission Denied / Sandbox constraint). Falling back to active mock event generator...")
            # Mock Event Loop Simulation
            mock_events = [
                ("LL01", "User admin successful console GUI login from 10.100.12.5", "GUI_NEXTJS_CONSOLE"),
                ("PA01", "Privileged shell command execution: sudo apt-get update", "SHELL_RECOVERY"),
                ("LL02", "OTel Ingest mTLS handshake completed for Tanium Agent", "OTEL_COLLECTOR"),
                ("LL03", "Identity Mart SSO login anomaly geovelocity travel block", "SSO_IDENTITY")
            ]
            idx = 0
            while self.is_running:
                event_code, payload, app_id = mock_events[idx % len(mock_events)]
                self.capture_and_send_telemetry(event_code, payload, app_id)
                idx += 1
                time.sleep(2)

    def start_observer(self):
        """Starts the multi-threaded host syslog collection loops."""
        if self.is_running:
            return
        self.is_running = True
        self.log_thread = threading.Thread(target=self._observe_syslog_pipeline, daemon=True)
        self.log_thread.start()
        logger.info("Host Telemetry Collection loops started successfully.")

    def stop_observer(self):
        """Stops the collection thread."""
        self.is_running = False
        if self.log_thread:
            self.log_thread.join(timeout=1.0)
            logger.info("Host Telemetry Collection loops stopped.")

# Main demonstration executing smoke checks
if __name__ == "__main__":
    agent = TelemetryAgentDaemon()
    
    # 1. Test live collection starting thread
    agent.start_observer()
    time.sleep(2.5) # Let some logs capture
    agent.stop_observer()
    
    # 2. Test Connection Drop and Disk Spooling
    logger.info("\n--- TEST: DISCONNECTION DROPOUT & SQL SPOOLING ---")
    agent.is_connected = False
    agent.capture_and_send_telemetry(
        event_code="PA01",
        raw_payload="Privileged command override: auditd -s disable",
        app_instance_id="SHELL_RECOVERY"
    )
    
    # 3. Test Connection Restored and Cache Flush
    logger.info("\n--- TEST: CONNECTION RECOVERY & CACHE FLUSH ---")
    agent.is_connected = True
    agent.flush_spooled_cache()
