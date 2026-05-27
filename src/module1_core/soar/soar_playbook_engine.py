#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SOAR Playbook Orchestration Engine Prototype (Module 1.4 SOAR Core)
Parses playbook workflow configurations, executes targeted containment actions,
and enforces strict human-in-the-loop supervisor approval gates for high-impact steps.
"""

import sys
import json
import logging
import uuid
import time
from typing import Dict, Any, List

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("SOAREngine")

class SOARPlaybookEngine:
    def __init__(self):
        logger.info("Initializing SOAR Playbook Orchestration Engine...")
        self.active_runs = {}

    def execute_connector_action(self, action_name: str, target: str) -> Dict[str, Any]:
        """
        Remediation Connectors: Simulates execution of low-level containment actions
        across segmented networks and directories.
        """
        logger.info(f"[SOAR Connector] Executing containment action: {action_name} on target: '{target}'...")
        time.sleep(0.5) # Simulate network response latency

        if action_name == "disable_directory_account":
            # Simulates Active Directory / SSO user lockout
            logger.info(f"[AD/SSO Connector] User '{target}' has been disabled in Active Directory domain controller.")
            return {"status": "SUCCESS", "message": f"User account {target} suspended."}
            
        elif action_name == "isolate_endpoint_host":
            # Simulates OTel agent local network isolation rule
            logger.info(f"[Agent Connector] Isolation command pushed to agent '{target}' via vNIC 1.")
            logger.info(f"[Agent Connector] Local loopback and SecOps ingestion are active; all other egress blocked.")
            return {"status": "SUCCESS", "message": f"Host {target} isolated."}
            
        elif action_name == "block_firewall_ip":
            # Simulates pushing null routes or block rules to corporate gateways
            logger.info(f"[Firewall Connector] IP '{target}' added to blocklist in Firewall Mart.")
            return {"status": "SUCCESS", "message": f"IP {target} null-routed."}
            
        else:
            logger.error(f"[SOAR Connector] Unknown remediation action: {action_name}")
            return {"status": "FAILED", "message": "Unknown action"}

    def run_playbook(self, case_id: str, playbook_config: Dict[str, Any]) -> str:
        """
        Runs a parsed JSON security playbook workflow step-by-step.
        """
        run_id = str(uuid.uuid4())
        playbook_name = playbook_config.get("name", "Unnamed Playbook")
        logger.info(f"\n--- Initiating SOAR Playbook Run: {playbook_name} (ID: {run_id}) ---")
        
        self.active_runs[run_id] = {
            "case_id": case_id,
            "playbook_name": playbook_name,
            "steps": playbook_config.get("steps", []),
            "current_step_index": 0,
            "status": "IN_PROGRESS",
            "history": []
        }
        
        return self._resume_playbook(run_id)

    def _resume_playbook(self, run_id: str) -> str:
        """
        Resumes execution of the playbook from the current step.
        Supports halting and resuming when supervisor approvals are cleared.
        """
        run = self.active_runs[run_id]
        steps = run["steps"]
        start_index = run["current_step_index"]

        for i in range(start_index, len(steps)):
            step = steps[i]
            step_name = step.get("step_name", f"Step {i}")
            action = step.get("action")
            target = step.get("target")
            high_impact = step.get("high_impact", False)

            logger.info(f"\n[Playbook Step {i+1}/{len(steps)}] Executing: {step_name}")

            # 1. Enforce Human-in-the-Loop Gate for High-Impact Remediation Actions
            if high_impact and run["status"] != "SUPERVISOR_APPROVED":
                run["status"] = "WAITING_APPROVAL"
                run["current_step_index"] = i
                
                logger.warning(f"[Supervisor Gate] CRITICAL: '{step_name}' is marked as HIGH IMPACT!")
                logger.warning(f"[Supervisor Gate] Execution halted for Case ID {run['case_id']}.")
                logger.warning("[Supervisor Gate] Action requires manual supervisor approval verification token.")
                
                # In PostgreSQL, we would update playbook_runs.status = 'WAITING_APPROVAL'
                return run["status"]

            # 2. Execute Action if approved or low impact
            res = self.execute_connector_action(action, target)
            run["history"].append({
                "step": step_name,
                "action": action,
                "target": target,
                "result": res
            })

            # Reset temporary approved status for subsequent steps
            if run["status"] == "SUPERVISOR_APPROVED":
                run["status"] = "IN_PROGRESS"

        run["status"] = "COMPLETED"
        logger.info(f"\n=== SOAR Playbook Run '{run['playbook_name']}' Completed Successfully ===")
        return run["status"]

    def approve_high_impact_step(self, run_id: str, supervisor_token: str) -> str:
        """
        Approves a halted high-impact step, validating the authorization token.
        """
        if run_id not in self.active_runs:
            logger.error("Playbook run ID not active.")
            return "NOT_FOUND"

        run = self.active_runs[run_id]
        if run["status"] != "WAITING_APPROVAL":
            logger.warning("Playbook run is not waiting for supervisor approval.")
            return run["status"]

        # Simple verification of supervisor credentials / token
        if supervisor_token == "SUPV-AUTH-SECURE-KEY-2026":
            logger.info(f"\n[Supervisor Gate] Authorization Token verified for Supervisor ID: SUPV-091.")
            logger.info(f"[Supervisor Gate] Resuming playbook execution for Case ID: {run['case_id']}...")
            run["status"] = "SUPERVISOR_APPROVED"
            return self._resume_playbook(run_id)
        else:
            logger.error("[Supervisor Gate] Access Denied: Invalid supervisor approval token.")
            return "APPROVAL_REJECTED"


# Demonstration and Smoke Test
if __name__ == "__main__":
    engine = SOARPlaybookEngine()
    
    # 1. Define typical JSON-based Account Takeover (ATO) Containment Playbook
    ato_playbook = {
        "name": "Account Takeover (ATO) Containment Playbook",
        "steps": [
            {
                "step_name": "Block Attacker Egress IP",
                "action": "block_firewall_ip",
                "target": "185.220.101.5",
                "high_impact": False
            },
            {
                "step_name": "Isolate Compromised Host VM",
                "action": "isolate_endpoint_host",
                "target": "VM-AD-CONTROLLER-02",
                "high_impact": True # Requires supervisor gate to prevent accidental active host lockouts!
            },
            {
                "step_name": "Suspend Compromised User Credentials",
                "action": "disable_directory_account",
                "target": "john.doe@spinovation.com",
                "high_impact": False
            }
        ]
    }

    mock_case_id = str(uuid.uuid4())
    
    # 2. Run Playbook - Should run Step 1 successfully and halt at Step 2 (High Impact)
    run_status_1 = engine.run_playbook(case_id=mock_case_id, playbook_config=ato_playbook)
    active_run_id = list(engine.active_runs.keys())[0]
    logger.info(f"Current Playbook Status: {run_status_1}")

    # 3. Approve Step 2 using an INVALID token
    logger.info("\n--- ATTEMPTING APPROVAL WITH INVALID TOKEN ---")
    engine.approve_high_impact_step(run_id=active_run_id, supervisor_token="BAD-TOKEN")

    # 4. Approve Step 2 using the VALID supervisor token
    logger.info("\n--- APPROVING STEP WITH VALID SUPERVISOR TOKEN ---")
    final_status = engine.approve_high_impact_step(
        run_id=active_run_id, 
        supervisor_token="SUPV-AUTH-SECURE-KEY-2026"
    )
    logger.info(f"Final Playbook Status: {final_status}")
