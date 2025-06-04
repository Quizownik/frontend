import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

export async function GET(request: NextRequest) {
    try {
        // Pobierz parametry paginacji z URL
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';
        // const sort = searchParams.get('sort') || '';

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            // Używamy parametrów paginacji w URL
            const response = await fetch(`${API_BASE_URL}/results/my?page=${page}&size=${size}&sort=`, {
                headers: {
                    'Authorization': `Bearer ${user.userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error (${response.status}):`, errorText);

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
