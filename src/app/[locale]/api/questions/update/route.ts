import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from "@/app/[locale]/lib/session";
import { API_BASE_URL } from "@/app/[locale]/lib/utils";
import { getTranslations } from 'next-intl/server';

export async function PUT(request: NextRequest) {
    try {
        // Get translations based on the request locale
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: 'AdminPage' });
        const apiT = await getTranslations({ locale, namespace: 'API.errors' });

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ message: apiT('unauthorized') }, { status: 401 });
        }

        const requestBody = await request.json();
        const { id, question, category, answers } = requestBody;

        // Podstawowa walidacja
        if (!id || !question || !category || !answers || !Array.isArray(answers) || answers.length < 2) {
            return NextResponse.json({ message: apiT('invalidData') }, { status: 400 });
        }

        // Sprawdzenie czy jest co najmniej jedna poprawna odpowiedź
        if (!answers.some(a => a.isCorrect)) {
            return NextResponse.json({ message: t('correctAnswerRequired') }, { status: 400 });
        }

        // Przygotowanie danych do wysłania
        const questionData = {
            question,
            category,
            answers
        };

        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.userToken}`
            },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                message: t('updateError') || 'Error updating question',
                details: errorText
            }, { status: response.status });
        }

        const updatedQuestion = await response.json();
        return NextResponse.json({
            ...updatedQuestion,
            message: t('questionUpdated')
        });
    } catch (error) {
        console.error('Error in questions/update API:', error);
        return NextResponse.json(
            { message: 'An error occurred while updating the question' },
            { status: 500 }
        );
    }
}

