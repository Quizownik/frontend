"use client"
import {Link, usePathname} from "@/i18n/navigation";
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import { isAuthPage } from '@/app/[locale]/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const pathname = usePathname();

    if (isAuthPage(pathname)) {
        return null;
    }

    return (
        <header
            className="grid grid-cols-3 w-full items-center justify-center p-4 text-white shadow-xl z-50">
            <h1 className="text-2xl font-bold text-quizPink">Quizownik</h1>
            <nav className="flex items-center justify-center">
                <ul className="flex space-x-4">
                    <li><Link href="/quizzes">Quizzes</Link></li>
                    <li><Link href="/community">Community</Link></li>
                </ul>
            </nav>

            <div className="flex items-center justify-end space-x-4">
                {/* Używamy komponentu LanguageSwitcher */}
                <LanguageSwitcher variant="default" />

                <Link href="/profile" className="flex items-center text-white">
                    <AccountCircleTwoToneIcon fontSize={"large"}/>
                </Link>
            </div>
        </header>
    );
}

