import { useState, useEffect } from 'react';
import { 
  Library, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';
import { Book, User, Loan } from '../types';

interface DesktopHeaderProps {
  books: Book[];
  users: User[];
  loans: Loan[];
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onOpenNewUser: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

export function DesktopHeader({
  books,
  loans,
  onOpenNewLoan,
  onExportData,
  onImportData,
  onResetData,
}: DesktopHeaderProps) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick stats
  const activeLoans = loans.filter((l) => !l.returnDate);
  const overdueLoans = activeLoans.filter((l) => {
    const today = new Date().toISOString().split('T')[0];
    return l.dueDate < today;
  });
  const totalAvailableStock = books.reduce((acc, b) => acc + b.availableCopies, 0);

  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Window Controls & App Branding */}
      <div className="flex items-center gap-4">
        {/* Desktop window dots */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors cursor-pointer" title="Cerrar / Salir" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors cursor-pointer" title="Minimizar" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer" title="Maximizar" />
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Library className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-tight">BiblioDesk Pro</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Escritorio v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Gestión Integral de Préstamos & Catálogo</p>
          </div>
        </div>
      </div>

      {/* Center Live Badges */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize font-mono text-[11px] text-slate-300">{timeString}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>{totalAvailableStock} ejemp. disponibles</span>
        </div>

        {overdueLoans.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">{overdueLoans.length} préstamos en mora</span>
          </div>
        )}
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2">
        {/* Export / Backup */}
        <button
          id="btn-export-backup"
          onClick={onExportData}
          title="Exportar copia de seguridad en JSON"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Respaldar</span>
        </button>

        {/* Import */}
        <label
          htmlFor="import-json-file"
          title="Restaurar copia de seguridad"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Importar</span>
          <input
            id="import-json-file"
            type="file"
            accept=".json"
            onChange={onImportData}
            className="hidden"
          />
        </label>

        {/* Reset Demo */}
        <button
          id="btn-reset-demo"
          onClick={onResetData}
          title="Restaurar datos de ejemplo de la biblioteca"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-800/50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Restablecer</span>
        </button>

        {/* Primary Action: New Loan */}
        <button
          id="btn-quick-new-loan"
          onClick={onOpenNewLoan}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>
    </header>
  );
}
