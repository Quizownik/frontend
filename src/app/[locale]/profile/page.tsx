'use client';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {colorClasses} from "@/app/[locale]/lib/colorClasses";
import {logout} from "@/app/[locale]/actions/auth";
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import {useEffect, useState} from "react";
import {getLocale} from "@/app/[locale]/lib/utils";

type UserProfile = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    createdDate: string;
    numOfDoneQuizzes: number;
    numOfOnlyFullyCorrectQuizzes: number;
};

// Definiuję domyślny obrazek awatara - używam avatar.png jako fallbacku
const defaultAvatarUrl = '/avatars/avatar.png';

export default function ProfilePage() {
    const { loading, authorized } = useAuthGuard();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && authorized) {
            fetchUser();
        }
    }, [loading, authorized]);

    // Funkcja do pobierania danych użytkownika z API
    const fetchUser = () => {
        const locale = getLocale();

        fetch(`/${locale}/api/user/me`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Otrzymane dane użytkownika:', data);
                setUser(data);
                setFetchError(null);
            })
            .catch(error => {
                console.error('Błąd pobierania danych użytkownika:', error);
                setFetchError('Nie udało się pobrać danych profilu. Spróbuj ponownie później.');
            });
    };

    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-start font-quiz px-4 pt-16 shadow-xl">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-5xl sm:text-6xl md:text-7xl text-quizPink font-bold mb-8 text-center"
            >
                Twój Profil
            </motion.h1>

            {fetchError && (
                <div className="w-full max-w-2xl mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {fetchError}
                </div>
            )}

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1, delay: 0.3}}
                className="bg-gray-200 shadow-lg rounded-2xl p-6 w-full max-w-2xl flex flex-col items-center"
            >
                <Image
                    src={defaultAvatarUrl}
                    alt="Avatar użytkownika"
                    width={150}
                    height={150}
                    className="w-28 h-28 rounded-full border-4 border-black mb-4"
                />
                {user ? (
                    <>
                        <p className="text-lg text-gray-600 mb-6">
                            <span className="text-quizBlue">@</span>{user.username}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full mb-6">
                            <StatCard label="Ukończone quizy" value={user.numOfDoneQuizzes} color='yellow'/>
                            <StatCard label="Bezbłędne quizy" value={user.numOfOnlyFullyCorrectQuizzes} color='blue'/>
                        </div>

                        <div className="w-full p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">Informacje o koncie</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Rola:</span>
                                    <p className="font-medium">{user.role}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-gray-600">Data utworzenia konta:</span>
                                    <p className="font-medium">{new Date(user.createdDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Ładowanie danych profilu...</p>
                    </div>
                )}
            </motion.div>

            <motion.button
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1, delay: 0.5}}
                className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
                onClick={() => {
                    logout()
                }}
            >
                Wyloguj się
            </motion.button>
        </main>
    );
}

function StatCard({label, value, color}: { label: string; value: string | number; color: string }) {
    return (
        <div className={`${colorClasses[color]} text-black rounded-xl p-4 flex flex-col items-center shadow-md`}>
            <span className="text-lg font-semibold">{value}</span>
            <span className="text-sm opacity-80">{label}</span>
        </div>
    );
}
