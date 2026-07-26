import { bookCatalog } from '../src/data/xueguan/books.js'

console.log(`Loaded ${bookCatalog.length} books`)

// Check all required fields
const requiredFields = ['id', 'title', 'author', 'dynasty', 'category', 'summary', 'description', 'keywords', 'volumes', 'isComplete', 'order']
for (const book of bookCatalog) {
  for (const field of requiredFields) {
    if (book[field] === undefined || book[field] === null) {
      console.log(`MISSING ${field} in book: ${book.id || 'unknown'}`)
    }
  }
}

console.log('Validation done')
