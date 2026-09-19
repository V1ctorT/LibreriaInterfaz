import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  AlertTriangle,
  Calendar,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { Book, User, Loan } from '../types';
import { formatDate, getLoanStatus, getDaysDifference, addDaysToDate } from '../utils/dateUtils';

interface LoansViewProps {
  loans: Loan[];
  books: Book[];
  users: User[];
  onOpenNewLoan: () => void;
  onOpenReturnModal: (loan: Loan) => void;
  onRenewLoan: (loanId: string, daysToAdd: number) => void;
  onDeleteLoan: (loanId: string) => void;
}

export function LoansView({
  loans,
  books,
  users,
  onOpenNewLoan,
  onOpenReturnModal,
  onRenewLoan,
}: LoansViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'active'>('all');

  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  // Only active loans (not returned yet)
  const activeLoans = useMemo(() => {
    return loans.filter((l) => !l.returnDate);
  }, [loans]);

  // Filtered active loans
  const filteredLoans = useMemo(() => {
    return activeLoans.filter((loan) => {
      const book = bookMap.get(loan.bookId);
      const user = userMap.get(loan.userId);

      const matchesSearch =
        searchTerm === '' ||
        (book?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book?.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book?.isbn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.dni || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;

      const diff = getDaysDifference(loan.dueDate);
      if (statusFilter === 'overdue') {
        return diff < 0;
      }
      if (statusFilter === 'due_soon') {
        return diff >= 0 && diff <= 3;
      }
      if (statusFilter === 'active') {
        return diff > 3;
      }

      return true;
    });
  }, [activeLoans, bookMap, userMap, searchTerm, statusFilter]);

  // Overdue count
  const overdueCount = activeLoans.filter((l) => getDaysDifference(l.dueDate) < 0).length;
  const dueSoonCount = activeLoans.filter((l) => {
    const d = getDaysDifference(l.dueDate);
    return d >= 0 && d <= 3;
  }).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Gestión de Préstamos Activos</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2">
              {activeLoans.length} activos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Controla las fechas de vencimiento, renovaciones y registro de devoluciones.
          </p>
        </div>

        <button
          id="btn-loans-new-loan"
          onClick={onOpenNewLoan}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Préstamo</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="loans-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por libro, autor, socio o DNI..."
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            Todos ({activeLoans.length})
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'overdue'
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800 font-semibold'
                : 'text-rose-400 hover:bg-rose-950/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Vencidos ({overdueCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'due_soon'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800 font-semibold'
                : 'text-amber-400 hover:bg-amber-950/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Vencen pronto ({dueSoonCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-800 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            Al día
          </button>
        </div>
      </div>

      {/* Loans Table / Desktop View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No se encontraron préstamos activos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'No hay registros que coincidan con los filtros aplicados.'
                : 'No hay libros prestados en este momento.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs text-indigo-400 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Libro Prestado</th>
                  <th className="py-3 px-4">Socio / Lector</th>
                  <th className="py-3 px-4">Fecha Préstamo</th>
                  <th className="py-3 px-4">Fecha Límite</th>
                  <th className="py-3 px-4">Estado / Plazo</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLoans.map((loan) => {
                  const book = bookMap.get(loan.bookId);
                  const user = userMap.get(loan.userId);
                  const status = getLoanStatus(loan.dueDate, loan.returnDate);
                  const isOverdue = status.type === 'overdue';
                  const isDueSoon = status.type === 'due_soon' || status.type === 'due_today';

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isOverdue ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Book Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 text-sm">{book?.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {book?.author} • <span className="font-mono text-slate-400">{book?.isbn}</span>
                        </div>
                        <div className="text-[10px] text-indigo-300/80 mt-1">
                          📍 {book?.shelfLocation}
                        </div>
                      </td>

                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user?.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          DNI: <span className="font-mono text-slate-300">{user?.dni}</span> • {user?.type}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          📞 {user?.phone}
                        </div>
                      </td>

                      {/* Loan Date */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(loan.loanDate)}</span>
                        </div>
                        {loan.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[140px]" title={loan.notes}>
                            📝 {loan.notes}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className={`font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                          {formatDate(loan.dueDate)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isOverdue
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                              : isDueSoon
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          {isDueSoon && <Clock className="w-3 h-3 text-amber-400" />}
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast renewal button */}
                          <button
                            id={`btn-renew-7-${loan.id}`}
                            onClick={() => onRenewLoan(loan.id, 7)}
                            title="Renovar préstamo por 7 días más"
                            className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md border border-slate-700 transition cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3 text-indigo-400" />
                            <span>+7d</span>
                          </button>

                          {/* Return Book button (Primary) */}
                          <button
                            id={`btn-return-modal-${loan.id}`}
                            onClick={() => onOpenReturnModal(loan)}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md shadow transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registrar Devolución</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
