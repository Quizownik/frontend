"use client"
import {motion} from 'framer-motion';
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";

export default function HomePage() {
    const { loading, authorized } = useAuthGuard();
    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center font-quiz px-4">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-8xl text-quizPink font-bold mb-6 text-center"
            >
                Home page
            </motion.h1>
        </main>
    );
}