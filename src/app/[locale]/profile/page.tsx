'use client';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {colorClasses} from "@/app/[locale]/lib/colorClasses";
import {logout} from "@/app/[locale]/actions/auth";
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";

const mockUser = {
    username: 'Juhas',
    avatarUrl: '/avatars/avatar.png',
    stats: {
        totalQuizzes: 42,
        highestScore: 98,
        totalPoints: 1234,
        rank: 7,
    },
};

export default function ProfilePage() {
    const { loading, authorized } = useAuthGuard();
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

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1, delay: 0.3}}
                className="bg-gray-200 shadow-lg rounded-2xl p-6 w-full max-w-2xl flex flex-col items-center"
            >
                <Image
                    src={mockUser.avatarUrl}
                    alt="User Avatar"
                    width={150}
                    height={150}
                    className="w-28 h-28 rounded-full border-4 border-black mb-4"
                />
                <h2 className="text-2xl sm:text-3xl font-semibold text-black mb-6"><span
                    className={'text-quizBlue'}>@</span>{mockUser.username}</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    <StatCard label="Quizy" value={mockUser.stats.totalQuizzes} color='yellow'/>
                    <StatCard label="Najwyższy wynik" value={mockUser.stats.highestScore} color='blue'/>
                    <StatCard label="Punkty" value={mockUser.stats.totalPoints} color='green'/>
                    <StatCard label="Ranga" value={`#${mockUser.stats.rank}`} color='pink'/>
                </div>
            </motion.div>


            <motion.button
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1, delay: 0.5}}
                className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
                onClick={() => {
                    logout()
                }}
            > Wyloguj się
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
