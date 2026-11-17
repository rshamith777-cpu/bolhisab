import http from 'node:http';
import assert from 'node:assert';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runLiveServerTests() {
  console.log('===========================================================');
  console.log('🌐 LIVE HTTP LOCALHOST (http://localhost:3000) TEST SUITE');
  console.log('===========================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASSED] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAILED] ${name}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  // 1. GET /
  await test('GET http://localhost:3000/ returns 200 OK with text/html', async () => {
    const res = await fetchUrl('http://localhost:3000/');
    assert.strictEqual(res.status, 200);
    assert(res.headers['content-type'].includes('text/html'));
  });

  // 2. Check HTML content
  await test('HTML contains Microphone, Disambiguation & Confirmation cards', async () => {
    const res = await fetchUrl('http://localhost:3000/');
    assert(res.body.includes('id="mic-btn"'), 'Missing #mic-btn');
    assert(res.body.includes('id="disambiguation-card"'), 'Missing #disambiguation-card');
    assert(res.body.includes('id="confirmation-card"'), 'Missing #confirmation-card');
    assert(res.body.includes('id="ai-brain-badge"'), 'Missing #ai-brain-badge');
    assert(res.body.includes('id="language-select"'), 'Missing #language-select');
  });

  // 3. GET /api/ai/status
  await test('GET http://localhost:3000/api/ai/status returns JSON', async () => {
    const res = await fetchUrl('http://localhost:3000/api/ai/status');
    assert.strictEqual(res.status, 200);
    const json = JSON.parse(res.body);
    assert('available' in json, 'JSON has available flag');
  });

  // 4. POST /api/ai/parse
  await test('POST http://localhost:3000/api/ai/parse returns JSON response', async () => {
    const res = await fetchUrl('http://localhost:3000/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Ramesh ko 40 rupaye udhaar likho', lang: 'hi-IN' })
    });
    assert.strictEqual(res.status, 200);
    const json = JSON.parse(res.body);
    assert('parsed' in json || 'error' in json || 'fallbackToLocal' in json || 'result' in json, 'Response has parsed/error/fallbackToLocal/result');
  });

  console.log('===========================================================');
  console.log(`🏁 LOCALHOST SERVER SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('===========================================================');
}

runLiveServerTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
