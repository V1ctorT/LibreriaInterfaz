import { 
  BookMarked, 
  BookOpenCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Clock, 
  ArrowRight,
  Plus,
  Calendar
} from 'lucide-react';
import { Book, User, Loan, ActiveTab } from '../types';
import { formatDate, getLoanStatus, getDaysDifference } from '../utils/dateUtils';

interface DashboardViewProps {
  books: Book[];
  users: User[];
  loans: Loan[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenReturnModal: (loan: Loan) => void;
  onOpenNewBook: () => void;
  onOpenNewUser: () => void;
}

export function DashboardView({
  books,
  users,
  loans,
  setActiveTab,
  onOpenNewLoan,
  onOpenReturnModal,
  onOpenNewBook,
  onOpenNewUser,
}: DashboardViewProps) {
  const activeLoans = loans.filter((l) => !l.returnDate);
  const returnedLoans = loans.filter((l) => l.returnDate !== null);
  
  const today = new Date().toISOString().split('T')[0];
  const overdueLoans = activeLoans.filter((l) => l.dueDate < today);
  const dueSoonLoans = activeLoans.filter((l) => {
    const diff = getDaysDifference(l.dueDate);
    return diff >= 0 && diff <= 3;
  });

  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  // Helper map for fast lookup
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Recent loans (active or returned)
  const recentLoans = [...loans]
    .sort((a, b) => b.loanDate.localeCompare(a.loanDate))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Panel de Control de la Biblioteca
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Supervisa el estado del fondo bibliográfico, los préstamos en curso y el historial de devoluciones en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dash-btn-new-loan"
            onClick={onOpenNewLoan}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Préstamo</span>
          </button>
          <button
            id="dash-btn-new-book"
            onClick={onOpenNewBook}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium px-3 py-2.5 rounded-lg transition cursor-pointer"
          >
            <BookMarked className="w-4 h-4 text-emerald-400" />
            <span>+ Libro</span>
          </button>
          <button
            id="dash-btn-new-user"
            onClick={onOpenNewUser}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium px-3 py-2.5 rounded-lg transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>+ Socio</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Catálogo */}
        <div 
          onClick={() => setActiveTab('books')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Catálogo Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{books.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{totalCopies} ejemplares físicos</span>
              <span className="text-emerald-400 font-medium">{availableCopies} disponibles</span>
            </div>
          </div>
        </div>

        {/* Préstamos Activos */}
        <div 
          onClick={() => setActiveTab('loans')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Préstamos Activos</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{activeLoans.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Circulando actualmente</span>
              <span className="text-indigo-300 font-medium group-hover:translate-x-0.5 transition-transform">Ver lista →</span>
            </div>
          </div>
        </div>

        {/* En Mora / Vencidos */}
        <div 
          onClick={() => setActiveTab('loans')}
          className={`border rounded-xl p-4 transition-all cursor-pointer ${
            overdueLoans.length > 0 
              ? 'bg-rose-950/30 border-rose-800/60 hover:border-rose-600' 
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Préstamos en Mora</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              overdueLoans.length > 0
                ? 'bg-rose-900/50 text-rose-400 border border-rose-700/50'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${overdueLoans.length > 0 ? 'text-rose-400' : 'text-white'}`}>
              {overdueLoans.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{dueSoonLoans.length} vencen en &le;3 días</span>
              <span className="text-rose-300 font-medium">Revisar →</span>
            </div>
          </div>
        </div>

        {/* Total Devoluciones / Historial */}
        <div 
          onClick={() => setActiveTab('returns')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Historial Devoluciones</span>
            <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800/50 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{returnedLoans.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Devoluciones registradas</span>
              <span className="text-teal-400 font-medium">Consultar →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Attention Section: Overdue / Due Soon */}
      {(overdueLoans.length > 0 || dueSoonLoans.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Atención Requerida: Préstamos Vencidos o por Vencer</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Total urgentes: {overdueLoans.length + dueSoonLoans.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {[...overdueLoans, ...dueSoonLoans].slice(0, 4).map((loan) => {
              const book = bookMap.get(loan.bookId);
              const user = userMap.get(loan.userId);
              const status = getLoanStatus(loan.dueDate, loan.returnDate);
              const isOverdue = status.type === 'overdue';

              return (
                <div
                  key={loan.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-950/20 border-rose-900/50'
                      : 'bg-amber-950/20 border-amber-900/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isOverdue ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
                      }`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Vence: {formatDate(loan.dueDate)}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate mt-1">
                      {book?.title || 'Libro desconocido'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Socio: <strong className="text-slate-200 font-medium">{user?.name || 'Socio'}</strong> ({user?.phone || 'Sin tel.'})
                    </p>
                  </div>

                  <button
                    id={`btn-dash-return-${loan.id}`}
                    onClick={() => onOpenReturnModal(loan)}
                    className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-800 hover:bg-emerald-700 hover:text-white text-emerald-300 border border-slate-700 hover:border-emerald-600 transition cursor-pointer"
                  >
                    Devolver
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dual Columns: Recent Loans & System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loan Activity (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Actividad Reciente de Préstamos</span>
            </h2>
            <button
              onClick={() => setActiveTab('loans')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Libro</th>
                  <th className="py-2.5 px-3 font-semibold">Socio</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha Préstamo</th>
                  <th className="py-2.5 px-3 font-semibold">Vencimiento</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLoans.map((loan) => {
                  const book = bookMap.get(loan.bookId);
                  const user = userMap.get(loan.userId);
                  const status = getLoanStatus(loan.dueDate, loan.returnDate);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200 truncate max-w-[200px]">
                          {book?.title || 'Libro'}
                        </div>
                        <div className="text-[11px] text-slate-400">{book?.author}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div>{user?.name}</div>
                        <div className="text-[10px] text-slate-400">DNI: {user?.dni}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {formatDate(loan.loanDate)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {formatDate(loan.dueDate)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          status.type === 'overdue'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : status.type.startsWith('returned')
                            ? 'bg-teal-950 text-teal-300 border border-teal-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Guide & Library Insights (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-emerald-400" />
              <span>Guía Rápida de Operación</span>
            </h2>
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">1. Registro de Préstamo</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Selecciona el socio y el libro disponible. Se descuenta automáticamente del inventario disponible.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-emerald-400 mb-1">2. Devolución de Ejemplar</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Haz clic en &quot;Devolver&quot;, califica el estado físico del libro y el stock se repone de inmediato.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1">3. Control de Morosidad</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Los préstamos vencidos se destacan con alertas visuales para avisar al lector o aplicar suspensiones.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total socios activos: <strong className="text-slate-200">{users.length}</strong></span>
            <span>Libros únicos: <strong className="text-slate-200">{books.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
