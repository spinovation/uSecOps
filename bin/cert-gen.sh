#!/usr/bin/env bash
# /opt/secops/bin/cert-gen.sh
# Local PKI Utility - Generates self-signed CA, Server, and Client certificates for strict agent mTLS v1.3

set -eo pipefail

echo -e "\033[1;34m[PKI Gen] Initializing Certificate Authority & mTLS Key Generator...\033[0m"

# Create output dir
OUTPUT_DIR="/etc/secops/certs"
mkdir -p "$OUTPUT_DIR"

# 1. Generate Root CA Key and Certificate
echo -e "\033[1;34m -> Generating private Root CA...\033[0m"
openssl genrsa -out "$OUTPUT_DIR/client_ca.key" 4096
openssl req -x509 -new -nodes -key "$OUTPUT_DIR/client_ca.key" -sha256 -days 3650 \
  -out "$OUTPUT_DIR/client_ca.crt" \
  -subj "/C=US/ST=Texas/L=Austin/O=Spinovation/OU=Security/CN=SecOps-Root-CA"

# 2. Generate Ingestion Server Key and CSR
echo -e "\033[1;34m -> Generating Ingestion Server keys...\033[0m"
openssl genrsa -out "$OUTPUT_DIR/ingestion.key" 2048
openssl req -new -key "$OUTPUT_DIR/ingestion.key" -out "$OUTPUT_DIR/ingestion.csr" \
  -subj "/C=US/ST=Texas/L=Austin/O=Spinovation/OU=Security/CN=secops-ingestion.local"

# 3. Sign Ingestion Server Certificate with CA
echo -e "\033[1;34m -> Signing Server Certificate...\033[0m"
openssl x509 -req -in "$OUTPUT_DIR/ingestion.csr" -CA "$OUTPUT_DIR/client_ca.crt" -CAkey "$OUTPUT_DIR/client_ca.key" \
  -CAcreateserial -out "$OUTPUT_DIR/ingestion.crt" -days 365 -sha256

# 4. Generate Endpoint Client Key and CSR
echo -e "\033[1;34m -> Generating Agent Client keys...\033[0m"
openssl genrsa -out "$OUTPUT_DIR/agent_client.key" 2048
openssl req -new -key "$OUTPUT_DIR/agent_client.key" -out "$OUTPUT_DIR/agent_client.csr" \
  -subj "/C=US/ST=Texas/L=Austin/O=Spinovation/OU=Security/CN=agent-host-001.local"

# 5. Sign Endpoint Client Certificate with CA
echo -e "\033[1;34m -> Signing Agent Certificate...\033[0m"
openssl x509 -req -in "$OUTPUT_DIR/agent_client.csr" -CA "$OUTPUT_DIR/client_ca.crt" -CAkey "$OUTPUT_DIR/client_ca.key" \
  -CAcreateserial -out "$OUTPUT_DIR/agent_client.crt" -days 365 -sha256

# Clean up temp CSRs
rm -f "$OUTPUT_DIR/ingestion.csr"
rm -f "$OUTPUT_DIR/agent_client.csr"
rm -f "$OUTPUT_DIR/client_ca.srl"

echo -e "\033[1;32m[PKI Gen] Cryptographic mTLS keys successfully generated in $OUTPUT_DIR.\033[0m"
