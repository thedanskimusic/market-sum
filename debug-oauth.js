#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Google OAuth Configuration Diagnostic\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('Please create a .env file based on env.example');
    process.exit(1);
}

// Read and parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

console.log('📋 Environment Variables Check:');
console.log('================================');

// Check Google OAuth variables
const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CALLBACK_URL',
    'FRONTEND_URL'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === '' || value.includes('your_')) {
        console.log(`❌ ${varName}: Not set or using placeholder value`);
        allVarsPresent = false;
    } else {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
});

console.log('\n🔧 Google Cloud Console Setup Checklist:');
console.log('========================================');

console.log('\n1. ✅ Go to https://console.cloud.google.com/');
console.log('2. ✅ Select your project (or create a new one)');
console.log('3. ✅ Enable Google+ API:');
console.log('   - Go to "APIs & Services" > "Library"');
console.log('   - Search for "Google+ API" and enable it');
console.log('4. ✅ Configure OAuth consent screen:');
console.log('   - Go to "APIs & Services" > "OAuth consent screen"');
console.log('   - Choose "External" user type');
console.log('   - Fill in app name, user support email, developer contact');
console.log('   - Add scopes: email, profile, openid');
console.log('   - Add test users if in testing mode');
console.log('5. ✅ Create OAuth 2.0 credentials:');
console.log('   - Go to "APIs & Services" > "Credentials"');
console.log('   - Click "Create Credentials" > "OAuth 2.0 Client IDs"');
console.log('   - Choose "Web application"');
console.log('   - Add authorized redirect URIs:');
console.log(`     ${envVars.GOOGLE_CALLBACK_URL || 'YOUR_CALLBACK_URL'}`);

console.log('\n🔗 Current Configuration:');
console.log('========================');
console.log(`Client ID: ${envVars.GOOGLE_CLIENT_ID || 'NOT SET'}`);
console.log(`Callback URL: ${envVars.GOOGLE_CALLBACK_URL || 'NOT SET'}`);
console.log(`Frontend URL: ${envVars.FRONTEND_URL || 'NOT SET'}`);

console.log('\n🚨 Common Issues & Solutions:');
console.log('=============================');
console.log('1. Client ID not found:');
console.log('   - Verify the Client ID in Google Cloud Console matches your .env file');
console.log('   - Make sure you\'re using the correct project');
console.log('2. Redirect URI mismatch:');
console.log('   - The callback URL in Google Console must exactly match your .env file');
console.log('   - Include the full path: /api/v1/auth/google/callback');
console.log('3. OAuth consent screen not configured:');
console.log('   - Complete the OAuth consent screen setup');
console.log('   - Add your email as a test user if in testing mode');
console.log('4. API not enabled:');
console.log('   - Make sure Google+ API is enabled in your project');

console.log('\n🧪 Test Your Configuration:');
console.log('===========================');
console.log('1. Start your application: npm run start:dev');
console.log('2. Start Cloudflare Tunnel: cloudflared tunnel --url http://localhost:3000');
console.log('3. Visit: https://your-tunnel-url.trycloudflare.com/test-auth.html');
console.log('4. Click "Test Login" to test the OAuth flow');

if (!allVarsPresent) {
    console.log('\n❌ Please fix the missing environment variables before testing.');
    process.exit(1);
} else {
    console.log('\n✅ Environment variables look good!');
    console.log('Proceed with testing the OAuth flow.');
}
