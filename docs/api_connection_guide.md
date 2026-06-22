# uSecOps Platform V2 – API Connection User Guide

This guide details the prerequisites, credential requirements, and step-by-step processes required to establish agentless API connections to ingest telemetry streams into the uSecOps Lakehouse.

---

## 1. Global Authentication Prerequisites

The uSecOps Core maps telemetry endpoints dynamically. Before connecting, ensure the following parameters are prepared:
*   **mTLS Client Certs**: Secure API connections require mutually authenticated TLS (mTLS). Ensure client certificates are generated using your organization's private PKI.
*   **Cryptographic Keys**: Prepare your private PEM private keys (`.pem` format) for mainframe and cloud credential bindings.
*   **Network Route Authorization**: Verify that egress routing is allowed from the appliance **vNIC 0 (Ingestion Port - VLAN 100)** to the target APIs.

---

## 2. Cloud Providers Connection Workflows

### 2.1 Amazon Web Services (AWS)
*   **Method**: AWS CloudTrail & S3 Event logs pull via SQS Queue.
*   **What is Required**:
    *   **AWS Access Key ID & Secret Access Key**: Bound to an IAM user with `AmazonSQSReadOnlyAccess` and `AmazonS3ReadOnlyAccess`.
    *   **SQS Queue URL**: The SQS queue configured to receive S3 bucket event notifications.
*   **Connection Process**:
    1. In the integrations console, input the `Access Key ID` and `Secret Access Key`.
    2. Input the target `SQS Queue URL` (e.g. `https://sqs.us-east-1.amazonaws.com/123456789012/usecops-queue`).
    3. Click **Verify Connection** to run a dry-run credentials check.

### 2.2 Google Cloud Platform (GCP)
*   **Method**: Google Pub/Sub telemetry stream subscription.
*   **What is Required**:
    *   **GCP Service Account Key (JSON)**: Service account containing `Pub/Sub Subscriber` permissions.
    *   **GCP Subscription ID**: Fully qualified Pub/Sub subscription name.
*   **Connection Process**:
    1. Upload the Google Service Account JSON key.
    2. Input your `Project ID` and the target `Subscription ID`.
    3. The uSecOps collector will launch background worker threads pulling from the subscription.

---

## 3. Security Systems & EDRs

### 3.1 CrowdStrike Falcon
*   **Method**: Event Streams API / Falcon Streaming API.
*   **What is Required**:
    *   **API Client ID & Client Secret**: Generated in the CrowdStrike Console under **API Clients and Keys** with `Event Streams (Read)` scopes.
    *   **Base URL**: E.g. `api.crowdstrike.com`.
*   **Connection Process**:
    1. Input the Falcon `Client ID` and `Client Secret`.
    2. Select the matching cloud environment base URL.
    3. Save and verify.

---

## 4. Mainframes & Legacy Systems

### 4.1 IBM AS/400 (IBM i)
*   **Method**: REST API pull using IBM i Access Client Solutions / local socket poller.
*   **What is Required**:
    *   **Connection Endpoint**: IP and port of the AS/400 Host Server (typically port `9450`).
    *   **QAUDJRN Authorization User**: Dedicated service account with access to read the `QAUDJRN` journal receiver objects.
*   **Connection Process**:
    1. Enter target hostname and port.
    2. Upload the service account user credentials.
    3. uSecOps pulls SMF-equivalent journals every 30 seconds.

### 4.2 IBM z/OS (Mainframe)
*   **Method**: Direct SMF Real-Time Stream (Type 80 RACF audit records).
*   **What is Required**:
    *   **z/OS HTTP Logstream Endpoint**: IP and port running the z/OS UNIX System Services (USS) logstream interface.
    *   **Authentication token**: Authorized USS profile token.
*   **Connection Process**:
    1. Input the USS real-time logstream REST endpoint.
    2. Select default SMF records types to filter (Default: Type 80).
    3. Run TLS handshake check.

---

## 5. Connection Verification Checklist

If a connection verification fails, verify:
1.  **VLAN Routing**: Ensure the appliance vNIC 0 trunk can resolve the target API hostnames.
2.  **Secret Validity**: Verify secret tokens have not expired.
3.  **Cryptographic Signatures**: Ensure `.pem` files are formatted in valid PKCS#8 formatting without carriage returns.
