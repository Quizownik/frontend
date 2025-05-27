// Funkcje pomocnicze

/**
 * Sprawdza, czy podana ścieżka (pathname) odpowiada stronie logowania lub rejestracji.
 * Usuwa prefiks locale ze ścieżki przed sprawdzeniem.
 * @param pathname Aktualna ścieżka URL.
 * @returns True, jeśli ścieżka to /login lub /register (po usunięciu locale), w przeciwnym razie false.
 */
export function isAuthPage(pathname: string): boolean {
    const localePattern = /^\/[a-z]{2}(?:-[A-Z]{2})?/;
    const pathWithoutLocale = pathname.replace(localePattern, '');
    return pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register');
}

