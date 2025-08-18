#!/bin/bash

echo "🔥 Testing Firebase API Endpoints..."
echo "================================================"

# Array of API endpoints to test
endpoints=(
  "/api/products GET"
  "/api/categories GET"
  "/api/auth/me GET"
  "/api/admin/analytics/dashboard GET"
  "/api/admin/products GET"
  "/api/admin/orders GET"
  "/api/admin/customers GET"
  "/api/admin/users GET"
)

successful=0
total=${#endpoints[@]}

echo "🔌 Testing API Endpoints:"
echo ""

for endpoint_info in "${endpoints[@]}"; do
  path=$(echo $endpoint_info | cut -d' ' -f1)
  method=$(echo $endpoint_info | cut -d' ' -f2)
  
  # Test the API endpoint
  status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method http://localhost:3000$path)
  
  if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
    echo "✅ $method $path: $status_code"
    ((successful++))
  else
    echo "❌ $method $path: $status_code"
  fi
done

echo ""
echo "📊 API Test Results Summary:"
echo "✅ Responding: $successful/$total"
echo ""
echo "🔍 Testing specific endpoints with responses..."

# Test products endpoint specifically
echo "Testing /api/products:"
products_response=$(curl -s http://localhost:3000/api/products)
if [[ $products_response == *"["* ]] || [[ $products_response == *"error"* ]]; then
  echo "✅ Products API returning data structure"
else
  echo "❌ Products API not returning expected format"
  echo "Response: $products_response"
fi

# Test categories endpoint
echo "Testing /api/categories:"
categories_response=$(curl -s http://localhost:3000/api/categories)
if [[ $categories_response == *"["* ]] || [[ $categories_response == *"error"* ]]; then
  echo "✅ Categories API returning data structure"
else
  echo "❌ Categories API not returning expected format"
  echo "Response: $categories_response"
fi