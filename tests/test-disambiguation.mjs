import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify parser and matching logic from index.html
const parserMatch = html.match(/class LocalCommandParser \{[\s\S]*?\n    \}/);
if (!parserMatch) {
  console.error('LocalCommandParser not found in index.html');
  process.exit(1);
}

eval(parserMatch[0] + '; global.LocalCommandParser = LocalCommandParser;');

// Seed test customers mirroring SEED_DATA
const customers = [
  { id: 'cust_ramesh', name: 'Ramesh', nickname: 'Tailor', phone: '98765-43210', area: 'Station Road' },
  { id: 'cust_ramesh_plumber', name: 'Ramesh', nickname: 'Plumber', phone: '98123-45678', area: 'Market Gate' },
  { id: 'cust_suresh', name: 'Suresh', nickname: 'Kirana', phone: '98456-78901', area: 'Bus Stand' }
];

let failed = 0;

// Test 1: Query "Ramesh" finds both matches
const rameshMatches = global.LocalCommandParser.findMatchingCustomers(customers, 'Ramesh');
if (rameshMatches.length === 2) {
  console.log('✓ [PASSED] "Ramesh" correctly identifies 2 ambiguous customers (Tailor & Plumber)');
} else {
  console.error('✗ [FAILED] Expected 2 matches for "Ramesh", got:', rameshMatches.length);
  failed++;
}

// Test 2: Specific query "Ramesh Tailor" resolves directly to Tailor
const tailorMatches = global.LocalCommandParser.findMatchingCustomers(customers, 'Ramesh Tailor');
if (tailorMatches.length === 1 && tailorMatches[0].id === 'cust_ramesh') {
  console.log('✓ [PASSED] "Ramesh Tailor" automatically resolves directly to Tailor');
} else {
  console.error('✗ [FAILED] Expected 1 specific match for "Ramesh Tailor"');
  failed++;
}

// Test 3: Specific query "Ramesh Plumber" resolves directly to Plumber
const plumberMatches = global.LocalCommandParser.findMatchingCustomers(customers, 'Ramesh Plumber');
if (plumberMatches.length === 1 && plumberMatches[0].id === 'cust_ramesh_plumber') {
  console.log('✓ [PASSED] "Ramesh Plumber" automatically resolves directly to Plumber');
} else {
  console.error('✗ [FAILED] Expected 1 specific match for "Ramesh Plumber"');
  failed++;
}

// Test 4: Kannada query "ರಮೇಶ್" finds both
const kannadaMatches = global.LocalCommandParser.findMatchingCustomers(customers, 'ರಮೇಶ್');
if (kannadaMatches.length === 2) {
  console.log('✓ [PASSED] Kannada "ರಮೇಶ್" correctly matches both Rameshes across scripts');
} else {
  console.error('✗ [FAILED] Expected 2 matches for Kannada "ರಮೇಶ್"');
  failed++;
}

// Test 5: Verify UI Elements
const checks = [
  { name: 'Disambiguation Card Element (#disambiguation-card)', pass: html.includes('id="disambiguation-card"') },
  { name: 'Disambiguation List (#disambig-list)', pass: html.includes('id="disambig-list"') },
  { name: 'Local AI Brain Badge (#ai-brain-badge)', pass: html.includes('id="ai-brain-badge"') },
  { name: 'LocalAIBrain Class in index.html', pass: html.includes('class LocalAIBrain') },
  { name: 'Duplicate Ramesh in SEED_DATA', pass: html.includes('cust_ramesh_plumber') }
];

checks.forEach(c => {
  if (c.pass) {
    console.log(`✓ [PASSED] ${c.name}`);
  } else {
    console.error(`✗ [FAILED] ${c.name}`);
    failed++;
  }
});

if (failed === 0) {
  console.log('\nALL 9 DISAMBIGUATION & AI BRAIN TESTS PASSED! 🚀🎯');
} else {
  process.exit(1);
}
