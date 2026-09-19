export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function getDaysDifference(targetDate: string, baseDate?: string): number {
  const [tYear, tMonth, tDay] = targetDate.split('-').map(Number);
  const target = new Date(tYear, tMonth - 1, tDay);

  let base: Date;
  if (baseDate) {
    const [bYear, bMonth, bDay] = baseDate.split('-').map(Number);
    base = new Date(bYear, bMonth - 1, bDay);
  } else {
    base = new Date();
    base.setHours(0, 0, 0, 0);
  }

  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getLoanStatus(dueDate: string, returnDate: string | null) {
  if (returnDate) {
    const diff = getDaysDifference(returnDate, dueDate);
    if (diff > 0) {
      return {
        label: `Devuelto (${diff} días mora)`,
        type: 'returned_late',
        days: diff
      };
    }
    return {
      label: 'Devuelto a tiempo',
      type: 'returned_on_time',
      days: 0
    };
  }

  // Active loan
  const daysLeft = getDaysDifference(dueDate);
  if (daysLeft < 0) {
    return {
      label: `Vencido (${Math.abs(daysLeft)} días)`,
      type: 'overdue',
      days: Math.abs(daysLeft)
    };
  } else if (daysLeft === 0) {
    return {
      label: 'Vence hoy',
      type: 'due_today',
      days: 0
    };
  } else if (daysLeft <= 3) {
    return {
      label: `Próximo a vencer (${daysLeft} d)`,
      type: 'due_soon',
      days: daysLeft
    };
  } else {
    return {
      label: `Al día (${daysLeft} días restantes)`,
      type: 'active',
      days: daysLeft
    };
  }
}
