/**
 * Bulk add data-testid attributes to all interactive elements
 * Run: node scripts/add-test-ids.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function findFiles(dir, pattern, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            findFiles(fullPath, pattern, results);
        } else if (entry.isFile() && pattern.test(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

function getContextFromPath(filePath) {
    const rel = path.relative(srcDir, filePath).replace(/\\/g, '/');
    // Extract meaningful context from path
    const parts = rel.split('/');
    // e.g. app/admin/users/create/page.tsx -> admin-users-create
    const meaningful = parts
        .filter(p => !['app', 'src', 'page.tsx', 'layout.tsx', '(auth)'].includes(p))
        .join('-')
        .replace(/\[.*?\]/g, 'id')
        .replace(/\.tsx$/, '');
    return meaningful || 'page';
}

let totalAdded = 0;
let filesModified = 0;

function addTestIds(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const ctx = getContextFromPath(filePath);
    let changeCount = 0;

    // Skip if already has data-testid extensively
    const existingCount = (content.match(/data-testid=/g) || []).length;
    if (existingCount > 5) return; // Already processed

    // 1. Add to <Button elements without data-testid
    content = content.replace(
        /<Button(\s)(?!.*data-testid)(.*?onClick=\{.*?\})/g,
        (match, space, rest) => {
            const fnMatch = rest.match(/onClick=\{\(\)\s*=>\s*(\w+)/);
            const fnMatch2 = rest.match(/onClick=\{(\w+)\}/);
            const fn = fnMatch?.[1] || fnMatch2?.[1] || 'action';
            const id = `btn-${fn.replace(/^handle/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}-${ctx}`.substring(0, 60);
            changeCount++;
            return `<Button data-testid="${id}"${space}${rest}`;
        }
    );

    // 2. Add to <button elements (lowercase) without data-testid
    content = content.replace(
        /<button(\s)(?!.*data-testid)(.*?onClick=)/g,
        (match, space, rest) => {
            changeCount++;
            return `<button data-testid="btn-${ctx}-${changeCount}"${space}${rest}`;
        }
    );

    // 3. Add to <input elements without data-testid
    content = content.replace(
        /<input(\s)(?!.*data-testid)(.*?(?:type|name|placeholder)="(\w+)")/g,
        (match, space, rest, typeOrName) => {
            const id = `input-${typeOrName}-${ctx}`.substring(0, 60);
            changeCount++;
            return `<input data-testid="${id}"${space}${rest}`;
        }
    );

    // 4. Add to <select elements without data-testid
    content = content.replace(
        /<select(\s)(?!.*data-testid)/g,
        (match, space) => {
            changeCount++;
            return `<select data-testid="select-${ctx}-${changeCount}"${space}`;
        }
    );

    // 5. Add to <Link elements without data-testid
    content = content.replace(
        /<Link(\s)(?!.*data-testid)(.*?href="([^"]+)")/g,
        (match, space, rest, href) => {
            const hrefId = href.replace(/^\//, '').replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '') || 'home';
            const id = `link-${hrefId}`.substring(0, 60);
            changeCount++;
            return `<Link data-testid="${id}"${space}${rest}`;
        }
    );

    // 6. Add to <form elements without data-testid
    content = content.replace(
        /<form(\s)(?!.*data-testid)/g,
        (match, space) => {
            changeCount++;
            return `<form data-testid="form-${ctx}"${space}`;
        }
    );

    if (changeCount > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesModified++;
        totalAdded += changeCount;
        console.log(`  [${changeCount} IDs] ${path.relative(srcDir, filePath)}`);
    }
}

console.log('Adding data-testid attributes...\n');

// Find all .tsx files in app/ and components/
const files = [
    ...findFiles(path.join(srcDir, 'app'), /\.(tsx)$/),
    ...findFiles(path.join(srcDir, 'components'), /\.(tsx)$/),
];

console.log(`Found ${files.length} .tsx files\n`);

for (const file of files) {
    try {
        addTestIds(file);
    } catch (e) {
        // Skip files that can't be processed
    }
}

console.log(`\nDone! Modified ${filesModified} files, added ~${totalAdded} data-testid attributes.`);
