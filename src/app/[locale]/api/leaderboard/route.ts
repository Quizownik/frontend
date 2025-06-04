import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/app/[locale]/lib/session';
import {API_BASE_URL} from '@/app/[locale]/lib/utils';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // Użyj tokenu z sesji do autoryzacji zapytania do zewnętrznego API
        try {
            const response = await fetch(`${API_BASE_URL}/user/topRankedUsers`, {
                headers: {
                    'Authorization': `Bearer ${user.userToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();

                return NextResponse.json({
                    error: `API error: ${response.status}`,
                    details: errorText
                }, {status: response.status});
            }

            const userEntries = await response.json();
            console.log('Fetched user entries:', userEntries);
            return NextResponse.json(userEntries);
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

