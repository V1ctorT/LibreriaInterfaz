import { 
  LayoutDashboard, 
  BookOpenCheck, 
  BookMarked, 
  Users, 
  History, 
  ShieldCheck, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { ActiveTab, Book, User, Loan } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  books: Book[];
  users: User[];
  loans: Loan[];
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onOpenNewUser: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  books,
  users,
  loans,
  onOpenNewLoan,
  onOpenNewBook,
  onOpenNewUser,
}: SidebarProps) {
  const activeLoansCount = loans.filter((l) => !l.returnDate).length;
  const overdueCount = loans.filter((l) => {
    if (l.returnDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return l.dueDate < today;
  }).length;
  const returnedCount = loans.filter((l) => l.returnDate !== null).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Panel General',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'loans' as ActiveTab,
      label: 'Préstamos Activos',
      icon: BookOpenCheck,
      badge: activeLoansCount,
      alertBadge: overdueCount > 0 ? `${overdueCount} mora` : null,
    },
    {
      id: 'books' as ActiveTab,
      label: 'Catálogo de Libros',
      icon: BookMarked,
      badge: books.length,
    },
    {
      id: 'users' as ActiveTab,
      label: 'Registro de Socios',
      icon: Users,
      badge: users.length,
    },
    {
      id: 'returns' as ActiveTab,
      label: 'Historial Devoluciones',
      icon: History,
      badge: returnedCount,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 select-none">
      {/* Navigation section */}
      <div className="space-y-6">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navegación Principal
          </div>
          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.alertBadge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.alertBadge}
                      </span>
                    )}
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-indigo-500/30 text-indigo-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Operations panel */}
        <div className="pt-2 border-t border-slate-900">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Operaciones Rápidas
          </div>
          <div className="space-y-1.5 mt-1">
            <button
              id="sidebar-new-loan"
              onClick={onOpenNewLoan}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Registrar Préstamo</span>
            </button>
            <button
              id="sidebar-new-book"
              onClick={onOpenNewBook}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Añadir Nuevo Libro</span>
            </button>
            <button
              id="sidebar-new-user"
              onClick={onOpenNewUser}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Registrar Nuevo Socio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer information panel */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Almacenamiento Local</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Los datos se sincronizan automáticamente en tu navegador para disponibilidad continua sin conexión.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="bg-rose-950/40 rounded-lg p-2.5 border border-rose-800/40 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-300 leading-tight">
              Hay <strong className="font-semibold">{overdueCount}</strong> préstamo(s) que requieren reclamo o gestión de mora.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
