const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript and TSX files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to replace content in files
function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from, 'g'), to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Define replacements
const replacements = [
  // Parameter types
  { from: 'params: Promise<{ storeId: string }>', to: 'params: Promise<{ subdomain: string }>' },
  { from: 'params: { storeId: string }', to: 'params: { subdomain: string }' },
  
  // Destructuring
  { from: 'const { storeId }', to: 'const { subdomain }' },
  { from: '{ storeId }', to: '{ subdomain }' },
  
  // URL segments in template literals
  { from: '\\${storeId}', to: '${subdomain}' },
  { from: '/\\[storeId\\]/', to: '/[subdomain]/' },
  
  // Props and interfaces
  { from: 'storeId:', to: 'subdomain:' },
  { from: 'storeId\\?:', to: 'subdomain?:' },
  { from: 'storeId\\s*=', to: 'subdomain =' },
  
  // Function parameters
  { from: '\\(storeId:', to: '(subdomain:' },
  { from: '\\{ storeId:', to: '{ subdomain:' },
  
  // Comments and documentation
  { from: 'Store ID', to: 'Store subdomain' },
  { from: 'store ID', to: 'store subdomain' },
];

// Find all relevant files
const directories = [
  'app/dashboard/stores/[subdomain]',
  'app/api/stores/[subdomain]'
];

let allFiles = [];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(findTsFiles(dir));
  }
});

console.log(`Found ${allFiles.length} TypeScript files to process...`);

// Process each file
allFiles.forEach(filePath => {
  // Skip if path contains [subdomain] folder but we want to focus on store-related files
  if (filePath.includes('stores/[subdomain]')) {
    replaceInFile(filePath, replacements);
  }
});

console.log('Refactoring complete!');