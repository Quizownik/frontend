import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';
import { getTranslations } from 'next-intl/server';

export async function GET(request: NextRequest) {
    try {
        // Get translations based on the request locale
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: '' });

        // Pobierz parametry paginacji z URL
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';
        // const sort = searchParams.get('sort') || '';

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ error: t('API.errors.unauthorized') }, { status: 401 });
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
                    error: `${t('API.errors.serverError')}: ${response.status}`,
                    details: errorText
                }, { status: response.status });
            }

            const results = await response.json();
            return NextResponse.json(results);
        } catch (apiError) {
            const errorMessage = apiError instanceof Error ? apiError.message : t('API.errors.internalServerError');
            return NextResponse.json({
                error: t('API.errors.resultNotFound'),
                details: errorMessage
            }, { status: 500 });
        }
    } catch (sessionError) {
        // Fallback to default locale if there's a session error
        const defaultLocale = 'pl';
        const t = await getTranslations({ locale: defaultLocale, namespace: '' });

        const errorMessage = sessionError instanceof Error ? sessionError.message : t('API.errors.internalServerError');
        return NextResponse.json({
            error: t('API.errors.unauthorized'),
            details: errorMessage
        }, { status: 500 });
    }
}
