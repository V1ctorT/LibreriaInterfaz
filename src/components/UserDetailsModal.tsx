import { useMemo } from 'react';
import { 
  X, 
  User as UserIcon, 
  BookOpen, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  Plus 
} from 'lucide-react';
import { User, Loan, Book } from '../types';
import { formatDate, getLoanStatus, getDaysDifference } from '../utils/dateUtils';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  loans: Loan[];
  books: Book[];
  onOpenReturnModal: (loan: Loan) => void;
  onNewLoanForUser: (userId: string) => void;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  loans,
  books,
  onOpenReturnModal,
  onNewLoanForUser,
}: UserDetailsModalProps) {
  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  if (!isOpen || !user) return null;

  const userLoans = loans.filter((l) => l.userId === user.id);
  const activeLoans = userLoans.filter((l) => !l.returnDate);
  const returnedLoans = userLoans
    .filter((l) => l.returnDate !== null)
    .sort((a, b) => (b.returnDate || '').localeCompare(a.returnDate || ''));

  const overdueCount = activeLoans.filter((l) => getDaysDifference(l.dueDate) < 0).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ficha de Lector / Socio</h2>
              <p className="text-xs text-slate-400">Historial completo y préstamos activos de {user.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* User Info Bar */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-400">Socio:</span>
              <div className="font-bold text-slate-100 text-sm mt-0.5">{user.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">DNI: {user.dni}</div>
              <div className="mt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                  {user.type}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Contacto:</span>
              <div className="flex items-center gap-1.5 text-slate-300 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
            </div>

            <div className="flex flex-col justify-between sm:items-end">
              <div>
                <span className="text-[11px] text-slate-400">Cupo de Préstamos:</span>
                <div className="font-bold text-slate-200 mt-0.5">
                  {activeLoans.length} / {user.maxAllowedLoans} en curso
                </div>
              </div>

              {overdueCount > 0 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 inline-flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{overdueCount} préstamo(s) en mora</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 inline-block mt-2">
                  Habilitado para préstamos
                </span>
              )}
            </div>
          </div>

          {/* Active Loans Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Préstamos Activos en Posesión ({activeLoans.length})</span>
              </h3>
              {activeLoans.length < user.maxAllowedLoans && overdueCount === 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onNewLoanForUser(user.id);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Prestar otro libro</span>
                </button>
              )}
            </div>

            {activeLoans.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 text-center text-slate-400">
                El socio no tiene libros prestados actualmente.
              </div>
            ) : (
              <div className="space-y-2">
                {activeLoans.map((loan) => {
                  const book = bookMap.get(loan.bookId);
                  const status = getLoanStatus(loan.dueDate, loan.returnDate);
                  const isOverdue = status.type === 'overdue';

                  return (
                    <div
                      key={loan.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isOverdue
                          ? 'bg-rose-950/30 border-rose-900/60'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-100 truncate">{book?.title || 'Libro'}</div>
                        <div className="text-[11px] text-slate-400">
                          {book?.author} • Límite: <span className="font-mono text-slate-300">{formatDate(loan.dueDate)}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            }`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenReturnModal(loan);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shrink-0"
                      >
                        Devolver
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Returned Loans */}
          <div>
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <History className="w-4 h-4 text-teal-400" />
              <span>Historial de Libros Devueltos ({returnedLoans.length})</span>
            </h3>

            {returnedLoans.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 text-center text-slate-400">
                Aún no hay historial de devoluciones anteriores para este socio.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 divide-y divide-slate-850">
                {returnedLoans.map((loan) => {
                  const book = bookMap.get(loan.bookId);
                  const diff = getDaysDifference(loan.returnDate!, loan.dueDate);
                  const isLate = diff > 0;

                  return (
                    <div key={loan.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-200 truncate">{book?.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Devuelto el <span className="font-mono text-slate-300">{formatDate(loan.returnDate)}</span>
                          {loan.conditionOnReturn && ` • Estado: ${loan.conditionOnReturn}`}
                        </div>
                      </div>

                      <div>
                        {isLate ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                            {diff}d de mora
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            A tiempo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
