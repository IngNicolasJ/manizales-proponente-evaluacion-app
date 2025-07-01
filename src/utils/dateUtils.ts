/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha local sin problemas de zona horaria
 * @param dateString Fecha en formato YYYY-MM-DD
 * @returns Date object ajustado a la zona horaria local
 */
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  // Separar los componentes de la fecha
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear la fecha usando el constructor local (sin UTC)
  return new Date(year, month - 1, day);
};

/**
 * Formatea una fecha para mostrar en la interfaz en formato local
 * @param dateString Fecha en formato YYYY-MM-DD o Date object
 * @param locale Locale para el formateo (por defecto 'es-CO')
 * @returns Fecha formateada en string
 */
export const formatLocalDate = (dateString: string | Date, locale: string = 'es-CO'): string => {
  if (!dateString) return 'No definida';
  
  let date: Date;
  
  if (typeof dateString === 'string') {
    date = parseLocalDate(dateString);
  } else {
    date = dateString;
  }
  
  return date.toLocaleDateString(locale);
};

/**
 * Convierte una fecha a formato YYYY-MM-DD para guardar en la base de datos
 * @param date Date object
 * @returns Fecha en formato YYYY-MM-DD
 */
export const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};