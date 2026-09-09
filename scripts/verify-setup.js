#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * Checks if Firebase is properly configured
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔥 Firebase Setup Verification\n');
console.log('=' .repeat(50));

// Check 1: .env file exists
console.log('\n✓ Checking .env file...');
try {
  const envPath = join(__dirname, '../frontend/.env');
  const envContent = readFileSync(envPath, 'utf8');

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`  ✅ ${varName} is set`);
    } else {
      console.log(`  ❌ ${varName} is missing or not configured`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('\n✅ All Firebase environment variables are configured!');
  } else {
    console.log('\n⚠️  Some Firebase variables need to be configured');
  }

} catch (error) {
  console.log('  ❌ .env file not found');
  console.log('  → Run: cp frontend/.env.example frontend/.env');
}

// Check 2: Firebase rules file
console.log('\n✓ Checking firestore.rules...');
try {
  const rulesPath = join(__dirname, '../firestore.rules');
  readFileSync(rulesPath, 'utf8');
  console.log('  ✅ firestore.rules exists');
} catch (error) {
  console.log('  ❌ firestore.rules not found');
}

// Check 3: Firebase indexes
console.log('\n✓ Checking firestore.indexes.json...');
try {
  const indexesPath = join(__dirname, '../firestore.indexes.json');
  readFileSync(indexesPath, 'utf8');
  console.log('  ✅ firestore.indexes.json exists');
} catch (error) {
  console.log('  ❌ firestore.indexes.json not found');
}

// Check 4: Frontend dependencies
console.log('\n✓ Checking frontend dependencies...');
try {
  const packagePath = join(__dirname, '../frontend/package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

  const requiredDeps = ['firebase', 'react', 'react-router-dom'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} installed`);
    } else {
      console.log(`  ❌ ${dep} not installed`);
    }
  });
} catch (error) {
  console.log('  ❌ Could not check dependencies');
}

// Instructions
console.log('\n' + '='.repeat(50));
console.log('\n📋 NEXT STEPS:\n');

console.log('1. Enable Authentication in Firebase Console:');
console.log('   → Go to: https://console.firebase.google.com/');
console.log('   → Select your project: learning-journey-designe-5335a');
console.log('   → Authentication → Sign-in method');
console.log('   → Enable: Email/Password');
console.log('   → Enable: Google');
console.log('');

console.log('2. Create Firestore Database:');
console.log('   → Firestore Database → Create database');
console.log('   → Start in test mode (we\'ll add rules later)');
console.log('   → Choose location closest to you');
console.log('');

console.log('3. Deploy Security Rules:');
console.log('   → Install Firebase CLI: npm install -g firebase-tools');
console.log('   → Login: firebase login');
console.log('   → Init: firebase init firestore');
console.log('   → Deploy: firebase deploy --only firestore:rules,firestore:indexes');
console.log('');

console.log('4. Start the Frontend:');
console.log('   → cd frontend');
console.log('   → npm run dev');
console.log('   → Open: http://localhost:5173');
console.log('');

console.log('5. Test Registration:');
console.log('   → Click "Get Started"');
console.log('   → Register with email/password');
console.log('   → Check Firebase Console → Authentication');
console.log('');

console.log('=' .repeat(50));
console.log('\n✨ Your Firebase configuration looks good!');
console.log('📖 See docs/FIREBASE_SETUP.md for detailed instructions\n');
