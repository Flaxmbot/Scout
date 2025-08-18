#!/usr/bin/env node

const http = require('http');

function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✓ ${path}: ${res.statusCode} ${res.statusMessage}`);
      resolve({
        path,
        status: res.statusCode,
        success: res.statusCode === expectedStatus
      });
    });

    req.on('error', (err) => {
      console.log(`✗ ${path}: ${err.message}`);
      resolve({
        path,
        status: 'error',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      console.log(`✗ ${path}: Timeout`);
      req.destroy();
      resolve({
        path,
        status: 'timeout',
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Trendify Mart Application...\n');
  
  const tests = [
    { path: '/', name: 'Homepage' },
    { path: '/products', name: 'Products Page' },
    { path: '/collections', name: 'Collections Page' },
    { path: '/about', name: 'About Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/cart', name: 'Cart Page' },
    { path: '/admin', name: 'Admin Dashboard' },
  ];

  console.log('📄 Testing Page Routes:');
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.path);
    results.push({ ...result, name: test.name });
  }

  console.log('\n📊 Test Results Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  
  if (successful < total) {
    console.log('❌ Failed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name} (${r.path}): ${r.error || r.status}`);
    });
  }

  return { successful, total, results };
}

runTests().catch(console.error);