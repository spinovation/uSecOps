# SIEM Event Ingestion & Field Schema Specification

This document defines the schema, required fields, network/host contexts, and raw audit log requirements for each of the **standardized Event Types** (grouped into Login/MFA, Configuration, Privilege, User Administration, Identity Governance, System Status, and Change Management events) as identified in the platform specifications.

---

## 1. Global Schema Conventions

To ensure uniform correlation across modern networks, cloud data lakes, and legacy mainframe data marts, every event must be parsed and mapped to these core standardized field definitions (based on the OCSF/ECS standards):

*   **Timestamp**: Dynamic ISO-8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ss.sssZ`).
*   **Event Code**: The specific telemetry ID (e.g., `LL01`, `SA07`, `LL08`).
*   **Actor/Admin User ID**: The identifier of the account *performing* the action (crucial for admin actions like user creation).
*   **Target User ID**: The identifier of the account *receiving* the action (crucial for password resets, locks, etc.).
*   **User ID / Email**: The primary target account credentials.
*   **Domain**: Active Directory domain, Kerberos realm, cloud tenant ID, or mainframe system partition.
*   **Source IP / Port**: Origin network parameters.
*   **Destination IP / Port**: Target network parameters.
*   **Source Host**: Origin system name/FQDN or workstation identifier.
*   **Destination Host**: Target system name/FQDN or server hosting the application.
*   **Application Accessed**: The target application, service, microservice, database, or API path.
*   **Identity Provider (IdP)**: The central authentication host (e.g., Okta, Entra ID, PingIdentity, Duo).
*   **Access Governance Platform**: The IGA system (e.g., SailPoint, Saviynt).
*   **Raw Logs**: The unmodified, cryptographically preserved original log payload (for forensic audit validity).

---

## 2. Event Type Schema Mapping

### Category: Login, SSO & MFA Lifecycle (LL)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **LL01** | **Successful login** | `User ID`, `Email`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Application Accessed`, `Session ID` | *   **Windows**: Security Event ID `4624` (Logon Type 2/3/10).<br>*   **Linux**: `/var/log/auth.log` (`sshd: session opened`).<br>*   **Legacy**: AS/400 `QAUDJRN` (`JS` entry type), z/OS `SMF Type 80` (RACF successful login). |
| **LL02** | **Successful logoff** | `User ID`, `Email`, `Domain`, `Source Host`, `Destination Host`, `Application Accessed`, `Session ID` | *   **Windows**: Security Event ID `4634` / `4647`.<br>*   **Linux**: `/var/log/auth.log` (`sshd: session closed`).<br>*   **Legacy**: AS/400 `QAUDJRN` (`JO` entry type). |
| **LL03** | **User login failure** | `User ID`, `Email`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Application Accessed`, `Failure Reason` (e.g., Bad Password) | *   **Windows**: Security Event ID `4625` (Failure Status/Substatus).<br>*   **Linux**: `/var/log/auth.log` (`Failed password for...`).<br>*   **Legacy**: AS/400 `QAUDJRN` (`PW` entry type), z/OS `SMF Type 80` (failed authorization). |
| **LL04** | **Password change success**| `Target User ID`, `Email`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Change Initiator` (Self-Service Reset vs. Admin Reset) | *   **Windows**: Security Event ID `4723` (user changed own password) or `4724` (admin reset password).<br>*   **Linux**: `/var/log/auth.log` (`pam_unix: password changed`). |
| **LL05** | **Password change failure**| `Target User ID`, `Email`, `Domain`, `Source IP`, `Source Host`, `Failure Reason` | *   **Windows**: Security Event ID `4723`/`4724` with failure audit status.<br>*   **Linux**: `/var/log/auth.log` (`password change failed`). |
| **LL06** | **MFA Challenge Issued** | `User ID`, `Email`, `Domain`, `Source IP`, `Identity Provider`, `MFA Method` (Push, SMS, FIDO2), `Device ID` | *   **IdP Logs**: Okta Audit Logs (`user.mfa.attempt`), Entra ID Sign-In logs.<br>*   **MFA Logs**: Duo Security Auth API logs. |
| **LL07** | **MFA Verification Success**| `User ID`, `Email`, `Domain`, `Source IP`, `Identity Provider`, `MFA Method`, `Device ID` | *   **IdP Logs**: Okta logs (`user.mfa.verification.success`).<br>*   **MFA Logs**: Duo successful authentication. |
| **LL08** | **MFA Verification Failure**| `User ID`, `Email`, `Domain`, `Source IP`, `Identity Provider`, `MFA Method`, `Failure Reason` (e.g., User Rejected, Timeout, Fraud Alert) | *   **IdP Logs**: Okta logs (`user.mfa.verification.failure`).<br>*   **MFA Logs**: Duo Auth logs indicating "User Denied Push" (critical for MFA Fatigue detection). |

---

### Category: Configuration Control (CC)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **CC01** | **Application config change**| `Actor User ID`, `Domain`, `Source IP`, `Destination Host`, `Application Accessed`, `Config File Path`, `Parameter Changed`, `Old Value`, `New Value` | *   **App Audit Logs**: JSON payloads from application audit trails.<br>*   **Linux**: File integrity logs (e.g., `auditd` writing to `/etc/app.conf`).<br>*   **Kubernetes**: ConfigMap/Secret API update events. |
| **CC02** | **Security config change**| `Actor User ID`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Config File Path`, `Security Policy Name`, `Old State`, `New State` | *   **Windows**: Security Event ID `4719` (System Audit Policy change).<br>*   **Firewall**: Raw configuration shell logs or API audit logs showing rulesets modification.<br>*   **Linux**: `/var/log/audit/audit.log` tracking `/etc/shadow`, `/etc/sudoers` modifications. |

---

### Category: Privilege Access (PA)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **PA01** | **Successful privilege operation access** | `Actor User ID`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Privilege Level Escalated`, `Command Executed`, `Application Accessed` | *   **Windows**: Security Event ID `4672` (Special privileges assigned) or `4674` (Privileged object operation).<br>*   **Linux**: `sudo` command logs in `/var/log/secure` or `/var/log/auth.log`.<br>*   **Legacy**: AS/400 `QAUDJRN` (`GR` / `CA` entry types). |
| **PA02** | **Failed privileged operation access** | `Actor User ID`, `Domain`, `Source IP`, `Source Host`, `Destination Host`, `Privilege Level Requested`, `Command Attempted`, `Application Accessed`, `Failure Reason` | *   **Windows**: Security Event ID `4673` (Privileged service call failed) or `4674` (Failure audit).<br>*   **Linux**: `/var/log/secure` (`sudo: auth failure` or permission denied events). |

---

### Category: Security & User Administration (SA)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **SA01** | **User creation** | `Actor/Admin User ID`, `Target User ID`, `Target Email`, `Domain`, `Source IP`, `Source Host`, `Destination Host` | *   **Windows**: Security Event ID `4720` (A user account was created).<br>*   **Linux**: `/var/log/secure` (`useradd: new user added`).<br>*   **Legacy**: AS/400 `QAUDJRN` (`CO` object creation type). |
| **SA02** | **User change** | `Actor/Admin User ID`, `Target User ID`, `Domain`, `Source Host`, `Destination Host`, `Attributes Modified` (e.g., groups, phone, department) | *   **Windows**: Security Event ID `4738` (A user account was changed).<br>*   **Linux**: `/var/log/secure` (`usermod: change user attributes`). |
| **SA03** | **User deletion** | `Actor/Admin User ID`, `Target User ID`, `Domain`, `Source Host`, `Destination Host` | *   **Windows**: Security Event ID `4726` (A user account was deleted).<br>*   **Linux**: `/var/log/secure` (`userdel: user deleted`). |
| **SA04** | **User profile/role creation** | `Actor/Admin User ID`, `Target Profile/Role Name`, `Domain`, `Source Host`, `Privileges Assigned` | *   **Windows**: Security Event ID `4727` / `4731` (Security-enabled global/local group created).<br>*   **Cloud**: AWS CloudTrail `CreateRole` / IAM API event. |
| **SA05** | **User profile/role change** | `Actor/Admin User ID`, `Target Profile/Role Name`, `Domain`, `Source Host`, `Privileges Added/Removed` | *   **Windows**: Security Event ID `4728` / `4732` (Member added to group) or `4729` / `4733` (Member removed).<br>*   **Cloud**: AWS CloudTrail `AttachRolePolicy` API logs. |
| **SA06** | **User profile/role deletion** | `Actor/Admin User ID`, `Target Profile/Role Name`, `Domain`, `Source Host` | *   **Windows**: Security Event ID `4730` / `4734` (Group deleted).<br>*   **Cloud**: AWS CloudTrail `DeleteRole` API logs. |
| **SA07** | **User password reset** | `Actor/Admin User ID`, `Target User ID`, `Target Email`, `Domain`, `Source IP`, `Source Host` | *   **Windows**: Security Event ID `4724` (An attempt was made to reset an account's password).<br>*   **Legacy**: AS/400 `QAUDJRN` (`PW` event detailing administrator override). |
| **SA08** | **User account locked** | `Target User ID`, `Domain`, `Destination Host`, `Lockout Trigger` (e.g., threshold reached), `Source IP` | *   **Windows**: Security Event ID `4740` (A user account was locked out).<br>*   **Legacy**: AS/400 `QAUDJRN` (`PW` event detailing administrator override). |
| **SA09** | **User account unlocked** | `Actor/Admin User ID`, `Target User ID`, `Domain`, `Source Host`, `Destination Host` | *   **Windows**: Security Event ID `4767` (A user account was unlocked).<br>*   **Linux**: `/var/log/secure` (`faillock: account unlocked`). |
| **SA10** | **MFA Device Registration or Change** | `Actor User ID`, `Target User ID`, `Domain`, `Identity Provider`, `MFA Method Added/Removed`, `Device ID` | *   **IdP Logs**: Okta logs (`user.mfa.factor.activate` / `user.mfa.factor.deactivate`), Entra ID authentication method logs (high risk for persistence checks). |

---

### Category: Identity Governance & Access Management (IG)

This category integrates the SIEM data lake with external IGA systems (SailPoint / Saviynt) to capture provisioning requests, entitlement certifications, and compliance reviews.

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **IG01** | **Identity access request submitted** | `Actor User ID` (Requestor), `Target User ID`, `Entitlement Requested` (Roles, Groups, DB Permissions), `Access Governance Platform`, `Justification` | *   **IGA Logs**: SailPoint IdentityIQ Audit Logs (`Access Request Created`), Saviynt transaction logs. |
| **IG02** | **Identity access approval action** | `Actor User ID` (Approver), `Target User ID`, `Entitlement Approved`, `Access Governance Platform`, `Duration Granted` (e.g., permanent vs. 30 days) | *   **IGA Logs**: SailPoint audit logs (`Access Request Approved`). |
| **IG03** | **Access recertification completed** | `Actor User ID` (Certifier), `Target User ID`, `Entitlement Reviewed`, `Certification Status` (Approved / Revoked), `Access Governance Platform` | *   **IGA Logs**: SailPoint Certifications audit trail (`Role Certified` / `Role Revoked`). |
| **IG04** | **Policy or Segregation of Duties (SoD) violation** | `Target User ID`, `Violated Policy Name`, `Conflicting Entitlements` (e.g., AP Requestor + AP Approver), `Access Governance Platform`, `Severity` | *   **IGA Logs**: SailPoint Policy Violations / Saviynt compliance exceptions. |

---

### Category: System Status & Application Control (SS)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **SS01** | **Application started** | `Destination Host`, `Application Accessed`, `Process Name`, `Process ID (PID)`, `User Context`, `Version` | *   **Windows**: Security Event ID `4688` (New process created) or system service startup log.<br>*   **Linux**: Systemd startup scripts (`systemd: Started...`) or eBPF process execution traces. |
| **SS02** | **Application stopped** | `Destination Host`, `Application Accessed`, `Process Name`, `Process ID (PID)`, `Exit Code`, `Reason` (e.g., manual termination, crash) | *   **Windows**: Security Event ID `4689` (Process exited) or system service shutdown log.<br>*   **Linux**: Systemd logs (`systemd: Stopped...`) or container shutdown audit logs. |
| **SS03** | **Application data dump** | `Actor User ID`, `Destination Host`, `Application Accessed`, `Database Name`, `Target Export Path`, `Data Format` (e.g., CSV, SQL), `Record Count` | *   **DB Logs**: PostgreSQL/MySQL query logs (`pg_dump` execution, `SELECT INTO OUTFILE`).<br>*   **Linux**: `history` terminal records or `auditd` tracing dump utilities. |
| **SS04** | **Application data restore** | `Actor User ID`, `Destination Host`, `Application Accessed`, `Database Name`, `Source Backup Path`, `Record Count` | *   **DB Logs**: SQL execution audit trails or recovery logs.<br>*   **App Logs**: Internal application restore function execution summaries. |
| **SS05** | **Application logging change** | `Actor User ID`, `Destination Host`, `Application Accessed`, `Old Log Level` (e.g., INFO), `New Log Level` (e.g., OFF/ERROR) | *   **App Logs**: Audit trail showing logging level modifications (critical target for evasion detection). |

---

### Category: Change & Performance Management (CM)

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **CM01** | **Sequencing failure** | `Application Accessed`, `Destination Host`, `Transaction ID`, `Expected Step Number`, `Actual Step Number Received`, `Transaction Payload Hash` | *   **Middleware Logs**: Apache Kafka/MQ transaction tracking errors.<br>*   **App Logs**: Out-of-order sequence parsing exceptions from application logs. |
| **CM02** | **Utilization threshold reached** | `Destination Host`, `Resource Monitored` (CPU, Memory, Disk, Ingestion Rate), `Capacity Threshold %` (e.g., 95%), `Current Capacity`, `Process ID` | *   **Host Metrics**: Prometheus metrics alerts, Linux system logs (`oom-killer` triggers, filesystem full alerts). |
| **CM03** | **Application code change** | `Actor User ID`, `Destination Host`, `Application Accessed`, `Modified Code Path/Module`, `Commit ID / Git Hash`, `Deployment Pipeline ID` | *   **Git CI/CD Logs**: Jenkins, GitLab CI, or GitHub Actions deployment webhook logs.<br>*   **File Audit**: File system modification traces in operational directories. |
| **CM04** | **Application memory change** | `Actor User ID`, `Destination Host`, `Application Accessed`, `Old Memory Allocation (MB)`, `New Memory Allocation (MB)` | *   **Orchestrator Logs**: Kubernetes pod limits update API calls, JVM memory args modification records (`Xmx` / `Xms`). |

---

### Category: Appliance Self-Auditing & Emergency Operations (AO)

This category defines telemetry for the appliance's self-monitoring capability, auditing internal operations across graphical interfaces, command-line systems, privileged access controls, and emergency break-glass sessions.

| Event Code | Event Name | Core Required Fields | Specific Raw Logs / OS Telemetry Requirements |
| :--- | :--- | :--- | :--- |
| **AO01** | **Appliance Web GUI User Action** | `Actor User ID`, `Source IP`, `Session Token Hash`, `Action Category`, `Request Payload Digest`, `Component Affected` | *   **Next.js console logs**: HTTP request routing middleware logs, dashboard query/export payloads, API gateway panel command logs. |
| **AO02** | **Appliance CLI Shell Command** | `Actor User ID`, `Source IP` (or `Serial Terminal ID`), `Command Executed`, `Process ID`, `Working Directory`, `Result Code` | *   **Hardened Linux**: `auditd` command trace logs, TTY input capture `/var/log/audit/audit.log`, pam_tty_audit records. |
| **AO03** | **PAM Policy Bypass Alert** | `Actor User ID`, `Command Attempted`, `Privilege Level Requested`, `Identity Governance Mart Status`, `Alert Severity` | *   **Appliance PAM logs**: Interceptor alerts matching CLI commands or API panel controls against active recertification status in Identity Mart. |
| **AO04** | **Break-Glass Invocation** | `Actor User ID`, `Serial Console/tty Port`, `Cryptographic Key ID Used`, `Operator Typed Justification`, `Override Scope` (e.g. root shell, PII unmask) | *   **Appliance Kernel Logs**: Secure system recovery daemon triggers, local physical recovery key validation audits. |
| **AO05** | **Break-Glass Session Keystroke Audit** | `Session ID`, `Keystrokes Captured`, `Command Injected`, `System Outputs`, `Local Timestamp` | *   **Immutable logs**: TTY recording logs cryptographically chained and piped directly to the Module 4 cold storage WORM bucket. |

