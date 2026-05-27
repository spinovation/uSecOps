#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Virtual Entity Demultiplexing Engine (Module 1 Ingestion Pre-Processor)
Maps composite keys to isolate multiple application logs hosted on the same OS/VM.
Formula: Virtual Entity ID = [Hypervisor Type] + [Host VM UUID] + [Application Instance ID]
"""

import sys
import json
import logging
from typing import Dict, Any, Optional

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("EntityDemuxEngine")

class EntityDemuxEngine:
    def __init__(self):
        logger.info("Initializing Virtual Entity Demultiplexing Engine...")

    def generate_virtual_entity_id(self, hypervisor_type: str, host_vm_uuid: str, application_instance_id: str) -> str:
        """
        Generates the standard composite Virtual Entity ID.
        """
        h_type = (hypervisor_type or "UNKNOWN").upper().strip()
        v_uuid = (host_vm_uuid or "00000000-0000-0000-0000-000000000000").lower().strip()
        app_id = (application_instance_id or "BASE_OS").upper().strip()
        
        return f"[{h_type}]+[{v_uuid}]+[{app_id}]"

    def process_incoming_log(self, raw_payload: str) -> Optional[Dict[str, Any]]:
        """
        Parses and demultiplexes incoming telemetry.
        Attaches the standard composite virtual_entity_id.
        """
        try:
            event = json.loads(raw_payload)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse raw JSON payload: {e}")
            return None

        # Extract composite fields
        hypervisor_type = event.get("hypervisor_type", "Bare-Metal_ESXi")
        host_vm_uuid = event.get("host_vm_uuid", "f47ac10b-58cc-4372-a567-0e02b2c3d479")
        
        # Check if log contains multiple application logs that need to be demuxed
        applications = event.get("active_applications", [])
        
        # If no distinct applications are listed, treat it as a base system host VM log
        if not applications:
            virtual_entity_id = self.generate_virtual_entity_id(hypervisor_type, host_vm_uuid, "BASE_OS")
            event["virtual_entity_id"] = virtual_entity_id
            event["application_instance_id"] = "BASE_OS"
            return [event]

        # Demultiplex: generate distinct events for each application hosted on the VM
        demuxed_events = []
        for app in applications:
            app_id = app.get("application_instance_id")
            if not app_id:
                continue
                
            # Create a clone of the base OS event context for this specific virtual entity scope
            app_event = event.copy()
            
            # Remove high-level nested arrays to keep the schema clean
            if "active_applications" in app_event:
                del app_event["active_applications"]
                
            # Enrich app specific contexts
            app_event["application_instance_id"] = app_id
            app_event["application_accessed"] = app.get("application_name", "UNKNOWN")
            
            # Generate composite key
            virtual_entity_id = self.generate_virtual_entity_id(hypervisor_type, host_vm_uuid, app_id)
            app_event["virtual_entity_id"] = virtual_entity_id
            
            # Append demuxed target event
            demuxed_events.append(app_event)
            logger.debug(f"Demultiplexed event into virtual entity: {virtual_entity_id}")

        return demuxed_events

# Demonstration and Smoke Test
if __name__ == "__main__":
    engine = EntityDemuxEngine()
    
    # Mock Event: Single VM hosting two distinct apps (Workday and Oracle)
    mock_payload = {
        "timestamp": "2026-05-27T01:00:00.000Z",
        "event_code": "LL01",
        "hypervisor_type": "Type 1 ESXi",
        "host_vm_uuid": "3e9b11e0-c820-410a-8bf8-d38a8e3d43b2",
        "actor_user_id": "ADM092",
        "source_ip": "10.100.1.5",
        "source_host": "Hypervisor-Host-01",
        "active_applications": [
            {"application_instance_id": "APP_WORKDAY_01", "application_name": "Workday"},
            {"application_instance_id": "APP_ORACLE_DB_04", "application_name": "Oracle DB"}
        ],
        "raw_log": "Successful system administrative logon via virtual hypervisor channel"
    }
    
    logger.info("Executing smoke test on mock telemetry payload...")
    results = engine.process_incoming_log(json.dumps(mock_payload))
    
    if results:
        logger.info(f"Successfully processed and demultiplexed payload into {len(results)} separate event(s):")
        for i, res in enumerate(results, 1):
            print(f"\n--- DEMUXED EVENT #{i} ---")
            print(json.dumps(res, indent=4))
    else:
        logger.error("Processing failed.")
