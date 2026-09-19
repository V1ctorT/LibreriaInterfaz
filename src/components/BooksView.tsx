import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  BookMarked, 
  Layers, 
  MapPin, 
  Edit3, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Book, Loan } from '../types';

interface BooksViewProps {
  books: Book[];
  loans: Loan[];
  onOpenNewBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onQuickLoanBook: (bookId: string) => void;
}

export function BooksView({
  books,
  loans,
  onOpenNewBook,
  onEditBook,
  onDeleteBook,
  onQuickLoanBook,
}: BooksViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'depleted'>('all');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  // Active loans per book
  const activeLoansByBook = useMemo(() => {
    const map = new Map<string, number>();
    loans.forEach((l) => {
      if (!l.returnDate) {
        map.set(l.bookId, (map.get(l.bookId) || 0) + 1);
      }
    });
    return map;
  }, [loans]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchTerm === '' ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.shelfLocation.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter !== 'all' && book.category !== categoryFilter) {
        return false;
      }

      if (stockFilter === 'available' && book.availableCopies <= 0) {
        return false;
      }

      if (stockFilter === 'depleted' && book.availableCopies > 0) {
        return false;
      }

      return true;
    });
  }, [books, searchTerm, categoryFilter, stockFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-400" />
            <span>Catálogo e Inventario de Libros</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2">
              {books.length} títulos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro bibliográfico, control de ejemplares disponibles y asignación de estantería.
          </p>
        </div>

        <button
          id="btn-books-new-book"
          onClick={onOpenNewBook}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Nuevo Libro</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="books-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, autor, ISBN, editorial, estante..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <select
            id="books-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStockFilter('available')}
              className={`px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                stockFilter === 'available'
                  ? 'bg-emerald-950 text-emerald-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setStockFilter('depleted')}
              className={`px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                stockFilter === 'depleted'
                  ? 'bg-rose-950 text-rose-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agotados
            </button>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No se encontraron libros</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Prueba modificando tus términos de búsqueda o filtros.'
              : 'El catálogo está vacío. Comienza registrando un libro.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const activeLoansCount = activeLoansByBook.get(book.id) || 0;

            return (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {book.category}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isAvailable
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70'
                          : 'bg-rose-950/70 text-rose-300 border-rose-800/70'
                      }`}
                    >
                      {isAvailable
                        ? `${book.availableCopies} de ${book.totalCopies} disponibles`
                        : 'Agotado (0 disponibles)'}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-indigo-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {book.author}
                  </p>

                  {/* Metadata */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>ISBN: <strong className="font-mono text-slate-300">{book.isbn}</strong></span>
                      <span>Año: <strong className="text-slate-300">{book.year}</strong></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[180px]">Editorial: {book.publisher}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 bg-slate-950/60 px-2 py-1 rounded mt-2 border border-slate-800">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{book.shelfLocation}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  {book.description && (
                    <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 italic">
                      &quot;{book.description}&quot;
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-book-${book.id}`}
                      onClick={() => onEditBook(book)}
                      title="Editar información del libro"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-book-${book.id}`}
                      onClick={() => onDeleteBook(book.id)}
                      title={
                        activeLoansCount > 0
                          ? 'No se puede eliminar: tiene préstamos activos'
                          : 'Eliminar del catálogo'
                      }
                      disabled={activeLoansCount > 0}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        activeLoansCount > 0
                          ? 'opacity-30 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick loan button */}
                  <button
                    id={`btn-loan-book-${book.id}`}
                    onClick={() => onQuickLoanBook(book.id)}
                    disabled={!isAvailable}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isAvailable ? 'Prestar' : 'Sin Stock'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
