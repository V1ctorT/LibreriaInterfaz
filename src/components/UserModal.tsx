import { useState, useEffect } from 'react';
import { X, Users, AlertCircle, Save } from 'lucide-react';
import { User, UserType, UserStatus } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onSaveUser: (userData: Omit<User, 'id'>, id?: string) => void;
}

export function UserModal({
  isOpen,
  onClose,
  userToEdit,
  onSaveUser,
}: UserModalProps) {
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<UserType>('Estudiante');
  const [status, setStatus] = useState<UserStatus>('Activo');
  const [maxAllowedLoans, setMaxAllowedLoans] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setDni(userToEdit.dni);
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone);
      setType(userToEdit.type);
      setStatus(userToEdit.status);
      setMaxAllowedLoans(userToEdit.maxAllowedLoans);
    } else {
      setName('');
      setDni('');
      setEmail('');
      setPhone('+34 ');
      setType('Estudiante');
      setStatus('Activo');
      setMaxAllowedLoans(3);
    }
    setError('');
  }, [userToEdit, isOpen]);

  // Adjust default max loans based on type
  const handleTypeChange = (newType: UserType) => {
    setType(newType);
    if (!userToEdit) {
      if (newType === 'Docente' || newType === 'Investigador') {
        setMaxAllowedLoans(5);
      } else if (newType === 'Estudiante') {
        setMaxAllowedLoans(3);
      } else {
        setMaxAllowedLoans(2);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre completo del socio es obligatorio.');
      return;
    }
    if (!dni.trim()) {
      setError('El número de DNI o documento de identidad es obligatorio.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Introduce un correo electrónico válido para avisos de vencimiento.');
      return;
    }
    if (maxAllowedLoans < 1) {
      setError('El cupo de préstamos debe ser al menos 1.');
      return;
    }

    onSaveUser(
      {
        name: name.trim(),
        dni: dni.trim(),
        email: email.trim(),
        phone: phone.trim() || 'Sin teléfono',
        type,
        status,
        registeredAt: userToEdit ? userToEdit.registeredAt : getTodayDateString(),
        maxAllowedLoans: Number(maxAllowedLoans),
      },
      userToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {userToEdit ? 'Editar Datos del Socio' : 'Registrar Nuevo Socio / Lector'}
              </h2>
              <p className="text-xs text-slate-400">Filiación y permisos de préstamo en biblioteca</p>
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

          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nombre Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Morales Ruiz"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DNI */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">DNI / Carnet N° *</label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej. 45892104"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              {/* Type */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tipo de Lector</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as UserType)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                >
                  <option value="Estudiante">Estudiante (3 libros)</option>
                  <option value="Docente">Docente (5 libros)</option>
                  <option value="Investigador">Investigador (5 libros)</option>
                  <option value="Público General">Público General (2 libros)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Max Loans */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Cupo Máx. Préstamos</label>
                <input
                  type="number"
                  value={maxAllowedLoans}
                  onChange={(e) => setMaxAllowedLoans(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Estado de la Cuenta</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                >
                  <option value="Activo">Activo (Habilitado)</option>
                  <option value="Con Mora">Con Mora (Requiere regularización)</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>
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
              id="submit-save-user"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Socio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
