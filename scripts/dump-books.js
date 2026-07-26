// Extract book IDs and categories for debugging
const fs = require('fs');
const content = fs.readFileSync(__dirname + '/../src/data/xueguan/books.ts', 'utf-8');

// Find book IDs - each book has `    id: 'xxx',` at the start
const idRegex = /^    id: '([^']+)',$/gm;
const ids = [];
let m;
while ((m = idRegex.exec(content)) !== null) {
  ids.push(m[1]);
}

// Find categories
const catRegex = /^    category: '([^']+)',$/gm;
const cats = [];
while ((m = catRegex.exec(content)) !== null) {
  cats.push(m[1]);
}

console.log(`Books: ${ids.length}, Categories: ${cats.length}`);
ids.forEach((id, i) => {
  const cat = cats[i] || 'MISSING';
  if (i < 3 || i > ids.length - 4) {
    console.log(`  ${i+1}. ${cat} / ${id}`);
  }
});
if (ids.length > 6) console.log('  ...');

// Check for any books whose category doesn't exist in the category tree
const { categoryTree, flattenCategories } = require('./require-shim') || {};
