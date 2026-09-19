import { useState, useEffect } from 'react';
import { X, BookMarked, AlertCircle, Save } from 'lucide-react';
import { Book } from '../types';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit: Book | null;
  onSaveBook: (bookData: Omit<Book, 'id'>, id?: string) => void;
}

export function BookModal({
  isOpen,
  onClose,
  bookToEdit,
  onSaveBook,
}: BookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Novela / Ficción');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState(3);
  const [availableCopies, setAvailableCopies] = useState(3);
  const [shelfLocation, setShelfLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn);
      setCategory(bookToEdit.category);
      setPublisher(bookToEdit.publisher);
      setYear(bookToEdit.year);
      setTotalCopies(bookToEdit.totalCopies);
      setAvailableCopies(bookToEdit.availableCopies);
      setShelfLocation(bookToEdit.shelfLocation);
      setDescription(bookToEdit.description);
    } else {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCategory('Novela / Ficción');
      setPublisher('');
      setYear(new Date().getFullYear());
      setTotalCopies(3);
      setAvailableCopies(3);
      setShelfLocation('Estante General');
      setDescription('');
    }
    setError('');
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título del libro es obligatorio.');
      return;
    }
    if (!author.trim()) {
      setError('El autor del libro es obligatorio.');
      return;
    }
    if (!isbn.trim()) {
      setError('El código ISBN es obligatorio para el inventario.');
      return;
    }
    if (totalCopies < 1) {
      setError('Debe registrar al menos 1 ejemplar físico.');
      return;
    }
    if (availableCopies > totalCopies) {
      setError('Los ejemplares disponibles no pueden superar el total de ejemplares.');
      return;
    }
    if (availableCopies < 0) {
      setError('Los ejemplares disponibles no pueden ser negativos.');
      return;
    }

    onSaveBook(
      {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: category.trim(),
        publisher: publisher.trim() || 'Editorial Independiente',
        year: Number(year) || new Date().getFullYear(),
        totalCopies: Number(totalCopies),
        availableCopies: Number(availableCopies),
        shelfLocation: shelfLocation.trim() || 'Estantería General',
        description: description.trim(),
        coverColor: bookToEdit ? bookToEdit.coverColor : 'from-indigo-800 to-slate-950',
      },
      bookToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {bookToEdit ? 'Editar Datos del Libro' : 'Registrar Nuevo Libro en Catálogo'}
              </h2>
              <p className="text-xs text-slate-400">Ficha técnica y control de inventario</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Título del Libro *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Cien años de soledad"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Author */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Autor(a) *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ej. Gabriel García Márquez"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Código ISBN *</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Ej. 978-84-376-0494-7"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Categoría / Género</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Novela / Ficción, Ensayo, Ciencia..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Shelf Location */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Ubicación / Estante</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Ej. Estante A-12, Sala Lectura 2..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Editorial</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Ej. Sudamericana, Alianza, Planeta..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Year */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Año de Publicación</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min="1400"
                max="2099"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
              />
            </div>

            {/* Copies control */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Total Ejemplares Físicos</label>
              <input
                type="number"
                value={totalCopies}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalCopies(val);
                  if (!bookToEdit) setAvailableCopies(val);
                }}
                min="1"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Ejemplares Disponibles</label>
              <input
                type="number"
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                min="0"
                max={totalCopies}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-300 block mb-1">Sinopsis / Descripción</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve reseña o información relevante del ejemplar..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="submit-save-book"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Libro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
