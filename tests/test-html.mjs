import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Verify index.html contains essential features
const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  { name: 'Three.js 0.160.0 import map', test: html.includes('https://unpkg.com/three@0.160.0/build/three.module.js') },
  { name: 'RoundedBoxGeometry import', test: html.includes('three/addons/geometries/RoundedBoxGeometry.js') },
  { name: 'Bolu 3D canvas', test: html.includes('id="bolu-canvas"') },
  { name: 'WebGL fallback element', test: html.includes('id="webgl-fallback"') },
  { name: 'Vertical guides (17%, 50%, 83%)', test: html.includes('guide-left') && html.includes('guide-mid') && html.includes('guide-right') },
  { name: 'Announcement bar with dismiss', test: html.includes('id="announcement-bar"') && html.includes('id="dismiss-announcement"') },
  { name: 'Section 1 Intro headline', test: html.includes('Boliye.') && html.includes('Hisaab ho gaya.') },
  { name: 'Safe Confirmation preview card', test: html.includes('id="confirmation-card"') && html.includes('id="btn-conf-save"') },
  { name: 'Undo toast functionality', test: html.includes('id="action-toast"') && html.includes('id="toast-undo-btn"') },
  { name: 'Section 3 Trust carousel & principles', test: html.includes('HOW THE KHATA STAYS CLEAR') && html.includes('Confirm before save') },
  { name: 'No unsafe crypto/token mentions', test: !/crypto|token|blockchain|trading|web3/i.test(html) },
  { name: 'Accessible role & aria attributes', test: html.includes('role="region"') && html.includes('aria-label=') },
  { name: 'Regional language selector', test: html.includes('id="language-select"') && html.includes('value="ta-IN"') && html.includes('value="te-IN"') }
];

let allPassed = true;
checks.forEach(c => {
  if (c.test) {
    console.log(`✓ [PASSED] ${c.name}`);
  } else {
    console.error(`✗ [FAILED] ${c.name}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\nAll 12 HTML validation checks passed! 🚀');
} else {
  process.exit(1);
}
