'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthGuard } from "@/app/[locale]/actions/useAuthGuard";
import { getLocale } from "@/app/[locale]/lib/utils";
import { Link } from "@/i18n/navigation";
import { LoadingSpinner } from "@/app/[locale]/components/LoadingSpinner";
import { z } from 'zod';

// Schema for password validation
const passwordSchema = z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
        message: 'Contain at least one special character.',
    })
    .trim();

// Schema for password change form
const changePasswordSchema = z.object({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function ChangePasswordPage() {
    const t = useTranslations('ChangePasswordPage');
    const router = useRouter();
    const { loading, authorized } = useAuthGuard();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!loading && !authorized) {
            router.push('/login');
        }
    }, [loading, authorized, router]);

    const validateForm = () => {
        try {
            changePasswordSchema.parse({ newPassword, confirmPassword });
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0].toString()] = err.message;
                    }
                });
                setValidationErrors(errors);
                if (errors.confirmPassword) {
                    setErrorMessage(t('passwordsDontMatch'));
                } else {
                    setErrorMessage(t('passwordRequirements'));
                }
            } else {
                setErrorMessage(t('passwordError'));
            }
            return false;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setValidationErrors({});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const locale = getLocale();
            const response = await fetch(`/${locale}/api/user/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmationPassword: confirmPassword
                }),
            });

            if (response.ok) {
                setSuccessMessage(t('passwordChanged'));
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || t('passwordError'));
            }
        } catch (error) {
            setErrorMessage(t('passwordError'));
            console.error('Error changing password:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    const getPasswordRequirements = () => {
        return (
            <ul className="text-xs text-gray-600 mt-1 list-disc pl-4">
                <li>{t('passwordRequirements')}</li>
                <li>Contain at least one letter</li>
                <li>Contain at least one number</li>
                <li>Contain at least one special character</li>
            </ul>
        );
    };

    return (
        <div className="min-h-screen py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl text-black">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-quizBlue">{t('title')}</h1>
                            <Link href="/profile" className="text-quizPink hover:underline">
                                {t('backToProfile')}
                            </Link>
                        </div>

                        <p className="text-gray-600 mb-6">{t('subtitle')}</p>

                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('currentPassword')}
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-quizBlue"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('newPassword')}
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-3 py-2 border ${validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-quizBlue`}
                                    required
                                />
                                {getPasswordRequirements()}
                                {validationErrors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.newPassword}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('confirmPassword')}
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-3 py-2 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-quizBlue`}
                                    required
                                />
                                {validationErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-quizBlue hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                            >
                                {isSubmitting ? (
                                    <div className="flex justify-center items-center">
                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                        <span>{t('submitButton')}</span>
                                    </div>
                                ) : (
                                    <span>{t('submitButton')}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
