"use client"
import {Link} from "@/i18n/navigation";
import {useState} from "react";
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';

export default function Header() {
    const [isLoggedIn] = useState(true);

    if (!isLoggedIn) {
        return null;
    }
    return (
        <header
            className="grid grid-cols-3 w-full items-center justify-center p-4 text-white shadow-xl z-50">
            <h1 className="text-2xl font-bold text-quizPink">Quizownik</h1>
            <nav className="flex items-center justify-center">
                <ul className="flex space-x-4">
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/quizzes">Quizzes</Link></li>
                    <li><Link href="/community">Community</Link></li>
                </ul>
            </nav>

            <Link href="/profile" className="flex items-center justify-end text-white px-4 py-2 rounded">
                <AccountCircleTwoToneIcon fontSize={"large"}/>
            </Link>
        </header>
    );

}