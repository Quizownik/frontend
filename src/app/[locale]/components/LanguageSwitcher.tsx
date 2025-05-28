'use client'

import { Link, usePathname } from "@/i18n/navigation";
import TranslateIcon from '@mui/icons-material/Translate';
import { useParams } from 'next/navigation';

type LanguageSwitcherProps = {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'minimal' | 'pill'; // różne warianty wyglądu
};

/**
 * Komponent przełącznika języka - może być używany na różnych stronach,
 * w tym na stronach logowania i rejestracji.
 */
export default function LanguageSwitcher({
  className = '',
  showLabel = true,
  variant = 'default'
}: LanguageSwitcherProps) {
  // Pobieramy aktualny język bezpośrednio z parametrów routingu
  const params = useParams();
  const currentLocale = params.locale as string || 'pl';

  // Pobieramy aktualną ścieżkę używając hooka usePathname z next-intl/navigation
  const pathname = usePathname();

  // Określamy docelowy język
  const targetLocale = currentLocale === 'pl' ? 'en' : 'pl';

  // Różne style w zależności od wybranego wariantu
  const variantStyles = {
    default: 'flex items-center space-x-1 bg-quizBlue hover:bg-blue-600 px-3 py-1 rounded-full transition-colors',
    minimal: 'flex items-center space-x-1 hover:text-quizBlue transition-colors',
    pill: 'flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors'
  };

  const baseStyle = variantStyles[variant];

  return (
    <Link
      href={pathname}
      locale={targetLocale}
      className={`${baseStyle} ${className}`}
    >
      <TranslateIcon fontSize="small" />
      {showLabel && <span>{targetLocale.toUpperCase()}</span>}
    </Link>
  );
}
