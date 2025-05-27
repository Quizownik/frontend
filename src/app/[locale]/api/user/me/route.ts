import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/me`, {
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

            const userData = await response.json();
            return NextResponse.json(userData);
        } catch (apiError) {
            const errorMessage = apiError instanceof Error ? apiError.message : 'Nieznany błąd';
            return NextResponse.json({
                error: 'Nie udało się pobrać danych użytkownika z API',
                details: errorMessage
            }, {status: 500});
        }
    } catch (sessionError) {
        const errorMessage = sessionError instanceof Error ? sessionError.message : 'Nieznany błąd';
        return NextResponse.json({
            error: 'Błąd sesji',
            details: errorMessage
        }, {status: 500});
    }
}
