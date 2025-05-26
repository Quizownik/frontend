'use client';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {useState} from 'react';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import VisibilityOffTwoToneIcon from '@mui/icons-material/VisibilityOffTwoTone';
import {login} from "@/app/[locale]/actions/auth";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Logging in with:', {email, password});
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        const result = await login(formData);
        if (result?.errors) {
            alert('Błąd: ' + JSON.stringify(result.errors));
        } else if (result) {
            alert(result);
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 font-quiz bg-gradient-to-br from-quizBlue via-quizPink to-quizBlue">
            <div
                className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
                <div className="text-center">
                    <motion.h1
                        initial={{opacity: 0, y: -40}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1}}
                        className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-4"
                    >
                        Quizownik
                    </motion.h1>

                    <motion.p
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1, delay: 0.2}}
                        className="text-lg sm:text-xl md:text-2xl text-gray-500"
                    >
                        Odkryj swoją pasję do quizów!
                    </motion.p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 text-black">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col relative">
                        <label
                            htmlFor="password"
                            className="text-quizBlue mb-1 font-medium text-sm sm:text-base"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-9 sm:top-10 text-gray-500 hover:text-quizBlue"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? (
                                <VisibilityTwoToneIcon className="w-5 h-5"/>
                            ) : (
                                <VisibilityOffTwoToneIcon className="w-5 h-5"/>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-quizPink hover:bg-pink-400 text-white font-bold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
                    >
                        Login
                    </button>

                    <p className="text-sm text-center text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-quizPink font-semibold hover:underline">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
