/**
 * Sprawdza, czy podana ścieżka (pathname) odpowiada stronie logowania lub rejestracji.
 */
export function isAuthPage(pathname: string): boolean {
    const localePattern = /^\/[a-z]{2}(?:-[A-Z]{2})?/;
    const pathWithoutLocale = pathname.replace(localePattern, '');
    return pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register');
}

/**
 * Stała zawierająca bazowy URL API.
 * Można ją zmienić na odpowiedni adres produkcyjny lub inny, jeśli jest taka potrzeba.
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Funkcja sprawdzająca, czy kod jest uruchamiany po stronie klienta (przeglądarki).
 */
export const isClient = () => typeof window !== 'undefined';

/**
 * Funkcja pobierająca aktualny locale z URL lub zwracająca domyślny 'pl'.
 * Bezpieczna dla użycia zarówno po stronie klienta jak i serwera.
 */
export const getLocale = (): string => {
  if (isClient()) {
    return window.location.pathname.split('/')[1] || 'pl';
  }
  return 'pl'; // Domyślny locale po stronie serwera
};

