#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lifecycle Data-Tiering & Cold Storage Archiver (Module 4.1 & 4.2)
Compresses 180-day-old active warm partitions into columnar Apache Parquet archives,
writing them to on-premises Object Storage (Ceph/MinIO) under strict WORM compliance locks.
"""

import sys
import os
import json
import logging
import time
import hashlib

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("LifecycleArchiver")

class ParquetArchiver:
    def __init__(self, storage_path: str = "/var/lib/secops/data/archive/"):
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)
        logger.info(f"Initializing Module 4 Lifecycle Archiver. Target cold storage path: {self.storage_path}")

    def archive_partition(self, partition_key: str, active_records: List[Dict[str, Any]]) -> Optional[str]:
        """
        Simulates exporting active ClickHouse warm partitions, compressing into Apache Parquet format,
        and locking the files with a strict Write-Once, Read-Many (WORM) configuration.
        """
        if not active_records:
            logger.warning(f"No records found for partition: {partition_key}. Skipping archival.")
            return None

        logger.info(f"Aging partitioned warm data out of ClickHouse for slice: {partition_key}...")
        logger.info(f"Compressing {len(active_records)} record(s) into highly dense Apache Parquet structure...")
        
        # Simulate Parquet file creation
        filename = f"secops_cold_{partition_key}_{int(time.time())}.parquet"
        filepath = os.path.join(self.storage_path, filename)
        
        # Convert records to string data to write (simulating compressed Parquet columnar writes)
        try:
            with open(filepath, "w") as f:
                json.dump(active_records, f, indent=2)
            
            # Enforce WORM Lock / Read-Only permissions on file system level
            # In production, this uses Ceph object lock parameters. Locally, we set read-only flags (444)
            os.chmod(filepath, 0o444)
            
            logger.info(f" -> Parquet File Written: {filename}")
            logger.info(" -> Enforcing WORM compliance lock: Write Once, Read Many.")
            logger.info(f" -> Permissions locked on disk: {oct(os.stat(filepath).st_mode & 0o777)}")
            
            return filepath
        except Exception as e:
            logger.error(f"Archival failed: {e}")
            return None

# Demonstration and Smoke Test
if __name__ == "__main__":
    archiver = ParquetArchiver()
    
    # Mock ClickHouse warm telemetry records older than 180 days
    mock_warm_records = [
        {
            "timestamp": "2025-11-20T10:14:55.000Z",
            "event_code": "LL01",
            "virtual_entity_id": "[TYPE 1 ESXI]+[f47ac10b-58cc-4372-a567-0e02b2c3d479]+[APP_WORKDAY_01]",
            "raw_log": "Console successful login: employee ID EMP293",
            "adjusted_priority": "LOW"
        },
        {
            "timestamp": "2025-11-20T10:15:30.000Z",
            "event_code": "AO04", # Break-Glass Emergency
            "virtual_entity_id": "APPLIANCE_HOST_VM",
            "raw_log": "Break-Glass console recovery login triggered via local serial tty1",
            "adjusted_priority": "EMERGENCY"
        }
    ]

    # Run Test
    archive_path = archiver.archive_partition(partition_key="202511", active_records=mock_warm_records)
    
    # Verify Read-Only locking
    if archive_path and os.path.exists(archive_path):
        logger.info("\n--- TEST: ATTEMPTING MODIFICATION OF LOCKED WORM FILE ---")
        try:
            with open(archive_path, "a") as f:
                f.write("\nAttempting unauthorized modification!")
            logger.error("Test Failed: WORM file modification was unexpectedly allowed.")
        except IOError:
            logger.info("🟢 SUCCESS: Modification blocked! The file is successfully WORM-locked.")

        # Clean up local test state
        # In actual appliance, these files remain immutable on Ceph.
        # We must restore permissions to allow clean cleanup in local git workspace!
        os.chmod(archive_path, 0o644)
        os.remove(archive_path)
