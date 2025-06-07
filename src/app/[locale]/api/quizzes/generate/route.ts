import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';
import { getTranslations } from 'next-intl/server';

export async function POST(request: NextRequest) {
    try {
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: '' });

        const user = await getCurrentUser();
        if (!user || !user.userToken) {
            return NextResponse.json({ error: t('API.errors.unauthorized') }, { status: 401 });
        }

        const { name, category, count, level } = await request.json();

        const response = await fetch(`${API_BASE_URL}/quizzes/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, category, level, count})
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