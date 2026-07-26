import { bookCatalog } from '@/data/xueguan/books'

export default function TestPage() {
  return <div>Loaded {bookCatalog.length} books</div>
}
