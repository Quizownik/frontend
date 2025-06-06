'use client';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import VisibilityOffTwoToneIcon from '@mui/icons-material/VisibilityOffTwoTone';
import {login} from "@/app/[locale]/actions/auth";
import {useTranslations} from "next-intl";
import LanguageSwitcher from '../components/LanguageSwitcher';
import {getLocale} from '@/app/[locale]/lib/utils';
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import {ErrorPopup} from "@/app/[locale]/components/ErrorPopup";

export default function LoginPage() {
    const t = useTranslations('LoginPage');
    const apiT = useTranslations('API.errors');
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sprawdzanie, czy użytkownik jest już zalogowany
    useEffect(() => {
        const locale = getLocale();

        fetch(`/${locale}/api/me`)
            .then(response => {
                if (response.ok) {
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

    // Funkcja do mapowania kodów błędów na komunikaty z tłumaczeń
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'invalid_credentials':
                return t('errorMessage');
            case 'account_blocked':
                return apiT('forbidden');
            case 'too_many_requests':
                return apiT('tooManyRequests');
            case 'unexpected_response':
                return apiT('serverError');
            case 'server_error':
                return apiT('internalServerError');
            default:
                return t('errorMessage');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const result = await login(formData);

            if (result?.success) {
                router.push('/profile');
                return;
            }

            if (result?.errors) {
                // Pobranie pierwszego błędu z listy
                const firstErrorKey = Object.values(result.errors)[0]?.[0];
                if (firstErrorKey) {
                    // Konwersja kodu błędu na komunikat z tłumaczeniem
                    setErrorMessage(getErrorMessage(firstErrorKey));
                } else {
                    setErrorMessage(t('errorMessage'));
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(apiT('internalServerError'));
        } finally {
            setIsSubmitting(false);
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
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-quizBlue to-quizPink">
            {/* Popup do wyświetlania błędów */}
            {errorMessage && (
                <ErrorPopup
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                    autoCloseTime={5000}
                />
            )}

            {/* Dodany przełącznik języka w prawym górnym rogu */}
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="pill" />
            </div>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="w-full max-w-md bg-white rounded-xl shadow-xl p-8"
            >
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
                        {t('welcomeMessage')}
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
                        disabled={isSubmitting}
                        className="w-full bg-quizPink hover:bg-pink-400 text-white font-bold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base"
                    >
                        {isSubmitting ? (
                            <div className="flex justify-center items-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                <span>{t('loginButton')}</span>
                            </div>
                        ) : (
                            t('loginButton')
                        )}
                    </button>

                    <p className="text-sm text-center text-gray-500">
                        {t("newUserMessage")}{' '}
                        <Link href="/register" className="text-quizPink font-semibold hover:underline">
                            {t("registerButton")}
                        </Link>
                    </p>
                </form>
            </motion.div>
        </main>
    );
}

