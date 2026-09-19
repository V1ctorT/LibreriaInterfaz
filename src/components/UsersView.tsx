import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2, 
  BookOpen, 
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { User, Loan, Book } from '../types';
import { formatDate } from '../utils/dateUtils';

interface UsersViewProps {
  users: User[];
  loans: Loan[];
  books: Book[];
  onOpenNewUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onViewUserDetails: (user: User) => void;
  onQuickLoanForUser: (userId: string) => void;
}

export function UsersView({
  users,
  loans,
  onOpenNewUser,
  onEditUser,
  onDeleteUser,
  onViewUserDetails,
  onQuickLoanForUser,
}: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Calculate active loans and overdue count for each user
  const userStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const map = new Map<string, { active: number; overdue: number }>();

    users.forEach((u) => {
      map.set(u.id, { active: 0, overdue: 0 });
    });

    loans.forEach((loan) => {
      if (!loan.returnDate) {
        const current = map.get(loan.userId) || { active: 0, overdue: 0 };
        current.active += 1;
        if (loan.dueDate < today) {
          current.overdue += 1;
        }
        map.set(loan.userId, current);
      }
    });

    return map;
  }, [users, loans]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (typeFilter !== 'all' && user.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, typeFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Registro y Directorio de Socios</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2">
              {users.length} lectores
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión de usuarios registrados, cupos de préstamos y fichas individuales.
          </p>
        </div>

        <button
          id="btn-users-new-user"
          onClick={onOpenNewUser}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Socio</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="users-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar socio por nombre, DNI, correo o teléfono..."
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

        <div className="flex items-center gap-2">
          <select
            id="users-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">Todos los Tipos de Socio</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Investigador">Investigador</option>
            <option value="Público General">Público General</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No se encontraron socios</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'all'
              ? 'Prueba modificando tus términos de búsqueda o filtros.'
              : 'No hay socios registrados. Añade el primero ahora.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const stats = userStats.get(user.id) || { active: 0, overdue: 0 };
            const canBorrow = stats.active < user.maxAllowedLoans && stats.overdue === 0;

            return (
              <div
                key={user.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top info and status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {user.type}
                    </span>

                    {stats.overdue > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{stats.overdue} con retraso</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/70">
                        {user.status}
                      </span>
                    )}
                  </div>

                  {/* Name and DNI */}
                  <h3 className="font-bold text-slate-100 text-base leading-snug">
                    {user.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    DNI / Carnet: <strong className="text-slate-300 font-semibold">{user.dni}</strong>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Socio desde {formatDate(user.registeredAt)}</span>
                    </div>
                  </div>

                  {/* Borrowing Quota Gauge */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Cupo de préstamos:</span>
                      <span className="font-semibold text-slate-200">
                        {stats.active} / {user.maxAllowedLoans} en curso
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          stats.overdue > 0
                            ? 'bg-rose-500'
                            : stats.active >= user.maxAllowedLoans
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (stats.active / user.maxAllowedLoans) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-view-user-${user.id}`}
                      onClick={() => onViewUserDetails(user)}
                      title="Ver ficha completa e historial"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-edit-user-${user.id}`}
                      onClick={() => onEditUser(user)}
                      title="Editar datos del socio"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-user-${user.id}`}
                      onClick={() => onDeleteUser(user.id)}
                      disabled={stats.active > 0}
                      title={
                        stats.active > 0
                          ? 'No se puede eliminar: tiene préstamos activos'
                          : 'Eliminar socio'
                      }
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        stats.active > 0
                          ? 'opacity-30 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    id={`btn-loan-user-${user.id}`}
                    onClick={() => onQuickLoanForUser(user.id)}
                    disabled={!canBorrow}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      canBorrow
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{stats.overdue > 0 ? 'Con Mora' : stats.active >= user.maxAllowedLoans ? 'Cupo Lleno' : 'Prestar'}</span>
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
