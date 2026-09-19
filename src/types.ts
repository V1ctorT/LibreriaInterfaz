export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  description: string;
  coverColor: string;
}

export type UserType = 'Estudiante' | 'Docente' | 'Investigador' | 'Público General';
export type UserStatus = 'Activo' | 'Suspendido' | 'Con Mora';

export interface User {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  registeredAt: string;
  maxAllowedLoans: number;
}

export type BookCondition = 'Excelente' | 'Bueno' | 'Aceptable' | 'Con Daños';

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD or null if still loaned
  notes: string;
  conditionOnReturn?: BookCondition;
  returnedNotes?: string;
}

export type ActiveTab = 'dashboard' | 'loans' | 'books' | 'users' | 'returns';

export interface LibraryState {
  books: Book[];
  users: User[];
  loans: Loan[];
}
