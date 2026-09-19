import { useState, useEffect } from 'react';
import { ActiveTab, Book, User, Loan, BookCondition } from './types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_LOANS } from './data/initialData';
import { DesktopHeader } from './components/DesktopHeader';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LoansView } from './components/LoansView';
import { BooksView } from './components/BooksView';
import { UsersView } from './components/UsersView';
import { ReturnsHistoryView } from './components/ReturnsHistoryView';
import { NewLoanModal } from './components/NewLoanModal';
import { ReturnModal } from './components/ReturnModal';
import { BookModal } from './components/BookModal';
import { UserModal } from './components/UserModal';
import { UserDetailsModal } from './components/UserDetailsModal';
import { addDaysToDate } from './utils/dateUtils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'bibliodesk_library_state_v2';

export default function App() {
  // Persistence state
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_books`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_BOOKS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_LOANS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_books`, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loans));
  }, [loans]);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Modal states
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [preselectedBookId, setPreselectedBookId] = useState<string | undefined>(undefined);
  const [preselectedUserId, setPreselectedUserId] = useState<string | undefined>(undefined);

  const [returnModalLoan, setReturnModalLoan] = useState<Loan | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [userDetailsUser, setUserDetailsUser] = useState<User | null>(null);

  // --- Handlers ---

  // Open New Loan
  const handleOpenNewLoan = (bookId?: string, userId?: string) => {
    setPreselectedBookId(bookId);
    setPreselectedUserId(userId);
    setIsNewLoanOpen(true);
  };

  // Create Loan
  const handleCreateLoan = (newLoanData: Omit<Loan, 'id'>) => {
    const newId = `l-${Date.now()}`;
    const newLoan: Loan = {
      ...newLoanData,
      id: newId,
    };

    // Decrease book's availableCopies
    setBooks((prev) =>
      prev.map((b) =>
        b.id === newLoan.bookId
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );

    setLoans((prev) => [newLoan, ...prev]);
    showToast('Préstamo registrado exitosamente en el sistema.');
  };

  // Open Return Modal
  const handleOpenReturnModal = (loan: Loan) => {
    setReturnModalLoan(loan);
  };

  // Confirm Return
  const handleConfirmReturn = (
    loanId: string,
    returnDate: string,
    condition: BookCondition,
    returnedNotes: string
  ) => {
    const loanToReturn = loans.find((l) => l.id === loanId);
    if (!loanToReturn) return;

    // Update loan
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              returnDate,
              conditionOnReturn: condition,
              returnedNotes,
            }
          : l
      )
    );

    // Increase book's availableCopies
    setBooks((prev) =>
      prev.map((b) =>
        b.id === loanToReturn.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );

    showToast('Devolución registrada. El ejemplar ha retornado al stock disponible.');
  };

  // Renew loan
  const handleRenewLoan = (loanId: string, daysToAdd: number) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const newDueDate = addDaysToDate(l.dueDate, daysToAdd);
          return {
            ...l,
            dueDate: newDueDate,
            notes: l.notes ? `${l.notes} (Renovado +${daysToAdd}d)` : `Renovado +${daysToAdd}d`,
          };
        }
        return l;
      })
    );
    showToast(`Plazo de préstamo extendido por +${daysToAdd} días.`);
  };

  // Delete loan
  const handleDeleteLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    if (!loan.returnDate) {
      // Return 1 copy back to book
      setBooks((prev) =>
        prev.map((b) =>
          b.id === loan.bookId
            ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
            : b
        )
      );
    }

    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToast('Registro de préstamo eliminado.', 'info');
  };

  // Book Handlers
  const handleOpenNewBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (bookData: Omit<Book, 'id'>, id?: string) => {
    if (id) {
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...bookData, id } : b))
      );
      showToast('Información del libro actualizada.');
    } else {
      const newBook: Book = {
        ...bookData,
        id: `b-${Date.now()}`,
      };
      setBooks((prev) => [newBook, ...prev]);
      showToast('Nuevo libro añadido al catálogo general.');
    }
  };

  const handleDeleteBook = (bookId: string) => {
    const hasActiveLoan = loans.some((l) => l.bookId === bookId && !l.returnDate);
    if (hasActiveLoan) {
      showToast('No se puede eliminar: existen ejemplares prestados activos.', 'error');
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    showToast('Libro eliminado del catálogo.', 'info');
  };

  // User Handlers
  const handleOpenNewUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (userData: Omit<User, 'id'>, id?: string) => {
    if (id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...userData, id } : u))
      );
      showToast('Ficha de socio actualizada.');
    } else {
      const newUser: User = {
        ...userData,
        id: `u-${Date.now()}`,
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast('Nuevo socio registrado con éxito.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const hasActiveLoan = loans.some((l) => l.userId === userId && !l.returnDate);
    if (hasActiveLoan) {
      showToast('No se puede eliminar: el socio tiene préstamos sin devolver.', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Socio eliminado del registro.', 'info');
  };

  // Export Data as JSON
  const handleExportData = () => {
    const data = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      books,
      users,
      loans,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bibliodesk_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada.');
  };

  // Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.books) && Array.isArray(parsed.users) && Array.isArray(parsed.loans)) {
          setBooks(parsed.books);
          setUsers(parsed.users);
          setLoans(parsed.loans);
          showToast('Datos de la biblioteca restaurados con éxito.');
        } else {
          showToast('El archivo no tiene la estructura válida de la biblioteca.', 'error');
        }
      } catch {
        showToast('Error al leer el archivo JSON seleccionado.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to Demo
  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de ejemplo iniciales de la biblioteca?')) {
      setBooks(INITIAL_BOOKS);
      setUsers(INITIAL_USERS);
      setLoans(INITIAL_LOANS);
      localStorage.removeItem(`${STORAGE_KEY}_books`);
      localStorage.removeItem(`${STORAGE_KEY}_users`);
      localStorage.removeItem(`${STORAGE_KEY}_loans`);
      showToast('Datos iniciales de biblioteca restaurados.');
    }
  };

  // Lookup for return modal
  const returnModalBook = returnModalLoan
    ? books.find((b) => b.id === returnModalLoan.bookId)
    : undefined;
  const returnModalUser = returnModalLoan
    ? users.find((u) => u.id === returnModalLoan.userId)
    : undefined;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Application Window Header */}
      <DesktopHeader
        books={books}
        users={users}
        loans={loans}
        onOpenNewLoan={() => handleOpenNewLoan()}
        onOpenNewBook={handleOpenNewBook}
        onOpenNewUser={handleOpenNewUser}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main Workstation Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          books={books}
          users={users}
          loans={loans}
          onOpenNewLoan={() => handleOpenNewLoan()}
          onOpenNewBook={handleOpenNewBook}
          onOpenNewUser={handleOpenNewUser}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              books={books}
              users={users}
              loans={loans}
              setActiveTab={setActiveTab}
              onOpenNewLoan={() => handleOpenNewLoan()}
              onOpenReturnModal={handleOpenReturnModal}
              onOpenNewBook={handleOpenNewBook}
              onOpenNewUser={handleOpenNewUser}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              loans={loans}
              books={books}
              users={users}
              onOpenNewLoan={() => handleOpenNewLoan()}
              onOpenReturnModal={handleOpenReturnModal}
              onRenewLoan={handleRenewLoan}
              onDeleteLoan={handleDeleteLoan}
            />
          )}

          {activeTab === 'books' && (
            <BooksView
              books={books}
              loans={loans}
              onOpenNewBook={handleOpenNewBook}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              onQuickLoanBook={(bookId) => handleOpenNewLoan(bookId)}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              loans={loans}
              books={books}
              onOpenNewUser={handleOpenNewUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onViewUserDetails={(user) => setUserDetailsUser(user)}
              onQuickLoanForUser={(userId) => handleOpenNewLoan(undefined, userId)}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnsHistoryView
              loans={loans}
              books={books}
              users={users}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        books={books}
        users={users}
        loans={loans}
        preselectedBookId={preselectedBookId}
        preselectedUserId={preselectedUserId}
        onCreateLoan={handleCreateLoan}
      />

      <ReturnModal
        isOpen={returnModalLoan !== null}
        onClose={() => setReturnModalLoan(null)}
        loan={returnModalLoan}
        book={returnModalBook}
        user={returnModalUser}
        onConfirmReturn={handleConfirmReturn}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        bookToEdit={bookToEdit}
        onSaveBook={handleSaveBook}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        onSaveUser={handleSaveUser}
      />

      <UserDetailsModal
        isOpen={userDetailsUser !== null}
        onClose={() => setUserDetailsUser(null)}
        user={userDetailsUser}
        loans={loans}
        books={books}
        onOpenReturnModal={handleOpenReturnModal}
        onNewLoanForUser={(userId) => handleOpenNewLoan(undefined, userId)}
      />

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-xl text-xs font-medium backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                : 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
