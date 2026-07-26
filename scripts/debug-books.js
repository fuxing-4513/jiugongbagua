// Quick validation test
const fs = require('fs');
const content = fs.readFileSync(__dirname + '/../src/data/xueguan/books.ts', 'utf-8');

// Simulate the import to check for runtime issues
// Extract all book id/category pairs
const lines = content.split('\n');
let currentBook = null;
let books = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("    id: '") && !line.includes("id: 'juan") && !line.includes("id: 'ch")) {
    const match = line.match(/id: '([^']+)'/);
    if (match) {
      if (currentBook) {
        // Check required fields
        const missing = [];
        if (!currentBook.category) missing.push('category');
        if (!currentBook.title) missing.push('title');
        if (!currentBook.author) missing.push('author');
        if (!currentBook.order) missing.push('order');
        if (!currentBook.summary) missing.push('summary');
        if (missing.length > 0) {
          console.log(`Book "${currentBook.id}" missing: ${missing.join(', ')}`);
        }
      }
      currentBook = { id: match[1], line: i + 1 };
    }
  } else if (currentBook) {
    if (line.includes("title: '")) {
      const m = line.match(/title: '([^']+)'/);
      if (m) currentBook.title = m[1];
    } else if (line.includes("category: '")) {
      const m = line.match(/category: '([^']+)'/);
      if (m) currentBook.category = m[1];
    } else if (line.includes("author: '")) {
      const m = line.match(/author: '([^']+)'/);
      if (m) currentBook.author = m[1];
    } else if (line.includes("order:")) {
      currentBook.order = true;
    } else if (line.includes("summary: '")) {
      const m = line.match(/summary: '([^']+)'/);
      if (m) currentBook.summary = m[1];
    }
  }
}

console.log(`Found ${Object.keys(books).length} books`);
