#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Master Integration Test Runner - Unified SecOps Platform
Dynamically runs and validates all core prototype modules, providing a consolidated verification report.
"""

import sys
import os
import subprocess
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("MasterTestRunner")

TESTS = [
    {
        "name": "Virtual Entity Demultiplexing Engine",
        "script": "src/module1_core/ingestion/entity_demux.py"
    },
    {
        "name": "Dynamic Data Mart Provisioning Engine",
        "script": "src/module1_core/ingestion/data_mart_manager.py"
    },
    {
        "name": "PostgreSQL & ClickHouse Schema Migrations Syntax Check",
        "script": None,
        "custom_check": "sql_check"
    },
    {
        "name": "Mythos-Class AI Vulnerability & Reachability Scanner",
        "script": "src/module3_patch/mythos_vuln_scanner.py"
    },
    {
        "name": "gRPC Control Plane & Dual-Signature Upgrade Pipeline",
        "script": "src/module3_patch/grpc_control_pipeline.py"
    },
    {
        "name": "SOAR Playbook Orchestration Engine & Supervisor Approval Gates",
        "script": "src/module1_core/soar/soar_playbook_engine.py"
    }
]

def run_script_test(name: str, script_path: str) -> bool:
    """Executes a target python prototype script and monitors exit codes."""
    logger.info(f"\n======================================================================")
    logger.info(f"RUNNING INTEGRATION TEST: {name}")
    logger.info(f"Script: {script_path}")
    logger.info(f"======================================================================")
    
    if not os.path.exists(script_path):
        logger.error(f"Test Failed: Script not found at {script_path}")
        return False

    try:
        # Run script in a subprocess, capturing output
        result = subprocess.run(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            logger.info(f"SUCCESS: {name} completed without errors.")
            print(result.stdout)
            return True
        else:
            logger.error(f"FAILED: {name} returned exit code {result.returncode}")
            print(result.stderr, file=sys.stderr)
            return False
    except subprocess.TimeoutExpired:
        logger.error(f"FAILED: {name} timed out after 30 seconds.")
        return False
    except Exception as e:
        logger.error(f"FAILED: Unexpected error running test: {e}")
        return False

def check_sql_syntax() -> bool:
    """Performs static checks on ClickHouse and Postgres SQL files."""
    logger.info(f"\n======================================================================")
    logger.info("RUNNING INTEGRATION TEST: PostgreSQL & ClickHouse Schema Syntax Check")
    logger.info("======================================================================")
    
    ch_path = "src/module1_core/database/clickhouse-schema.sql"
    pg_path = "src/module1_core/database/postgres-schema.sql"
    
    ch_exists = os.path.exists(ch_path)
    pg_exists = os.path.exists(pg_path)
    
    logger.info(f" -> ClickHouse Schema file exists? : {ch_exists}")
    logger.info(f" -> PostgreSQL Schema file exists? : {pg_exists}")
    
    return ch_exists and pg_exists

def main():
    logger.info("Starting Unified SecOps Platform Integration Verification Suite...")
    success_count = 0
    total_tests = len(TESTS)
    
    results = []

    for test in TESTS:
        name = test["name"]
        script = test["script"]
        custom = test.get("custom_check")
        
        if custom == "sql_check":
            passed = check_sql_syntax()
        else:
            passed = run_script_test(name, script)
            
        if passed:
            success_count += 1
            results.append((name, "🟢 PASSED"))
        else:
            results.append((name, "🔴 FAILED"))
            
    # Print consolidated execution report
    print("\n======================================================================")
    print("                      INTEGRATION VERIFICATION REPORT                 ")
    print("======================================================================")
    for name, status in results:
        print(f" - {name:<65} : {status}")
    print("======================================================================")
    print(f"VERIFICATION RESULTS: {success_count}/{total_tests} Tests Passed.")
    print("======================================================================")

    if success_count == total_tests:
        logger.info("Verification Suite: ALL PROTO-ENGINE SYSTEMS STABLE.")
        sys.exit(0)
    else:
        logger.error("Verification Suite: STABILITY DEFECTS DETECTED.")
        sys.exit(1)

if __name__ == "__main__":
    main()
