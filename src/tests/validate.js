#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating ProActive Sports Frontend...\n');

// Check for required files
const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.js',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/globals.css'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

// Check for common react-icons issues
const invalidIcons = ['FiTrain', 'FiTransport', 'FiSubway'];
const srcDir = 'src';

function checkForInvalidIcons(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            checkForInvalidIcons(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');

            invalidIcons.forEach(icon => {
                if (content.includes(icon)) {
                    console.log(`⚠️  Found invalid icon ${icon} in ${filePath}`);
                }
            });
        }
    });
}

if (fs.existsSync(srcDir)) {
    checkForInvalidIcons(srcDir);
}

console.log('\n🎯 Validation complete!');

if (allFilesExist) {
    console.log('✅ All required files are present');
    console.log('🚀 Ready to run: npm run dev');
} else {
    console.log('❌ Some required files are missing');
    console.log('💡 Run: npm run setup');
}