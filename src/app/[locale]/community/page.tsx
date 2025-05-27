'use client';
import { motion } from 'framer-motion';
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";

const leaderboard = [
    {
        id: 1,
        username: 'quiz_champion',
        avatar: '/avatars/avatar.png',
        score: 1520,
    },
    {
        id: 2,
        username: 'brainy_user',
        avatar: '/avatars/avatar.png',
        score: 1380,
    },
    {
        id: 3,
        username: 'fast_fingers',
        avatar: '/avatars/avatar.png',
        score: 1260,
    },
    {
        id: 4,
        username: 'smart_cookie',
        avatar: '/avatars/avatar.png',
        score: 1100,
    },
    {
        id: 5,
        username: 'think_tank',
        avatar: '/avatars/avatar.png',
        score: 980,
    },
];

export default function CommunityPage() {
    const { loading, authorized } = useAuthGuard();
    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;

    return (
        <main className="min-h-screen font-quiz px-4 py-10 flex flex-col items-center">
            <motion.h1
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-5xl sm:text-6xl md:text-7xl text-quizPink font-bold mb-10 text-center"
            >
                Społeczność
            </motion.h1>

            <section className="w-full max-w-3xl bg-gray-100 rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-quizBlue mb-4 text-center">🏆 Tablica Liderów 🏆</h2>
                <ul className="space-y-4">
                    {leaderboard.map((user, index) => (
                        <motion.li
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-200 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                <span className={`text-xl font-bold ${
                    index === 0
                        ? 'text-yellow-500'
                        : index === 1
                            ? 'text-gray-400'
                            : index === 2
                                ? 'text-amber-700'
                                : 'text-gray-600'
                }`}>
                  #{index + 1}
                </span>
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full border-2 border-quizPink"
                                />
                                <span className="font-medium text-lg text-gray-800">@{user.username}</span>
                            </div>
                            <span className="text-xl font-bold text-quizPink">{user.score} pts</span>
                        </motion.li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
