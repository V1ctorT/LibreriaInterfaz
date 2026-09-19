import { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  User as UserIcon, 
  Calendar, 
  AlertCircle, 
  Check, 
  Search 
} from 'lucide-react';
import { Book, User, Loan } from '../types';
import { getTodayDateString, addDaysToDate, formatDate } from '../utils/dateUtils';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  users: User[];
  loans: Loan[];
  preselectedBookId?: string;
  preselectedUserId?: string;
  onCreateLoan: (newLoan: Omit<Loan, 'id'>) => void;
}

export function NewLoanModal({
  isOpen,
  onClose,
  books,
  users,
  loans,
  preselectedBookId,
  preselectedUserId,
  onCreateLoan,
}: NewLoanModalProps) {
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId || '');
  const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || '');
  const [loanDate, setLoanDate] = useState(getTodayDateString());
  const [dueDate, setDueDate] = useState(addDaysToDate(getTodayDateString(), 14));
  const [notes, setNotes] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState('');

  // Active loans per user and overdue check
  const userLoanStats = useMemo(() => {
    const today = getTodayDateString();
    const map = new Map<string, { activeCount: number; hasOverdue: boolean }>();

    users.forEach((u) => {
      map.set(u.id, { activeCount: 0, hasOverdue: false });
    });

    loans.forEach((l) => {
      if (!l.returnDate) {
        const stats = map.get(l.userId) || { activeCount: 0, hasOverdue: false };
        stats.activeCount += 1;
        if (l.dueDate < today) {
          stats.hasOverdue = true;
        }
        map.set(l.userId, stats);
      }
    });

    return map;
  }, [users, loans]);

  // Filter books with search
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      return (
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.includes(bookSearch)
      );
    });
  }, [books, bookSearch]);

  // Filter users with search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.dni.includes(userSearch) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    });
  }, [users, userSearch]);

  if (!isOpen) return null;

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedUser = users.find((u) => u.id === selectedUserId);
  const userStats = selectedUser ? userLoanStats.get(selectedUser.id) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBookId) {
      setError('Por favor selecciona un libro del catálogo.');
      return;
    }

    if (!selectedUserId) {
      setError('Por favor selecciona un socio lector.');
      return;
    }

    if (!selectedBook || selectedBook.availableCopies <= 0) {
      setError('El libro seleccionado no tiene ejemplares disponibles en este momento.');
      return;
    }

    if (userStats && selectedUser) {
      if (userStats.hasOverdue) {
        setError('El socio tiene libros con retraso pendiente de entrega. Resuelve primero los préstamos vencidos.');
        return;
      }
      if (userStats.activeCount >= selectedUser.maxAllowedLoans) {
        setError(`El socio ya alcanzó su cupo máximo de ${selectedUser.maxAllowedLoans} préstamos simultáneos.`);
        return;
      }
    }

    if (dueDate <= loanDate) {
      setError('La fecha de vencimiento debe ser posterior a la fecha del préstamo.');
      return;
    }

    onCreateLoan({
      bookId: selectedBookId,
      userId: selectedUserId,
      loanDate,
      dueDate,
      returnDate: null,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Nuevo Préstamo</h2>
              <p className="text-xs text-slate-400">Asigna un ejemplar a un socio lector acreditado</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. Seleccionar Libro a Prestar</span>
              </label>
              {selectedBook && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {selectedBook.availableCopies} ejemplares disponibles
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Filtrar catálogo por título, autor o ISBN..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 divide-y divide-slate-850">
              {filteredBooks.map((book) => {
                const isSelected = selectedBookId === book.id;
                const hasStock = book.availableCopies > 0;

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      if (hasStock) setSelectedBookId(book.id);
                    }}
                    className={`p-2.5 flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-l-4 border-indigo-500 text-white'
                        : hasStock
                        ? 'hover:bg-slate-900 text-slate-300'
                        : 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-950'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{book.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {book.author} • ISBN: {book.isbn} • {book.shelfLocation}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasStock
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {hasStock ? `${book.availableCopies} disp.` : 'Agotado'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Seleccionar Socio Lector</span>
              </label>
              {selectedUser && userStats && (
                <span className="text-[11px] text-slate-300">
                  Préstamos actuales: <strong className="text-white">{userStats.activeCount}</strong> / {selectedUser.maxAllowedLoans}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filtrar por nombre de socio, DNI o email..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 divide-y divide-slate-850">
              {filteredUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                const stats = userLoanStats.get(user.id) || { activeCount: 0, hasOverdue: false };
                const isBlocked = stats.hasOverdue || stats.activeCount >= user.maxAllowedLoans;

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (!isBlocked) setSelectedUserId(user.id);
                    }}
                    className={`p-2.5 flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-l-4 border-amber-500 text-white'
                        : !isBlocked
                        ? 'hover:bg-slate-900 text-slate-300'
                        : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-950'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        DNI: {user.dni} • {user.type} • {user.email}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {stats.hasOverdue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Tiene mora
                        </span>
                      ) : stats.activeCount >= user.maxAllowedLoans ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Cupo lleno ({stats.activeCount}/{user.maxAllowedLoans})
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {stats.activeCount}/{user.maxAllowedLoans} en uso
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates & Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha de Salida</span>
              </label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fecha Límite de Devolución</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDueDate(addDaysToDate(loanDate, 7))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    +7d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(addDaysToDate(loanDate, 14))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800/60 cursor-pointer"
                  >
                    +14d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(addDaysToDate(loanDate, 30))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    +30d
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Observaciones / Finalidad (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Para seminario de investigación, tesis de grado, club de lectura..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="submit-create-loan"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition cursor-pointer"
            >
              Confirmar Préstamo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
