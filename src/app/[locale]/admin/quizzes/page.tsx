'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthGuard } from '@/app/[locale]/actions/useAuthGuard';
import { LoadingSpinner } from '@/app/[locale]/components/LoadingSpinner';
import { getLocale } from '@/app/[locale]/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Question = {
  id: number;
  question: string;
  category: string;
  answers: {
    id?: number;
    answer: string;
    isCorrect: boolean;
  }[];
};

type Quiz = {
  id?: number;
  position: number;
  name: string;
  category: string;
  questionIds: number[];
  questions?: Question[];
};

export default function AdminQuizzesPage() {
  const t = useTranslations('AdminPage');
  const { loading, authorized } = useAuthGuard();
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

  if (loading || isLoading) return <LoadingSpinner />;
  if (!authorized) return null;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (user && user.role !== 'ADMIN') return null;

  return (
    <main className="min-h-screen font-quiz px-4 py-10 text-black">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-6 text-center"
      >
        {t('title')}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
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
            <QuizzesManager />
          ) : (
            <QuestionsManager />
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToProfile')}
        </Link>
      </div>
    </main>
  );
}

// Component for managing quizzes
function QuizzesManager() {
  const t = useTranslations('AdminPage');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    const locale = getLocale();

    try {
      const response = await fetch(`/${locale}/api/quizzes?size=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setQuizzes(data.content || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('quizzesList')}</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showAddForm ? t('cancelAddQuiz') : t('addNewQuiz')}
        </button>
      </div>

      {showAddForm && <AddQuizForm onQuizAdded={() => { fetchQuizzes(); setShowAddForm(false); }} />}

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('noQuizzes')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">ID</th>
                <th className="py-3 px-4 border-b text-left">{t('name')}</th>
                <th className="py-3 px-4 border-b text-left">{t('category')}</th>
                <th className="py-3 px-4 border-b text-left">{t('questionsCount')}</th>
                <th className="py-3 px-4 border-b text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{quiz.id}</td>
                  <td className="py-3 px-4 border-b">{quiz.name}</td>
                  <td className="py-3 px-4 border-b">{quiz.category}</td>
                  <td className="py-3 px-4 border-b">{quiz.questionIds?.length || 0}</td>
                  <td className="py-3 px-4 border-b">
                    <Link
                      href={`/admin/quizzes/${quiz.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {/* Implement delete logic */}}
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Component for managing questions
function QuestionsManager() {
  const t = useTranslations('AdminPage');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    const locale = getLocale();

    try {
      const response = await fetch(`/${locale}/api/admin/questions?size=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data.content || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('questionsList')}</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showAddForm ? t('cancelAddQuestion') : t('addNewQuestion')}
        </button>
      </div>

      {showAddForm && <AddQuestionForm onQuestionAdded={() => { fetchQuestions(); setShowAddForm(false); }} />}

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('noQuestions')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">ID</th>
                <th className="py-3 px-4 border-b text-left">{t('question')}</th>
                <th className="py-3 px-4 border-b text-left">{t('category')}</th>
                <th className="py-3 px-4 border-b text-left">{t('answersCount')}</th>
                <th className="py-3 px-4 border-b text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{question.id}</td>
                  <td className="py-3 px-4 border-b">{question.question}</td>
                  <td className="py-3 px-4 border-b">{question.category}</td>
                  <td className="py-3 px-4 border-b">{question.answers?.length || 0}</td>
                  <td className="py-3 px-4 border-b">
                    <Link
                      href={`/admin/questions/${question.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {/* Implement delete logic */}}
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Component for adding new quiz
function AddQuizForm({ onQuizAdded }: { onQuizAdded: () => void }) {
  const t = useTranslations('AdminPage');
  const [formData, setFormData] = useState<{ name: string; category: string; position: number; questionIds: string }>({
    name: '',
    category: 'Grammar', // Default value
    position: 0,
    questionIds: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchAvailableQuestions();
  }, []);

  const fetchAvailableQuestions = async () => {
    const locale = getLocale();
    try {
      const response = await fetch(`/${locale}/api/admin/questions?size=100`);
      if (response.ok) {
        const data = await response.json();
        setAvailableQuestions(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert questionIds from comma-separated string to array of numbers
      const questionIdsArray = formData.questionIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => parseInt(id, 10));

      const quizData = {
        name: formData.name,
        category: formData.category,
        position: formData.position,
        questionIds: questionIdsArray
      };

      const locale = getLocale();
      const response = await fetch(`/${locale}/api/admin/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create quiz');
      }

      onQuizAdded();
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-medium mb-4">{t('addNewQuiz')}</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">{t('name')}:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('category')}:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
              required
            >
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('position')}:</label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('questionIds')}:</label>
            <textarea
              name="questionIds"
              value={formData.questionIds}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink h-24"
              placeholder="Comma-separated IDs (e.g., 1,2,3)"
              required
            />
            <p className="text-sm text-gray-600 mt-1">{t('questionIdsHelp')}</p>
          </div>
        </div>

        {/* Available questions list */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">{t('availableQuestions')}:</h4>
          <div className="bg-white p-3 border rounded max-h-48 overflow-y-auto">
            {availableQuestions.length === 0 ? (
              <p className="text-gray-500">{t('noQuestionsAvailable')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3">ID</th>
                    <th className="text-left py-2 px-3">{t('question')}</th>
                    <th className="text-left py-2 px-3">{t('category')}</th>
                  </tr>
                </thead>
                <tbody>
                  {availableQuestions.map(q => (
                    <tr key={q.id} className="hover:bg-gray-100">
                      <td className="py-1 px-3">{q.id}</td>
                      <td className="py-1 px-3">{q.question}</td>
                      <td className="py-1 px-3">{q.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-quizPink text-white rounded hover:bg-pink-600 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? t('saving') : t('saveQuiz')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Component for adding new question
function AddQuestionForm({ onQuestionAdded }: { onQuestionAdded: () => void }) {
  const t = useTranslations('AdminPage');
  const [formData, setFormData] = useState<{
    question: string;
    category: string;
    answers: { answer: string; isCorrect: boolean }[];
  }>({
    question: '',
    category: 'Grammar',
    answers: [
      { answer: '', isCorrect: true },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAnswerChange = (index: number, field: 'answer' | 'isCorrect', value: string | boolean) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (formData.answers.some(a => !a.answer.trim())) {
      setError(t('allAnswersRequired'));
      setIsSubmitting(false);
      return;
    }

    if (!formData.answers.some(a => a.isCorrect)) {
      setError(t('correctAnswerRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      const locale = getLocale();
      const response = await fetch(`/${locale}/api/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create question');
      }

      onQuestionAdded();
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-medium mb-4">{t('addNewQuestion')}</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">{t('question')}:</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('category')}:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
              required
            >
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block mb-3 font-medium">{t('answers')}:</label>
            {formData.answers.map((answer, index) => (
              <div key={index} className="flex items-center mb-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={answer.isCorrect}
                  onChange={() => {
                    // Set current as correct and all others as incorrect
                    const newAnswers = formData.answers.map((a, i) => ({
                      ...a,
                      isCorrect: i === index
                    }));
                    setFormData({ ...formData, answers: newAnswers });
                  }}
                  className="mr-2"
                  required={index === 0}
                />
                <input
                  type="text"
                  value={answer.answer}
                  onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
                  placeholder={`${t('answer')} ${index + 1}`}
                  required
                />
              </div>
            ))}
            <p className="text-sm text-gray-600 mt-1">{t('selectCorrectAnswer')}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-quizBlue text-white rounded hover:bg-blue-700 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? t('saving') : t('saveQuestion')}
          </button>
        </div>
      </form>
    </div>
  );
}
