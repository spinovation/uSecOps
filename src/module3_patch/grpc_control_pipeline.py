#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gRPC Control Plane & Secure Upgrade Pipeline Simulator (Module 3)
Features bi-directional secure control channels, dual-signature cryptographic validation,
and automated canary rollout checks.
"""

import sys
import json
import logging
import hashlib
import hmac
import socket
import threading
import time
from typing import Dict, Any, Tuple

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("gRPCControlPlane")

# Mock Cryptographic Keys for Dual-Signature Verification
# In production, these are 2048-bit RSA/ECC public-private key pairs.
# For this simulator, we employ secure HMAC-SHA256 signature tokens.
DEV_SIGNING_KEY = b"offline_developer_secure_private_key_001"
ADMIN_SIGNING_KEY = b"security_administrator_approval_private_key_002"

AGENT_TRUSTED_DEV_PUBKEY = b"offline_developer_secure_private_key_001"
AGENT_TRUSTED_ADMIN_PUBKEY = b"security_administrator_approval_private_key_002"

class SecurityAgentClient:
    """
    Lightweight Telemetry Agent - gRPC Client Connection Simulator.
    Runs on endpoints, receives patches, and locally validates cryptographic signatures.
    """
    def __init__(self, agent_id: str, host: str = "127.0.0.1", port: int = 50051):
        self.agent_id = agent_id
        self.host = host
        self.port = port
        self.is_running = True
        self.current_version = "1.0.0"

    def verify_dual_signatures(self, patch_payload: bytes, dev_sig: str, admin_sig: str) -> bool:
        """
        Dual-Signature Trust Verification Engine.
        Verifies that BOTH signatures are cryptographically valid before execution.
        """
        # 1. Verify Developer Signature
        expected_dev_sig = hmac.new(AGENT_TRUSTED_DEV_PUBKEY, patch_payload, hashlib.sha256).hexdigest()
        is_dev_valid = hmac.compare_digest(expected_dev_sig, dev_sig)

        # 2. Verify Admin Signature
        expected_admin_sig = hmac.new(AGENT_TRUSTED_ADMIN_PUBKEY, patch_payload, hashlib.sha256).hexdigest()
        is_admin_valid = hmac.compare_digest(expected_admin_sig, admin_sig)

        logger.info(f"[Agent {self.agent_id}] Cryptographic Verification Status:")
        logger.info(f" -> Developer Signature Valid?     : {is_dev_valid}")
        logger.info(f" -> Administrator Signature Valid? : {is_admin_valid}")

        return is_dev_valid and is_admin_valid

    def apply_patch(self, patch_data: Dict[str, Any]) -> bool:
        """
        Simulates local installation of configuration hotfixes or package upgrades.
        """
        patch_type = patch_data.get("type", "CONFIG")
        target_version = patch_data.get("target_version", "1.0.0")
        
        logger.info(f"[Agent {self.agent_id}] Initializing update sequence to: v{target_version}...")
        
        # Simulate installation process
        time.sleep(0.5)
        
        if patch_type == "CONFIG":
            logger.info(f"[Agent {self.agent_id}] Successfully applied secure hotfix override configuration.")
        else:
            logger.info(f"[Agent {self.agent_id}] Successfully upgraded agent binary runtime to v{target_version}.")
            self.current_version = target_version
            
        return True

    def start_listen_loop(self):
        """Starts a background thread listening for control plane gRPC push payloads."""
        def run():
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((self.host, self.port + 1))  # Bind to agent listen port
                s.listen(1)
                logger.info(f"[Agent {self.agent_id}] gRPC Control stream listening on {self.host}:{self.port + 1}...")
                
                while self.is_running:
                    conn, addr = s.accept()
                    data = conn.recv(4096)
                    if not data:
                        continue
                    
                    # Parse gRPC JSON-framed envelope
                    envelope = json.loads(data.decode('utf-8'))
                    payload_bytes = envelope["payload"].encode('utf-8')
                    dev_sig = envelope["dev_signature"]
                    admin_sig = envelope["admin_signature"]
                    
                    logger.info(f"\n[Agent {self.agent_id}] Received control plane gRPC payload push package!")
                    
                    # Cryptographic check
                    if self.verify_dual_signatures(payload_bytes, dev_sig, admin_sig):
                        patch_data = json.loads(envelope["payload"])
                        success = self.apply_patch(patch_data)
                        response = {"status": "SUCCESS" if success else "FAILED", "version": self.current_version}
                    else:
                        logger.error(f"[Agent {self.agent_id}] CRITICAL: Cryptographic signature mismatch! Aborting update.")
                        response = {"status": "CRITICAL_SIGNATURE_VERIFICATION_FAILED", "version": self.current_version}
                    
                    conn.sendall(json.dumps(response).encode('utf-8'))
                    conn.close()
            except Exception as e:
                if self.is_running:
                    logger.error(f"[Agent {self.agent_id}] Error in control stream connection: {e}")
            finally:
                s.close()
        
        t = threading.Thread(target=run, daemon=True)
        t.start()

class DeploymentControlServer:
    """
    Centralized Go-based Patch & Deployment Server.
    Authenticates updates, handles developer and admin dual-signing, and orchestrates canary rollouts.
    """
    def __init__(self, host: str = "127.0.0.1", port: int = 50051):
        self.host = host
        self.port = port

    def sign_patch(self, payload: Dict[str, Any], dev_key: bytes, admin_key: bytes) -> Dict[str, Any]:
        """
        Dual-Signature Signing Core: Simulates offline developers and active admins signing the patch.
        """
        payload_str = json.dumps(payload)
        payload_bytes = payload_str.encode('utf-8')

        # 1. Developer Sign
        dev_sig = hmac.new(dev_key, payload_bytes, hashlib.sha256).hexdigest()
        
        # 2. Admin Sign
        admin_sig = hmac.new(admin_key, payload_bytes, hashlib.sha256).hexdigest()

        # Build secure transport envelope
        envelope = {
            "payload": payload_str,
            "dev_signature": dev_sig,
            "admin_signature": admin_sig
        }
        return envelope

    def push_patch_to_agent(self, envelope: Dict[str, Any], agent_port: int) -> Dict[str, Any]:
        """
        Pushes signed patch over secure control channels (Simulating gRPC streams).
        """
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.connect((self.host, agent_port))
            s.sendall(json.dumps(envelope).encode('utf-8'))
            response_data = s.recv(1024)
            return json.loads(response_data.decode('utf-8'))
        except Exception as e:
            logger.error(f"[Control Server] Failed to establish gRPC control stream connection to agent: {e}")
            return {"status": "UNREACHABLE"}
        finally:
            s.close()

# Demonstration and Smoke Test
if __name__ == "__main__":
    logger.info("Starting gRPC Control Plane Pipeline Simulation...")

    # 1. Initialize and Start Lightweight Agent Client (VLAN 101 endpoint)
    agent = SecurityAgentClient(agent_id="AGENT-HOST-095")
    agent.start_listen_loop()
    time.sleep(0.5)

    # 2. Initialize Centralized Patch & Deployment Server
    server = DeploymentControlServer()

    # Define Patch payload: Mitigating django ReDoS configuration override
    remediation_payload = {
        "type": "CONFIG",
        "target_version": "1.0.1",
        "remediation_id": "REMED-2026-004",
        "hotfix_rule": "SecRule REQUEST_URI '@rx (?i)(?:[a-z0-9_-]{1,100}){1,10}' 'deny'"
    }

    # --- SCENARIO 1: VALID DUAL-SIGNATURE PUSH ---
    logger.info("\n==================================================")
    logger.info("SCENARIO 1: PUSHING DUAL-SIGNED remidiation PATCH")
    logger.info("==================================================")
    
    # Sign patch with valid developer AND admin keys
    signed_envelope_valid = server.sign_patch(
        remediation_payload, 
        dev_key=DEV_SIGNING_KEY, 
        admin_key=ADMIN_SIGNING_KEY
    )
    
    # Push patch to Agent (listening on port 50052)
    response_1 = server.push_patch_to_agent(signed_envelope_valid, agent_port=50052)
    logger.info(f"[Control Server] Agent Update Response Status: {response_1['status']}")


    # --- SCENARIO 2: TAMPERED / EXPLOITED SERVER PUSH ---
    logger.info("\n==================================================")
    logger.info("SCENARIO 2: PUSHING TAMPERED PATCH (INVALID SIGNATURE)")
    logger.info("==================================================")
    
    # Simulating a compromised deployment server attempting to push a patch
    # signed with a dummy/compromised administrator private key.
    COMPROMISED_ADMIN_KEY = b"rogue_attacker_fake_private_key_999"
    
    signed_envelope_tampered = server.sign_patch(
        remediation_payload, 
        dev_key=DEV_SIGNING_KEY, 
        admin_key=COMPROMISED_ADMIN_KEY # Fake Key
    )
    
    response_2 = server.push_patch_to_agent(signed_envelope_tampered, agent_port=50052)
    logger.info(f"[Control Server] Agent Update Response Status: {response_2['status']}")

    # Shutdown simulator
    agent.is_running = False
    logger.info("\ngRPC Control Plane Simulation Completed Successfully.")
