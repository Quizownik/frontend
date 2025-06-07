import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';
import { getTranslations } from 'next-intl/server';

type QuizGenerateRequest = {
    name: string;
    category: string,
    level: string,
    numberOfQuestions: number,
}

export async function POST(request: NextRequest) {
    try {
        const t = await getTranslations('');

        const user = await getCurrentUser();
        if (!user || !user.userToken) {
            return NextResponse.json({ error: t('API.errors.unauthorized') }, { status: 401 });
        }

        const { name, category, count, level } = await request.json();

        const quizToGenerate: QuizGenerateRequest = {
            name: name,
            category: category,
            level: level,
            numberOfQuestions: count,
        }

        const response = await fetch(`${API_BASE_URL}/quizzes/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizToGenerate)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                error: `${t('API.errors.serverError')}: ${response.status}`,
                details: errorText
            }, { status: response.status });
        }

        const quiz = await response.json();
        return NextResponse.json(quiz);
    } catch (err) {
        const defaultLocale = 'pl';
        const t = await getTranslations({ locale: defaultLocale, namespace: '' });
        const errorMessage = err instanceof Error ? err.message : t('API.errors.internalServerError');
        return NextResponse.json({
            error: t('API.errors.internalServerError'),
            details: errorMessage
        }, { status: 500 });
    }
}