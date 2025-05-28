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
                setUser(data);
                setFetchError(null);
            })
            .catch(error => {
                setFetchError('Nie udało się pobrać danych profilu. Spróbuj ponownie później.' + (error.message ? ` (${error.message})` : ''));
            });
    };

    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;

    return (
        <main className="w-full min-h-screen  flex flex-col items-center justify-center p-6 shadow-xl">
            <motion.h1
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.7}}
                className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-10 text-center"
            >
                Twój Profil
            </motion.h1>

            {fetchError && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="w-full max-w-3xl mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm"
                >
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fetchError}
                    </div>
                </motion.div>
            )}

            <div className="w-full max-w-3xl text-black">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.7, delay: 0.2}}
                    className="bg-white shadow-xl rounded-2xl overflow-hidden"
                >
                    {/* Header with avatar and username */}
                    <div className="bg-gradient-to-r from-quizPink to-quizBlue p-6 flex flex-col items-center relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-pattern-dots"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="p-1 bg-white rounded-full shadow-lg">
                                <Image
                                    src={defaultAvatarUrl}
                                    alt="Avatar użytkownika"
                                    width={150}
                                    height={150}
                                    className="w-28 h-28 rounded-full border-2 border-white"
                                />
                            </div>
                            {user && (
                                <p className="text-xl text-white font-semibold mt-4 bg-black/30 px-4 py-1 rounded-full">
                                    <span className="text-quizBlue">@</span>{user.username}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {user ? (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <StatCard label="Ukończone quizy" value={user.numOfDoneQuizzes} color='pink'/>
                                    <StatCard label="Bezbłędne quizy" value={user.numOfOnlyFullyCorrectQuizzes} color='blue'/>
                                </div>

                                {/* Account Information */}
                                <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                                    <h3 className="font-semibold text-lg border-b border-gray-200 pb-3 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-quizBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Informacje o koncie
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-gray-500 mt-0.5" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                            <div>
                                                <span className="text-gray-600 text-sm">Imię i nazwisko:</span>
                                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-gray-500 mt-0.5" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                            <div>
                                                <span className="text-gray-600 text-sm">Email:</span>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-gray-500 mt-0.5" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                            </svg>
                                            <div>
                                                <span className="text-gray-600 text-sm">Rola:</span>
                                                <p className="font-medium">{user.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-gray-500 mt-0.5" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            <div>
                                                <span className="text-gray-600 text-sm">Data utworzenia konta:</span>
                                                <p className="font-medium">{new Date(user.createdDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        className="flex-1 px-6 py-3 bg-quizBlue text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                        Edytuj profil
                                    </button>
                                    <button
                                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors flex items-center justify-center"
                                        onClick={() => logout()}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Wyloguj się
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-600">Ładowanie danych profilu...</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

function StatCard({label, value, color}: { label: string; value: string | number; color: string }) {
    return (
        <div className={`${colorClasses[color]} rounded-xl p-5 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow h-full`}>
            <span>{value}</span>
            <span>{label}</span>
        </div>
    );
}