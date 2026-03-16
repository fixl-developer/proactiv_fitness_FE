#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ProActive Sports Frontend...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully!\n');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed\n');
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
    if (fs.existsSync('.env.local.example')) {
        console.log('📝 Creating .env.local from example...');
        fs.copyFileSync('.env.local.example', '.env.local');
        console.log('✅ .env.local created! Please update with your settings.\n');
    }
} else {
    console.log('✅ .env.local already exists\n');
}

// Verify react-icons installation
try {
    require.resolve('react-icons');
    console.log('✅ react-icons is properly installed\n');
} catch (error) {
    console.log('⚠️  Installing react-icons...');
    try {
        execSync('npm install react-icons@^4.12.0', { stdio: 'inherit' });
        console.log('✅ react-icons installed successfully!\n');
    } catch (installError) {
        console.error('❌ Failed to install react-icons:', installError.message);
    }
}

console.log('🎉 Setup complete! You can now run:');
console.log('   npm run dev');
console.log('\n📖 For more help, see INSTALLATION.md');