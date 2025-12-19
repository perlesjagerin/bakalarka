/**
 * API Performance Test Script
 * Měří response time pro klíčové API endpointy
 * 
 * Použití: node performance-test.js
 */

const BASE_URL = 'http://localhost:3001/api';

// Barvy pro konzoli
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testEndpoint(name, url, options = {}, threshold) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const status = response.ok ? '✅' : '❌';
    const color = duration <= threshold ? colors.green : duration <= threshold * 1.5 ? colors.yellow : colors.red;
    
    console.log(`${status} ${name}`);
    console.log(`   Response time: ${color}${duration}ms${colors.reset} (threshold: ${threshold}ms)`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    return { name, duration, threshold, passed: duration <= threshold };
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
    return { name, duration: -1, threshold, passed: false, error: error.message };
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   API Performance Test${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
  
  const results = [];

  // Test 1: GET /events
  console.log(`${colors.blue}Test 1: GET /events${colors.reset}`);
  results.push(await testEndpoint(
    'Load all events',
    `${BASE_URL}/events`,
    { method: 'GET' },
    200
  ));
  console.log();

  // Test 2: GET /events/:id (použij ID z předchozího testu nebo hardcoded)
  console.log(`${colors.blue}Test 2: GET /events/:id${colors.reset}`);
  // Nejdřív získáme nějaké ID
  try {
    const eventsResponse = await fetch(`${BASE_URL}/events`);
    const eventsData = await eventsResponse.json();
    const firstEventId = eventsData.events?.[0]?.id;
    
    if (firstEventId) {
      results.push(await testEndpoint(
        'Load single event detail',
        `${BASE_URL}/events/${firstEventId}`,
        { method: 'GET' },
        200
      ));
    } else {
      console.log(`${colors.yellow}⚠️  No events found in database${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Could not fetch event ID${colors.reset}`);
  }
  console.log();

  // Test 3: POST /auth/login
  console.log(`${colors.blue}Test 3: POST /auth/login${colors.reset}`);
  results.push(await testEndpoint(
    'User login',
    `${BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'user123'
      })
    },
    300
  ));
  console.log();

  // Sumarizace
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  const avgDuration = results
    .filter(r => r.duration > 0)
    .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration > 0).length;
  
  console.log(`\nAverage response time: ${colors.cyan}${avgDuration.toFixed(2)}ms${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}✅ All performance tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Check the results above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Kontrola, zda server běží
async function checkServer() {
  try {
    await fetch(BASE_URL);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Backend server is not running on ${BASE_URL}${colors.reset}`);
    console.log(`   Start the server with: cd backend && npm run dev\n`);
    process.exit(1);
  }
}

// Main
(async () => {
  await checkServer();
  await runTests();
})();
