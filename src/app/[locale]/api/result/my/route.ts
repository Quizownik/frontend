import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Pobierz wyniki quizów użytkownika
        try {
            const response = await fetch(`${API_BASE_URL}/result/my`, {
                headers: {
                    'Authorization': `Bearer ${user.userToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                return NextResponse.json({
                    error: `API error: ${response.status}`,
                    details: errorText
                }, { status: response.status });
            }

            const results = await response.json();
            return NextResponse.json(results);
        } catch (apiError) {
            const errorMessage = apiError instanceof Error ? apiError.message : 'Nieznany błąd';
            return NextResponse.json({
                error: 'Failed to fetch quiz results from API',
                details: errorMessage
            }, { status: 500 });
        }
    } catch (sessionError) {
        const errorMessage = sessionError instanceof Error ? sessionError.message : 'Nieznany błąd';
        return NextResponse.json({
            error: 'Session error',
            details: errorMessage
        }, { status: 500 });
    }
}
