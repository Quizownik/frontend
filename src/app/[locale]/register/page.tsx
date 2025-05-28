'use client';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import VisibilityOffTwoToneIcon from '@mui/icons-material/VisibilityOffTwoTone';
import {signup} from "@/app/[locale]/actions/auth";
import LanguageSwitcher from '../components/LanguageSwitcher';
import {useTranslations} from "next-intl";
import {getLocale} from '@/app/[locale]/lib/utils';
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";

export default function RegisterPage() {
    const t = useTranslations('RegisterPage');
    const router = useRouter();

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Sprawdzanie, czy użytkownik jest już zalogowany
    useEffect(() => {
        const locale = getLocale();

        fetch(`/${locale}/api/me`)
            .then(response => {
                if (response.ok) {
                    // Użytkownik jest zalogowany, przekieruj na stronę profilu
                    router.replace('/profile');
                }
            })
            .catch(error => {
                console.error('Błąd podczas sprawdzania stanu logowania:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        const formData = new FormData();
        formData.append('firstname', name);
        formData.append('lastname', lastname);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        const result = await signup(formData);
        if (result?.errors) {
            alert('Błąd: ' + JSON.stringify(result.errors));
        } else if (result) {
            alert(result);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-quizBlue to-quizPink">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-quizBlue to-quizPink">
            {/* Dodany przełącznik języka w prawym górnym rogu */}
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="pill"/>
            </div>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
            >
                <div className="text-center">
                    <motion.h1
                        initial={{opacity: 0, y: -40}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1}}
                        className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-4"
                    >
                        {t('title')}
                    </motion.h1>

                    <motion.p
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1, delay: 0.2}}
                        className="text-lg sm:text-xl md:text-2xl text-gray-500"
                    >
                        {t('welcomeMessage')}
                    </motion.p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5 text-black">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            {t('nameLabel')}
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="lastname" className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            {t('surnameLabel')}
                        </label>
                        <input
                            id="lastname"
                            type="text"
                            required
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="username" className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            {t('usernameLabel')}
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base"
                        />
                    </div>

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
                        <label htmlFor="password" className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            {t('passwordLabel')}
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
                            onClick={() => setShowPassword(!showPassword)}
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

                    <div className="flex flex-col relative">
                        <label htmlFor="confirmPassword"
                               className="text-quizBlue mb-1 font-medium text-sm sm:text-base">
                            {t('confirmPasswordLabel')}
                        </label>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-quizBlue text-xl sm:text-base pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 sm:top-10 text-gray-500 hover:text-quizBlue"
                            aria-label="Toggle confirm password visibility"
                        >
                            {showConfirmPassword ? (
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
                        {t('registerButton')}
                    </button>

                    <p className="text-sm text-center text-gray-500">
                        {t("alreadyHaveAccount")}{' '}
                        <Link href="/login" className="text-quizPink font-semibold hover:underline">
                            {t("loginButton")}
                        </Link>
                    </p>
                </form>
            </motion.div>
        </main>
    );
}
