const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test utilities
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('🧪 Running HTTP Server Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Home page
  try {
    console.log('Test 1: GET / (Home page)');
    const response = await makeRequest('/');
    if (response.statusCode === 200) {
      console.log('✅ PASS - Home page returns 200');
      passed++;
    } else {
      console.log(`❌ FAIL - Expected 200, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error: ${error.message}`);
    failed++;
  }

  // Test 2: Health check
  try {
    console.log('Test 2: GET /api/health');
    const response = await makeRequest('/api/health');
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      if (data.status === 'healthy') {
        console.log('✅ PASS - Health check returns healthy status');
        passed++;
      } else {
        console.log('❌ FAIL - Health check status not healthy');
        failed++;
      }
    } else {
      console.log(`❌ FAIL - Expected 200, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error: ${error.message}`);
    failed++;
  }

  // Test 3: Time endpoint
  try {
    console.log('Test 3: GET /api/time');
    const response = await makeRequest('/api/time');
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      if (data.currentTime) {
        console.log('✅ PASS - Time endpoint returns current time');
        passed++;
      } else {
        console.log('❌ FAIL - Time endpoint missing currentTime');
        failed++;
      }
    } else {
      console.log(`❌ FAIL - Expected 200, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error: ${error.message}`);
    failed++;
  }

  // Test 4: Echo endpoint
  try {
    console.log('Test 4: POST /api/echo');
    const testData = { message: 'Hello, World!' };
    const response = await makeRequest('/api/echo', 'POST', testData);
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      if (data.method === 'POST' && data.body) {
        console.log('✅ PASS - Echo endpoint returns request data');
        passed++;
      } else {
        console.log('❌ FAIL - Echo endpoint missing expected data');
        failed++;
      }
    } else {
      console.log(`❌ FAIL - Expected 200, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error: ${error.message}`);
    failed++;
  }

  // Test 5: 404 handling
  try {
    console.log('Test 5: GET /nonexistent (404 handling)');
    const response = await makeRequest('/nonexistent');
    if (response.statusCode === 404) {
      console.log('✅ PASS - Non-existent endpoint returns 404');
      passed++;
    } else {
      console.log(`❌ FAIL - Expected 404, got ${response.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error: ${error.message}`);
    failed++;
  }

  // Test summary
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log(`\n🎉 All tests passed!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some tests failed.`);
    process.exit(1);
  }
}

// Check if server is running before testing
function checkServerRunning() {
  return makeRequest('/api/health').then(() => true).catch(() => false);
}

async function main() {
  const isRunning = await checkServerRunning();
  
  if (!isRunning) {
    console.log('❌ Server is not running. Please start it with: npm start');
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);