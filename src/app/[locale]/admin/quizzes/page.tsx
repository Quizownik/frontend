'use client';

import {motion} from 'framer-motion';
import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useAuthGuard} from '@/app/[locale]/actions/useAuthGuard';
import {LoadingSpinner} from '@/app/[locale]/components/LoadingSpinner';
import {getLocale} from '@/app/[locale]/lib/utils';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import QuestionsManager from "@/app/[locale]/components/admin/QuestionManager";
import QuizzesManager from "@/app/[locale]/components/admin/QuizzesManager";


export default function AdminQuizzesPage() {
    const t = useTranslations('AdminPage');
    const {loading, authorized} = useAuthGuard();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'quizzes' | 'questions'>('quizzes');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data to verify admin role
    useEffect(() => {
        if (!loading && authorized) {
            fetchUserData();
        }
    }, [loading, authorized]);

    const fetchUserData = async () => {
        const locale = getLocale();
        try {
            const response = await fetch(`/${locale}/api/user/me`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const userData = await response.json();
            setUser(userData);

            // Redirect non-admin users
            if (userData.role !== 'ADMIN') {
                router.push('/profile');
                return;
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user data');
            setIsLoading(false);
        }
    };

    if (loading || isLoading) return <LoadingSpinner/>;
    if (!authorized) return null;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
    if (user && user.role !== 'ADMIN') return null;

    return (
        <main className="min-h-screen font-quiz px-4 py-10 text-black">
            <motion.h1
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-6 text-center"
            >
                {t('title')}
            </motion.h1>

            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
                className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mb-8"
            >
                {/* Tabs Navigation */}
                <div className="flex border-b">
                    <button
                        className={`py-4 px-6 font-medium text-lg ${activeTab === 'quizzes' ? 'text-quizPink border-b-2 border-quizPink' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('quizzes')}
                    >
                        {t('quizzesTab')}
                    </button>
                    <button
                        className={`py-4 px-6 font-medium text-lg ${activeTab === 'questions' ? 'text-quizPink border-b-2 border-quizPink' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        {t('questionsTab')}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'quizzes' ? (
                        <QuizzesManager/>
                    ) : (
                        <QuestionsManager/>
                    )}
                </div>
            </motion.div>

            {/* Back to profile button */}
            <div className="text-center mt-8">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-quizBlue hover:underline"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    {t('backToProfile')}
                </Link>
            </div>
        </main>
    );
}
