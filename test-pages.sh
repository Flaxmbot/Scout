#!/bin/bash

echo "🧪 Testing Trendify Mart Page Routes..."
echo "================================================"

# Array of page routes to test
pages=(
  "/ Homepage"
  "/products Products-Page"
  "/collections Collections-Page"
  "/about About-Page"
  "/contact Contact-Page"
  "/login Login-Page"
  "/signup Signup-Page"
  "/cart Cart-Page"
  "/checkout Checkout-Page"
  "/admin Admin-Dashboard"
  "/admin/analytics Admin-Analytics"
  "/admin/products Admin-Products"
  "/admin/orders Admin-Orders"
  "/admin/customers Admin-Customers"
  "/admin/users Admin-Users"
  "/admin/settings Admin-Settings"
)

successful=0
total=${#pages[@]}

echo "📄 Testing Page Routes:"
echo ""

for page_info in "${pages[@]}"; do
  path=$(echo $page_info | cut -d' ' -f1)
  name=$(echo $page_info | cut -d' ' -f2)
  
  # Test the page
  status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$path)
  
  if [ "$status_code" = "200" ]; then
    echo "✅ $name ($path): $status_code OK"
    ((successful++))
  else
    echo "❌ $name ($path): $status_code"
  fi
done

echo ""
echo "📊 Test Results Summary:"
echo "✅ Successful: $successful/$total"

if [ $successful -lt $total ]; then
  echo "⚠️  Some pages returned non-200 status codes"
else
  echo "🎉 All pages loaded successfully!"
fi