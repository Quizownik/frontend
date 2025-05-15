"use client"
import {motion} from 'framer-motion';

export default function CommunityPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center font-quiz px-4">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-8xl text-quizPink font-bold mb-6 text-center"
            >
                Community page
            </motion.h1>
        </main>
    );
}