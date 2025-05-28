'use client';
import { motion } from 'framer-motion';
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import Image from 'next/image';
import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {getLocale} from "@/app/[locale]/lib/utils";

// const leaderboard = [
//     {
//         id: 1,
//         username: 'quiz_champion',
//         avatar: '/avatars/avatar.png',
//         score: 1520,
//     },
//     {
//         id: 2,
//         username: 'brainy_user',
//         avatar: '/avatars/avatar.png',
//         score: 1380,
//     },
//     {
//         id: 3,
//         username: 'fast_fingers',
//         avatar: '/avatars/avatar.png',
//         score: 1260,
//     },
//     {
//         id: 4,
//         username: 'smart_cookie',
//         avatar: '/avatars/avatar.png',
//         score: 1100,
//     },
//     {
//         id: 5,
//         username: 'think_tank',
//         avatar: '/avatars/avatar.png',
//         score: 980,
//     },
// ];

type UserEntry = {
    username: string;
    numOfDoneQuizzes: number;
}

export default function CommunityPage() {
    const t = useTranslations('CommunityPage');
    const { loading, authorized } = useAuthGuard();

    const[leaderboard, setLeaderboard] = useState([] as UserEntry[]);

    useEffect(() => {
        if (!loading && authorized) {
            fetchLeaderboard();
        }
    }, [loading, authorized])

    const fetchLeaderboard = () => {
        const locale = getLocale();
        fetch(`/${locale}/api/leaderboard`)
            .then(response => {
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setLeaderboard(data);
                } else {
                    console.error('Invalid leaderboard data:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
            });
    }

    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;


    if(!leaderboard || leaderboard.length === 0) {
        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="text-center text-gray-500 text-lg"
            >
                {t("noResults")}
            </motion.div>
        );
    }

    return (
        <main className="min-h-screen font-quiz px-4 py-10 flex flex-col items-center shadow-xl">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-5xl sm:text-6xl md:text-7xl text-quizPink font-bold mb-4 text-center"
            >
                {t("title")}
            </motion.h1>

            <motion.p
                initial={{opacity: 0, y: -30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.7}}
                className="text-md sm:text-xl md:text-2xl text-gray-100 mb-10 text-center"
            >
                {t("subtitle")}
            </motion.p>

            <section className="w-full max-w-3xl bg-gray-100 rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-quizBlue mb-4 text-center">🏆 {t("leaderboard")} 🏆</h2>
                <ul className="space-y-4">
                    {leaderboard.map((user, index) => (
                        <motion.li
                            key={index}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
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
                                <span className={`font-medium text-lg  ${
                                    index === 0
                                        ? 'text-yellow-500'
                                        : index === 1
                                            ? 'text-gray-400'
                                            : index === 2
                                                ? 'text-amber-700'
                                                : 'text-gray-600'
                                }`}>@{user.username}</span>
                            </div>
                            <span className="text-xl font-bold text-quizPink">{user.numOfDoneQuizzes} pts</span>
                        </motion.li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
