"use client"
import { usePathname } from 'next/navigation';
import { isAuthPage } from '@/app/[locale]/lib/utils'; // Import nowej funkcji

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    if (isAuthPage(pathname)) {
        return null;
    }

    return (
        <footer className=" text-white py-4 shadow-none">
            <div className="container mx-auto text-center">
                <p className="text-sm">© {currentYear} Quizownik. All rights reserved.</p>
                <p className="text-sm">Made with ❤️ by Quizownik Team</p>
            </div>
        </footer>
    );
}

