'use client';
import {useParams} from 'next/navigation';
import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import {categoryColors} from "@/app/[locale]/lib/categoryColors";
import {getLocale} from "@/app/[locale]/lib/utils";

type Answer = {
    id: number;
    answer: string;
    isCorrect: boolean;
};

type Question = {
    id: number;
    question: string;
    category: string;
    answers: Answer[];
};

type Quiz = {
    id: number;
    name: string;
    category: string;
    position: number;
    questions: Question[];
    level: string;
};

type User = {
    id: number;
    username: string;
    name: string;
    surname: string;
    role: string;
};

export default function QuizDetailPage() {
    const params = useParams();
    const quizId = params.id as string;
    const t = useTranslations('QuizDetailPage');
    const {loading, authorized} = useAuthGuard();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
    const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
    const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);
    const [quizDuration, setQuizDuration] = useState<number>(0); // w sekundach

    useEffect(() => {
        if (!loading && authorized && quiz && !quizStartTime) {
            setQuizStartTime(new Date());
        }
    }, [loading, authorized, quiz, quizStartTime]);

    useEffect(() => {
        if (!loading && authorized) {
            fetchQuiz();
            fetchUserData();
        }
    }, [loading, authorized, quizId]);

    const fetchQuiz = async () => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/quizzes/${quizId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setQuiz(data);
            setIsLoading(false);
        } catch (err) {
            console.error('Błąd pobierania quizu:', err);
            setError('Nie udało się załadować quizu. Spróbuj ponownie później.');
            setIsLoading(false);
        }
    };

    const fetchUserData = async () => {
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/user/me`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setUser(data);
        } catch (err) {
            console.error('Błąd pobierania danych użytkownika:', err);
            setError('Nie udało się załadować danych użytkownika. Spróbuj ponownie później.');
        }
    };

    const handleAnswerSelect = (questionId: number, answerId: number) => {
        if (isQuizSubmitted) return;

        const newSelectedAnswers = new Map(selectedAnswers);
        newSelectedAnswers.set(questionId, answerId);
        setSelectedAnswers(newSelectedAnswers);
    };

    const nextQuestion = () => {
        // Sprawdź czy użytkownik zaznaczył odpowiedź na aktualne pytanie
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (currentQuestion && !selectedAnswers.has(currentQuestion.id)) {
            return; // Nie przechodzimy dalej jeśli odpowiedź nie została wybrana
        }

        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const calculateScore = () => {
        let correctAnswers = 0;

        if (quiz) {
            quiz.questions.forEach((question) => {
                const selectedAnswerId = selectedAnswers.get(question.id);
                if (selectedAnswerId) {
                    const selectedAnswer = question.answers.find(answer => answer.id === selectedAnswerId);
                    if (selectedAnswer?.isCorrect) {
                        correctAnswers++;
                    }
                }
            });
        }

        setScore(correctAnswers);
        return correctAnswers;
    };

    const submitQuizResults = async () => {
        if (!quiz || !user || !quizStartTime) return;

        const locale = getLocale();
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000);

        // Przygotuj dane w wymaganym formacie
        const questionOrder = quiz.questions.map(q => q.id);
        const chosenAnswers = quiz.questions.map(q => selectedAnswers.get(q.id) || 0);

        const quizResultData = {
            quizId: Number(quizId),
            userId: user.id,
            finishedAt: endTime.toISOString(),
            duration: duration,
            questionOrder: questionOrder,
            chosenAnswers: chosenAnswers
        };

        try {
            const response = await fetch(`/${locale}/api/quizzes/result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizResultData)
            });

            if (!response.ok) {
                console.error('Błąd zapisywania wyniku:', await response.text());
            } else {
                console.log('Wynik quizu został pomyślnie zapisany');
            }
        } catch (error) {
            console.error('Błąd podczas wysyłania wyników:', error);
        }
    };

    const submitQuiz = () => {
        const finalScore = calculateScore();
        setIsQuizSubmitted(true);
        setScore(finalScore);

        const endTime = new Date();
        setQuizEndTime(endTime);

        if (quizStartTime) {
            const duration = Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000);
            setQuizDuration(duration);

            // Wyślij wyniki do backendu
            submitQuizResults();
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Map());
        setIsQuizSubmitted(false);
        setScore(0);
        setQuizStartTime(null);
        setQuizEndTime(null);
        setQuizDuration(0);
    };

    if (loading || isLoading) return <LoadingSpinner/>;
    if (!authorized) return null;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
    if (!quiz) return <div className="text-center p-8">{t('quizNotFound')}</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const borderColor = categoryColors[quiz.category] || 'border-gray-300';
    const progress = Math.round(((currentQuestionIndex) / quiz.questions.length) * 100);

    return (
        <main className="min-h-screen font-quiz px-4 py-10 shadow-xl text-black">
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="max-w-3xl mx-auto"
            >
                {/* Nagłówek quizu */}
                <header className={`bg-gray-100 p-6 rounded-t-xl shadow-md border-l-4 ${borderColor} mb-4`}>
                    <h1 className="text-3xl font-bold text-quizBlue">{quiz.name}</h1>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-black">{t('categoryLabel')}: {quiz.category}</p>
                        <p className="text-sm text-gray-600">{quiz.questions.length} {t('questions')}</p>
                    </div>
                </header>

                {isQuizSubmitted ? (
                    /* Podsumowanie quizu */
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        className="bg-white p-8 rounded-xl shadow-lg"
                    >
                        <h2 className="text-2xl font-bold text-center mb-6">{t('quizCompleted')}</h2>
                        <div className="text-center mb-4">
                            <span className="text-4xl font-bold text-quizBlue">{score}</span>
                            <span className="text-xl text-gray-600">/{quiz.questions.length}</span>
                        </div>
                        <p className="text-center mb-6">
                            {t('scoreMessage', {score, total: quiz.questions.length})}
                        </p>
                        <p className="text-center mb-6">
                            {t('durationMessage', {duration: quizDuration})}
                        </p>

                        <div className="space-y-6 mt-8">
                            {quiz.questions.map((question, index) => {
                                const selectedAnswerId = selectedAnswers.get(question.id);
                                const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
                                const correctAnswer = question.answers.find(a => a.isCorrect);

                                return (
                                    <div
                                        key={question.id}
                                        className={`p-4 rounded-lg ${selectedAnswer?.isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}
                                    >
                                        <p className="font-semibold mb-2">
                                            {index + 1}. {question.question}
                                        </p>
                                        <div className="ml-4">
                                            <p>
                                                <span
                                                    className="font-medium">{t('yourAnswer')}:</span> {selectedAnswer?.answer || t('noAnswer')}
                                            </p>
                                            {!selectedAnswer?.isCorrect && (
                                                <p className="text-green-700 font-medium">
                                                    {t('correctAnswer')}: {correctAnswer?.answer}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={resetQuiz}
                            className="w-full mt-8 py-3 bg-quizPink hover:bg-pink-400 text-white font-semibold rounded-lg transition"
                        >
                            {t('tryAgain')}
                        </button>
                    </motion.div>
                ) : (
                    /* Treść quizu */
                    <>
                        {/* Pasek postępu */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-white mb-1">
                                <span>{t('question')} {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-300 h-2 rounded-full">
                                <div
                                    className="bg-quizPink h-2 rounded-full"
                                    style={{width: `${progress}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Pytanie */}
                        <motion.div
                            key={currentQuestion.id}
                            initial={{opacity: 0, x: 50}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: -50}}
                            transition={{duration: 0.3}}
                            className="bg-white p-6 rounded-xl shadow-md mb-6"
                        >
                            <h2 className="text-xl font-semibold text-quizBlue mb-4">
                                {currentQuestion.question}
                            </h2>

                            {/* Odpowiedzi */}
                            <div className="space-y-3">
                                {currentQuestion.answers.map((answer) => {
                                    const isSelected = selectedAnswers.get(currentQuestion.id) === answer.id;

                                    return (
                                        <div
                                            key={answer.id}
                                            onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-quizPink bg-pink-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        isSelected
                                                            ? 'border-quizPink'
                                                            : 'border-gray-400'
                                                    }`}>
                                                    {isSelected && (
                                                        <div className="w-3 h-3 bg-quizPink rounded-full"></div>
                                                    )}
                                                </div>
                                                <span className="ml-3 text-black">{answer.answer}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Przyciski nawigacyjne */}
                        <div className="flex flex-row mt-6 justify-end">
                            {currentQuestionIndex === quiz.questions.length - 1 ? (
                                <button
                                    onClick={submitQuiz}
                                    disabled={!selectedAnswers.has(currentQuestion.id)}
                                    className={`px-6 py-2 ${selectedAnswers.has(currentQuestion.id) ? 'bg-quizPink hover:bg-pink-400' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold rounded-lg transition`}
                                >
                                    {t('submit')}
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    disabled={!selectedAnswers.has(currentQuestion.id)}
                                    className={`px-6 py-2 ${selectedAnswers.has(currentQuestion.id) ? 'bg-quizBlue hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold rounded-lg transition`}
                                >
                                    {t('next')}
                                </button>
                            )}
                        </div>

                        {/* Licznik odpowiedzi */}
                    </>
                )}
            </motion.div>
        </main>
    );
}
