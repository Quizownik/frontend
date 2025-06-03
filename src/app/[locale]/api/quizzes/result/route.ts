import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        // Sprawdzenie, czy wszystkie wymagane pola są obecne
        if (!body.quizId || !body.userId || !body.finishedAt || body.duration === undefined ||
            !body.questionOrder || !body.chosenAnswers) {
            return NextResponse.json(
                { error: 'Nieprawidłowe dane wyniku quizu'},
                { status: 400 }
            );
        }

        // Wysyłanie danych do backendu
        try {
            const response = await fetch(`${API_BASE_URL}/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.userToken}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                return NextResponse.json({
                    error: `API error: ${response.status}`,
                    details: errorText
                }, { status: response.status });
            }

            const result = await response;
            return NextResponse.json(result);
        } catch (apiError) {
            const errorMessage = apiError instanceof Error ? apiError.message : 'Nieznany błąd';
            return NextResponse.json({
                error: 'Błąd podczas zapisywania wyniku quizu',
                details: errorMessage + '\n' + JSON.stringify(body)
            }, { status: 500 });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
        return NextResponse.json({
            error: 'Błąd serwera',
            details: errorMessage
        }, { status: 500 });
    }
}
