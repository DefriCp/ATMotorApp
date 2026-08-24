/**
 * Utility Formatting Data dalam Bahasa Indonesia
 */

export const formatRupiah = (number) => {
  const num = parseFloat(number) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatTanggal = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export const formatTanggalSimple = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};
