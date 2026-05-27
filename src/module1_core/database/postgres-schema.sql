-- PostgreSQL Transactional Database Schema for Case Ticketing & SOAR Playbooks
-- Engineered for Relational, ACID-compliant OLTP workflows on-premises

-- Enable UUID extension for secure, unguessable identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ANALYST ACCOUNTS (users)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Analyst', -- Analyst, Supervisor, Administrator
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CASES / INCIDENTS (cases)
CREATE TABLE IF NOT EXISTS cases (
    case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, ASSIGNED, UNDER_INVESTIGATION, RESOLVED, CLOSED
    assignee_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    mitre_tactic VARCHAR(100),
    mitre_technique VARCHAR(100),
    blast_radius_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INGESTED ALERTS ASSOCIATED WITH CASES (alerts)
-- Maps to high-level alarms triggered from ClickHouse warm database
CREATE TABLE IF NOT EXISTS alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    event_code VARCHAR(10) NOT NULL,
    virtual_entity_id VARCHAR(255) NOT NULL,
    trigger_rule_name VARCHAR(255) NOT NULL,
    source_ip INET,
    destination_ip INET,
    actor_username VARCHAR(100),
    clickhouse_partition_yyyyhh INT, -- Helps quick lookup reference back to warm DB
    raw_event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CASE EVIDENCE CANVAS (evidence_pins)
-- Supports live evidence collection (IPs, hashes, files, raw logs) pinned to a case
CREATE TABLE IF NOT EXISTS evidence_pins (
    evidence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    pinned_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    evidence_type VARCHAR(50) NOT NULL, -- IP, HOST, FILE_HASH, DOMAIN, RAW_LOG_EXTRACT
    evidence_value TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SOAR PLAYBOOK EXECUTIONS (playbook_runs)
-- Tracks visual playbooks run for case remediation
CREATE TABLE IF NOT EXISTS playbook_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    playbook_name VARCHAR(150) NOT NULL,
    executed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, WAITING_APPROVAL, COMPLETED, FAILED
    step_history JSONB NOT NULL DEFAULT '[]'::jsonb, -- Logs step-by-step containment executions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. ANALYST CHAT & NOTES COLLABORATION (analyst_notes)
CREATE TABLE IF NOT EXISTS analyst_notes (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    note_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal relational join speeds
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assignee ON cases(assignee_id);
CREATE INDEX IF NOT EXISTS idx_alerts_case_id ON alerts(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence_pins(case_id);
CREATE INDEX IF NOT EXISTS idx_playbook_runs_case_id ON playbook_runs(case_id);
CREATE INDEX IF NOT EXISTS idx_analyst_notes_case_id ON analyst_notes(case_id);
