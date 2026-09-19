import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  User as UserIcon, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Loan, Book, User, BookCondition } from '../types';
import { formatDate, getTodayDateString, getDaysDifference } from '../utils/dateUtils';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  book?: Book;
  user?: User;
  onConfirmReturn: (
    loanId: string,
    returnDate: string,
    condition: BookCondition,
    returnedNotes: string
  ) => void;
}

export function ReturnModal({
  isOpen,
  onClose,
  loan,
  book,
  user,
  onConfirmReturn,
}: ReturnModalProps) {
  const [returnDate, setReturnDate] = useState(getTodayDateString());
  const [condition, setCondition] = useState<BookCondition>('Excelente');
  const [returnedNotes, setReturnedNotes] = useState('Devuelto a tiempo y en óptimas condiciones.');

  if (!isOpen || !loan) return null;

  const diff = getDaysDifference(returnDate, loan.dueDate);
  const isLate = diff > 0;

  const handleConditionChange = (newCond: BookCondition) => {
    setCondition(newCond);
    if (newCond === 'Excelente') {
      setReturnedNotes(isLate ? `Devuelto con ${diff} días de mora en óptimas condiciones.` : 'Devuelto a tiempo y en óptimas condiciones.');
    } else if (newCond === 'Bueno') {
      setReturnedNotes('Buen estado general sin dobleces graves.');
    } else if (newCond === 'Aceptable') {
      setReturnedNotes('Muestra desgaste leve de uso.');
    } else if (newCond === 'Con Daños') {
      setReturnedNotes('Presenta manchas, roturas o anotaciones.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReturn(loan.id, returnDate, condition, returnedNotes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Devolución</h2>
              <p className="text-xs text-slate-400">Reingreso del libro al inventario activo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Book & User Summary Card */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-100">{book?.title || 'Libro'}</div>
                <div className="text-[11px] text-slate-400">
                  {book?.author} • ISBN: {book?.isbn}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">({user?.dni})</span>
              </div>
              <span className="text-[11px] text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                {book?.shelfLocation}
              </span>
            </div>
          </div>

          {/* Dates & Punctuality Status */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Fecha de Préstamo:</span>
              <div className="font-mono font-medium text-slate-200 mt-0.5">{formatDate(loan.loanDate)}</div>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Fecha Límite:</span>
              <div className="font-mono font-medium text-slate-200 mt-0.5">{formatDate(loan.dueDate)}</div>
            </div>
          </div>

          {/* Timeliness Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isLate
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              {isLate ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
              <div>
                <div className="font-bold">{isLate ? `Devolución con Retraso: ${diff} días de mora` : 'Devolución dentro del plazo acordado'}</div>
                <div className="text-[10px] opacity-80">
                  {isLate ? 'Sugerido registrar advertencia o cobro de mora según reglamento' : 'Préstamo finalizado con éxito'}
                </div>
              </div>
            </div>
          </div>

          {/* Return Date Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Fecha Efectiva de Devolución</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Physical Condition Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Estado Físico del Libro
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Excelente', 'Bueno', 'Aceptable', 'Con Daños'] as BookCondition[]).map((cond) => {
                const isSelected = condition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleConditionChange(cond)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Observaciones de Recepción
            </label>
            <input
              type="text"
              value={returnedNotes}
              onChange={(e) => setReturnedNotes(e.target.value)}
              placeholder="Detalles sobre el estado o comentarios del usuario..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
            />
          </div>

          {/* Foot Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Stock actual: <strong className="text-slate-200">{book?.availableCopies}</strong> &rarr; <strong className="text-emerald-400">{(book?.availableCopies || 0) + 1}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="submit-confirm-return"
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar Recepción</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
