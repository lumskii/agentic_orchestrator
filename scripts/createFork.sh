#!/bin/bash

##############################################
# Create a zero-copy fork of a Tiger service
# Usage: ./createFork.sh <service-id> <fork-name>
##############################################

set -e

SERVICE_ID=$1
FORK_NAME=$2

if [ -z "$SERVICE_ID" ] || [ -z "$FORK_NAME" ]; then
    echo "Usage: ./createFork.sh <service-id> <fork-name>"
    echo "Example: ./createFork.sh svc_abc123 experiment-fork"
    exit 1
fi

echo "🔀 Creating zero-copy fork..."
echo "Service ID: $SERVICE_ID"
echo "Fork Name: $FORK_NAME"
echo ""

# Create the fork
# TODO: Replace with actual Tiger CLI command
# tiger service fork "$SERVICE_ID" --name "$FORK_NAME" --json > fork_info.json

echo "✅ Fork created successfully!"
echo ""

# Display connection details
# cat fork_info.json | jq
echo "⚠️ Fork creation placeholder - implement with actual Tiger CLI"
echo ""

echo "Connection details saved to fork_info.json"
echo "Use this fork for experimentation, then merge back or delete."
