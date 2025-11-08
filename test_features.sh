#!/bin/bash

# Multi-Agent Orchestration Platform Test Script
# Tests all major features of your application

echo "🚀 Testing Multi-Agent Orchestration Platform"
echo "=============================================="

BASE_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

echo ""
echo "📡 1. Testing Backend Health Check..."
curl -s "$BASE_URL/health" | jq .

echo ""
echo "📄 2. Testing Document Retrieval..."
curl -s "$BASE_URL/api/runs" | jq '.data | length'

echo ""
echo "🔍 3. Testing Hybrid Search..."
curl -s -X POST "$BASE_URL/api/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I coordinate AI agents?",
    "method": "hybrid"
  }' | jq '.data.results | length'

echo ""
echo "🏃 4. Testing Run Creation..."
curl -s -X POST "$BASE_URL/api/runs" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "test_coordination",
    "input": {"test": true},
    "metadata": {"source": "test_script"}
  }' | jq '.data.id'

echo ""
echo "🍴 5. Testing Fork Services List..."
curl -s "$BASE_URL/api/forks/services" | jq '.data | length'

echo ""
echo "🍴 6. Testing Fork Creation..."
curl -s -X POST "$BASE_URL/api/forks" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "tiger_main_service",
    "name": "test_integration_fork"
  }' | jq '.success'

echo ""
echo "✅ Test Complete! Check your frontend at: $FRONTEND_URL"
echo ""
echo "📊 Expected Results:"
echo "  - Health check: OK"
echo "  - Runs retrieved: 3+"
echo "  - Search results: 1+"
echo "  - New run created: Run ID"
echo "  - Fork services: 3+"
echo "  - Fork created: true"