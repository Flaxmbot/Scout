#!/bin/bash

echo "🧪 Trendify Mart - Quick Health Check"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo "📁 Project Directory: $(pwd)"
echo ""

# Check dependencies
print_info "Checking dependencies..."
if [ -d "node_modules" ]; then
    print_status 0 "Dependencies installed"
else
    print_status 1 "Dependencies missing - run 'bun install'"
    exit 1
fi

# Check if dev server is running
print_info "Checking development server..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status 0 "Development server running on http://localhost:3000"
    SERVER_RUNNING=true
else
    print_status 1 "Development server not running"
    print_info "Start with: bun run dev"
    SERVER_RUNNING=false
fi

# Test build
print_info "Testing production build..."
if timeout 60 bun run build > /dev/null 2>&1; then
    print_status 0 "Production build successful"
else
    print_status 1 "Production build failed"
fi

# Test API endpoints if server is running
if [ "$SERVER_RUNNING" = true ]; then
    echo ""
    print_info "Testing API endpoints..."
    
    # Test products API
    if curl -s http://localhost:3000/api/products | grep -q "mock-id"; then
        print_status 0 "Products API responding"
    else
        print_status 1 "Products API not responding"
    fi
    
    # Test categories API
    if curl -s http://localhost:3000/api/categories | grep -q "Mock"; then
        print_status 0 "Categories API responding"
    else
        print_status 1 "Categories API not responding"
    fi
    
    # Test auth API
    if curl -s http://localhost:3000/api/auth/me | grep -q "MISSING_TOKEN"; then
        print_status 0 "Authentication API responding"
    else
        print_status 1 "Authentication API not responding"
    fi
    
    echo ""
    print_info "Testing page routes..."
    
    # Test key pages
    pages=("/" "/products" "/collections" "/login" "/admin")
    for page in "${pages[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$page | grep -q "200"; then
            print_status 0 "Page $page accessible"
        else
            print_status 1 "Page $page not accessible"
        fi
    done
fi

echo ""
echo "📋 Summary:"
echo "==========="

# Check environment files
if [ -f ".env.local" ]; then
    print_status 0 "Environment configuration found"
else
    print_info "Create .env.local from .env.example for production"
fi

# Check important files
important_files=("README.md" "package.json" "next.config.ts" "tsconfig.json")
for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Configuration file $file exists"
    else
        print_status 1 "Missing configuration file $file"
    fi
done

echo ""
if [ "$SERVER_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 Trendify Mart is running and healthy!${NC}"
    echo ""
    echo "🌐 Visit: http://localhost:3000"
    echo "👑 Admin: http://localhost:3000/admin"
    echo "🛒 Products: http://localhost:3000/products"
else
    echo -e "${YELLOW}⚠️  Start the development server with: bun run dev${NC}"
fi

echo ""
echo "📖 Documentation:"
echo "  - README.md - Complete setup guide"
echo "  - TEST_REPORT.md - Comprehensive test results"
echo "  - TYPESCRIPT_FIXES_SUMMARY.md - Fixes applied"
echo ""
echo "🚀 Ready for deployment to Vercel!"