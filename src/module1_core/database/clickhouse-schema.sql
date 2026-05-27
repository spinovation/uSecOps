-- ClickHouse Security Data Lakehouse Schema Definitions
-- Optimized for 180-Day Warm Analytics with Columnar Partitioning

CREATE DATABASE IF NOT EXISTS secops_lakehouse;

USE secops_lakehouse;

-- 1. WINDOWS TELEMETRY MART (dm_windows)
CREATE TABLE IF NOT EXISTS dm_windows (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    hypervisor_type LowCardinality(String),
    host_vm_uuid UUID,
    application_instance_id LowCardinality(String),
    actor_user_id String,
    target_user_id String,
    user_email String,
    domain LowCardinality(String),
    source_ip IPv4,
    source_port UInt16,
    destination_ip IPv4,
    destination_port UInt16,
    source_host String,
    destination_host String,
    application_accessed LowCardinality(String),
    windows_event_id UInt32,
    channel LowCardinality(String),
    task_category LowCardinality(String),
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, windows_event_id)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 2. LINUX TELEMETRY MART (dm_linux)
CREATE TABLE IF NOT EXISTS dm_linux (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    hypervisor_type LowCardinality(String),
    host_vm_uuid UUID,
    application_instance_id LowCardinality(String),
    actor_user_id String,
    target_user_id String,
    user_email String,
    source_ip IPv4,
    destination_ip IPv4,
    source_host String,
    destination_host String,
    process_name LowCardinality(String),
    pid UInt32,
    syscall LowCardinality(String),
    command_executed String,
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, process_name)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 3. FIREWALL TELEMETRY MART (dm_firewall)
CREATE TABLE IF NOT EXISTS dm_firewall (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    source_ip IPv4,
    source_port UInt16,
    destination_ip IPv4,
    destination_port UInt16,
    protocol LowCardinality(String),
    action LowCardinality(String), -- e.g., ALLOW, DENY, DROP
    bytes_sent UInt64,
    bytes_received UInt64,
    firewall_rule_id LowCardinality(String),
    tenant_id LowCardinality(String),
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, source_ip, destination_ip)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 4. PROXY TELEMETRY MART (dm_proxy)
CREATE TABLE IF NOT EXISTS dm_proxy (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    user_id String,
    source_ip IPv4,
    destination_url String,
    http_method LowCardinality(String),
    http_status_code UInt16,
    user_agent String,
    dns_query String,
    dns_resolved_ip IPv4,
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, user_id, destination_url)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 5. IDENTITY & GOVERNANCE MART (dm_identity)
CREATE TABLE IF NOT EXISTS dm_identity (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    actor_user_id String,
    target_user_id String,
    user_email String,
    identity_provider LowCardinality(String), -- e.g., Okta, Entra ID
    access_governance_platform LowCardinality(String), -- e.g., SailPoint, Saviynt
    entitlement_name String,
    approval_status LowCardinality(String),
    certification_status LowCardinality(String),
    mfa_method LowCardinality(String),
    mfa_device_id String,
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, actor_user_id, target_user_id)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 6. LEGACY TELEMETRY MART (dm_legacy)
CREATE TABLE IF NOT EXISTS dm_legacy (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    virtual_entity_id String,
    system_type LowCardinality(String), -- e.g., AS/400, z/OS, Tandem
    actor_user_id String,
    target_user_id String,
    mainframe_lpar LowCardinality(String),
    legacy_journal_entry LowCardinality(String), -- e.g., SMF80, QAUDJRN
    command_executed String,
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (virtual_entity_id, event_code, timestamp)
ORDER BY (virtual_entity_id, event_code, timestamp, system_type, mainframe_lpar)
TTL timestamp + INTERVAL 180 DAY DELETE;


-- 7. APPLIANCE SELF-AUDITING & EMERGENCY MART (dm_appliance_self_audit)
CREATE TABLE IF NOT EXISTS dm_appliance_self_audit (
    timestamp DateTime64(6, 'UTC') CODEC(DoubleDelta, LZ4),
    event_code LowCardinality(String),
    source_component LowCardinality(String), -- e.g., GUI_NextJS, CLI_Auditd, PAM_Gate, BreakGlass
    actor_user_id String,
    source_ip IPv4,
    terminal_tty LowCardinality(String),
    action_category LowCardinality(String),
    keystrokes_captured String CODEC(ZSTD(3)),
    command_executed String,
    justification_typed String,
    cryptographic_key_id String,
    alert_severity LowCardinality(String), -- e.g., INFO, WARN, CRITICAL, EMERGENCY
    raw_log String CODEC(ZSTD(3))
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (event_code, timestamp)
ORDER BY (event_code, timestamp, alert_severity, actor_user_id)
TTL timestamp + INTERVAL 180 DAY DELETE;
