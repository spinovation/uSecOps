# Threat Detection Use Cases & MITRE ATT&CK Mapping

This document outlines the **Out-of-the-Box (OOTB) Threat Detection Use Cases** for the Unified SecOps Platform. It maps detection logic, involved Data Marts, and correlation rules directly to the **MITRE ATT&CK Matrix**, and defines the specialized AI Agent investigation workflows for each.

---

## 1. Multi-Domain Data Mart Correlation Matrix

The Security AI Agent correlates events across five dedicated data marts and specific enterprise software logs:
*   **Active Directory Mart**: User identity, domain controllers, Kerberos/NTLM authentication, Active Directory Group policy.
*   **Proxy Mart**: Zscaler/Bluecoat gateways, DNS queries, egress web transactions.
*   **Firewall Mart**: Network flows, VPC logs, ingress/egress firewall blocks.
*   **Application Mart (Workday, Tanium, Oracle, SQL, Autobahn, Terminal Emulation)**:
    *   **Workday**: HR system of record (defines employee status, department, and offboarding logs).
    *   **Tanium**: Endpoint compliance, running processes, patches, and asset management logs.
    *   **Databases (Oracle/SQL)**: Database queries, connection attempts, database access changes.
    *   **Autobahn / Terminal Emulation**: Legacy system access sessions, character-mode mainframes (AS/400, Tandem).

---

## 2. Core Detection Use Cases & MITRE Mappings

### Use Case 1: Account Takeover (ATO)
*   **MITRE ATT&CK Mapping**: **T1078 (Valid Accounts)** & **T1149 (Coerce Authentication)**
*   **Involved Data Marts**: Active Directory, Proxy, Tanium, Workday.
*   **Correlation Logic (YARA-L / Sigma Pseudo-code)**:
    ```yara
    rule Account_Takeover_Detection {
      meta:
        severity = "Critical"
        mitre = "T1078"
      events:
        $login.event_code = "LL01"
        $login.user_id = $user_id
        
        // Match impossible geovelocity travel (logins from 2 distant locations in unrealistic time)
        $login.source_ip != $prev_login.source_ip
        $login.timestamp - $prev_login.timestamp < 2h
        
        // OR login from an unapproved / newly observed device flagged by Tanium
        $login.destination_host = $host
        $tanium.host_name = $host
        $tanium.managed_device == false
      condition:
        $login and $prev_login and $tanium
    }
    ```
*   **AI Agent Investigation Workflow**:
    1. Traces the IP geovelocity score of the login.
    2. Queries Tanium to determine if the destination host is an authorized, company-managed asset.
    3. Searches the Proxy data mart for outbound connections to Tor nodes or suspicious VPNs from that IP.
    4. Generates a blast-radius map of databases (Oracle/SQL) accessed within the session.

---

### Use Case 2: Brute Force & Password Spraying
*   **MITRE ATT&CK Mapping**: **T1110 (Brute Force / Credential Access)**
*   **Involved Data Marts**: Active Directory, Application Mart (Workday, Autobahn, Terminal Emulation).
*   **Correlation Logic**:
    *   **Brute Force**: Detects $\ge 15$ login failures (`LL03`) targeting a **single account** from a **single Source IP** within $5\text{ minutes}$.
    *   **Password Spraying**: Detects $\ge 20$ login failures (`LL03`) targeting **multiple accounts** using the same password from a **single Source IP** within $10\text{ minutes}$.
*   **AI Agent Investigation Workflow**:
    1. Consolidates the failures and maps the Source IP to internal subnet logs or external threat intelligence (TIP).
    2. Identifies if any login attempt was ultimately successful (`LL01`) during or immediately after the spray.
    3. Recommends immediate firewall blockage on the Source IP and prompts the supervisor for a temporary account lock if the attack was successful.

---

### Use Case 3: Short-Lived User Account (Backdoor Persistence)
*   **MITRE ATT&CK Mapping**: **T1136 (Create Account)** & **T1098 (Account Manipulation)**
*   **Involved Data Marts**: Active Directory, Linux/Windows System Marts, Database (Oracle/SQL).
*   **Correlation Logic**:
    ```yara
    rule Short_Lived_Account {
      meta:
        severity = "High"
        mitre = "T1136"
      events:
        $create.event_code = "SA01" // User creation
        $create.target_user_id = $temp_user
        
        $delete.event_code = "SA03" // User deletion
        $delete.target_user_id = $temp_user
        
        // Created and deleted within a 2-hour window
        $delete.timestamp - $create.timestamp <= 2h
      condition:
        $create and $delete
    }
    ```
*   **AI Agent Investigation Workflow**:
    1. Identifies the administrative account (`Actor User ID`) that created the user.
    2. Pulls all command logs (`PA01`) executed by the temporary user during its short lifespan.
    3. Queries Tanium/Linux data marts for any persistence binaries, scheduled tasks, or SSH keys injected by the temporary account.

---

### Use Case 4: Multiple Locked User Accounts & Suspicious Lockouts
*   **MITRE ATT&CK Mapping**: **T1110 (Brute Force / Denial of Service)** & **T1531 (Account Access Removal)**
*   **Involved Data Marts**: Active Directory, Terminal Emulation, Workday.
*   **Correlation Logic**:
    *   **Multiple Lockouts**: Triggered when $\ge 5$ separate active directory user accounts are locked (`SA08`) from the same network segment or within $15\text{ minutes}$, indicating a distributed credential attack.
    *   **Suspicious Lockout**: A lock (`SA08`) on a high-value Administrator or Executive account immediately following a password reset (`SA07`) or privilege escalation attempt (`PA02`).
*   **AI Agent Investigation Workflow**:
    1. Analyzes the lock logs (`SA08`) to isolate the offending Source IP or Host.
    2. Traces if the lockout was caused by legacy terminal emulation sessions utilizing expired cached credentials.
    3. Automatically schedules an Active Directory alert and recommends enabling Multi-Factor Authentication (MFA) step-up queries.

---

### Use Case 5: User Login After Offboarding
*   **MITRE ATT&CK Mapping**: **T1078 (Valid Accounts / Persistence)**
*   **Involved Data Marts**: Active Directory, Workday, Proxy.
*   **Correlation Logic**:
    ```yara
    rule Login_After_Offboarding {
      meta:
        severity = "Critical"
        mitre = "T1078"
      events:
        $login.event_code = "LL01"
        $login.user_id = $user_id
        
        // Query the Workday HR Data Mart for employee status
        $hr_record.user_id = $user_id
        $hr_record.status == "Terminated"
        
        // Login occurred after the termination date
        $login.timestamp > $hr_record.termination_timestamp
      condition:
        $login and $hr_record
    }
    ```
*   **AI Agent Investigation Workflow**:
    1. Flags the login as an immediate critical indicator of compromise.
    2. Queries the Active Directory database to determine why the account was not disabled upon termination.
    3. Maps all assets, proxy websites, and database (SQL/Oracle) schemas accessed by the terminated user.
    4. Triggers an automated SOAR playbook to instantly disable the Active Directory account and isolate the destination workstation.
