// Mengubah angka 30000 menjadi string "30.000"
export const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat('id-ID').format(angka);
};

// Mengubah string input "30.000" kembali menjadi angka 30000 (untuk disimpan ke DB)
export const parseRupiah = (text: string): number => {
  // Hapus semua karakter selain angka
  const cleanText = text.replace(/[^\d]/g, '');
  return parseInt(cleanText, 10) || 0;
};