import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // Pobierz parametry paginacji i kategorii z URL
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';
        const category = searchParams.get('category') || 'All';
        const sort = searchParams.get('sort') || 'name';

        // Użyj tokenu z sesji do autoryzacji zapytania do zewnętrznego API
        try {
            const response = await fetch(
                `${API_BASE_URL}/quizzes/sorted?category=${encodeURIComponent(category)}&page=${page}&size=${size}&sort=${sort}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user.userToken}`
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                return NextResponse.json({
                    error: `API error: ${response.status}`,
                    details: errorText
                }, {status: response.status});
            }

            const quizzes = await response.json();
            return NextResponse.json(quizzes);
        } catch (apiError) {
            // Bezpieczne wyciągnięcie wiadomości błędu
            const errorMessage = apiError instanceof Error ? apiError.message : 'Nieznany błąd';
            return NextResponse.json({
                error: 'Failed to fetch quizzes from API',
                details: errorMessage
            }, {status: 500});
        }
    } catch (sessionError) {
        // Bezpieczne wyciągnięcie wiadomości błędu
        const errorMessage = sessionError instanceof Error ? sessionError.message : 'Nieznany błąd';
        return NextResponse.json({
            error: 'Session error',
            details: errorMessage
        }, {status: 500});
    }
}

