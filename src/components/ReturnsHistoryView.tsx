import { useState, useMemo } from 'react';
import { 
  Search, 
  History, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Sparkles,
  BookOpen,
  User as UserIcon
} from 'lucide-react';
import { Loan, Book, User } from '../types';
import { formatDate, getDaysDifference } from '../utils/dateUtils';

interface ReturnsHistoryViewProps {
  loans: Loan[];
  books: Book[];
  users: User[];
}

export function ReturnsHistoryView({ loans, books, users }: ReturnsHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [punctualityFilter, setPunctualityFilter] = useState<'all' | 'on_time' | 'late'>('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  // Only returned loans
  const returnedLoans = useMemo(() => {
    return loans
      .filter((l) => l.returnDate !== null)
      .sort((a, b) => (b.returnDate || '').localeCompare(a.returnDate || ''));
  }, [loans]);

  // Filtered
  const filteredReturns = useMemo(() => {
    return returnedLoans.filter((loan) => {
      const book = bookMap.get(loan.bookId);
      const user = userMap.get(loan.userId);

      const matchesSearch =
        searchTerm === '' ||
        (book?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book?.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.dni || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loan.returnedNotes || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Punctuality
      const diff = getDaysDifference(loan.returnDate!, loan.dueDate);
      const isLate = diff > 0;

      if (punctualityFilter === 'on_time' && isLate) return false;
      if (punctualityFilter === 'late' && !isLate) return false;

      // Condition
      if (conditionFilter !== 'all' && loan.conditionOnReturn !== conditionFilter) {
        return false;
      }

      return true;
    });
  }, [returnedLoans, bookMap, userMap, searchTerm, punctualityFilter, conditionFilter]);

  // Statistics
  const onTimeCount = returnedLoans.filter(
    (l) => getDaysDifference(l.returnDate!, l.dueDate) <= 0
  ).length;
  const onTimeRate = returnedLoans.length > 0 
    ? Math.round((onTimeCount / returnedLoans.length) * 100) 
    : 100;

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Préstamo',
      'Título Libro',
      'ISBN',
      'Socio',
      'DNI',
      'Fecha Préstamo',
      'Fecha Límite',
      'Fecha Devolución',
      'Puntualidad',
      'Condición del Libro',
      'Observaciones'
    ];

    const rows = filteredReturns.map((loan) => {
      const book = bookMap.get(loan.bookId);
      const user = userMap.get(loan.userId);
      const diff = getDaysDifference(loan.returnDate!, loan.dueDate);
      const puntuality = diff > 0 ? `Con mora (${diff} días)` : 'A tiempo';

      return [
        loan.id,
        `"${book?.title || ''}"`,
        `"${book?.isbn || ''}"`,
        `"${user?.name || ''}"`,
        `"${user?.dni || ''}"`,
        loan.loanDate,
        loan.dueDate,
        loan.returnDate || '',
        `"${puntuality}"`,
        `"${loan.conditionOnReturn || 'No registrada'}"`,
        `"${loan.returnedNotes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_devoluciones_biblioteca_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <span>Historial y Auditoría de Devoluciones</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2">
              {returnedLoans.length} registradas
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro permanente de devoluciones realizadas, estado del material y puntualidad.
          </p>
        </div>

        <button
          id="btn-export-returns-csv"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800/40 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar a CSV</span>
        </button>
      </div>

      {/* Summary metric banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Devoluciones</span>
            <div className="text-xl font-bold text-white mt-0.5">{returnedLoans.length}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-teal-400 opacity-80" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Devoluciones a Tiempo</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {onTimeRate}% <span className="text-xs text-slate-400 font-normal">({onTimeCount} de {returnedLoans.length})</span>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Devoluciones con Retraso</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">
              {returnedLoans.length - onTimeCount}
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400 opacity-80" />
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="returns-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por libro, autor, socio, DNI o nota..."
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
          {/* Punctuality Filter */}
          <select
            id="returns-punctuality-filter"
            value={punctualityFilter}
            onChange={(e) => setPunctualityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">Toda Puntualidad</option>
            <option value="on_time">Solo A Tiempo</option>
            <option value="late">Con Mora / Retraso</option>
          </select>

          {/* Condition Filter */}
          <select
            id="returns-condition-filter"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">Todo Estado Físico</option>
            <option value="Excelente">Excelente</option>
            <option value="Bueno">Bueno</option>
            <option value="Aceptable">Aceptable</option>
            <option value="Con Daños">Con Daños</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredReturns.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No hay devoluciones registradas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || punctualityFilter !== 'all' || conditionFilter !== 'all'
                ? 'No se encontraron resultados con los filtros actuales.'
                : 'Aún no se han registrado devoluciones de libros.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Libro</th>
                  <th className="py-3 px-4">Socio Lector</th>
                  <th className="py-3 px-4">Préstamo</th>
                  <th className="py-3 px-4">Devuelto el</th>
                  <th className="py-3 px-4">Puntualidad</th>
                  <th className="py-3 px-4">Condición</th>
                  <th className="py-3 px-4">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReturns.map((loan) => {
                  const book = bookMap.get(loan.bookId);
                  const user = userMap.get(loan.userId);
                  const diff = getDaysDifference(loan.returnDate!, loan.dueDate);
                  const isLate = diff > 0;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{book?.title || 'Libro'}</div>
                        <div className="text-[11px] text-slate-400">{book?.author}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{user?.name || 'Socio'}</div>
                        <div className="text-[11px] text-slate-400">DNI: {user?.dni}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono">
                        <div>{formatDate(loan.loanDate)}</div>
                        <div className="text-[10px] text-slate-400">Límite: {formatDate(loan.dueDate)}</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-teal-300">{formatDate(loan.returnDate)}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isLate ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{diff} días de mora</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>A tiempo</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          loan.conditionOnReturn === 'Excelente'
                            ? 'bg-emerald-900/50 text-emerald-200'
                            : loan.conditionOnReturn === 'Bueno'
                            ? 'bg-blue-900/50 text-blue-200'
                            : loan.conditionOnReturn === 'Aceptable'
                            ? 'bg-amber-900/50 text-amber-200'
                            : 'bg-rose-900/50 text-rose-200'
                        }`}>
                          {loan.conditionOnReturn || 'Bueno'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-xs">
                        <span className="text-[11px] line-clamp-2">
                          {loan.returnedNotes || '—'}
                        </span>
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
