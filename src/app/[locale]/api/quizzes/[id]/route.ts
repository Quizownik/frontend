import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';
import { getTranslations } from 'next-intl/server';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Get translations based on the request locale
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: '' });

        // Pobieramy parametry w sposób asynchroniczny
        const params = await context.params;
        const quizId = params.id;

        if (!quizId) {
            return NextResponse.json({error: t('API.quizIdRequired')}, {status: 400});
        }

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: t('API.errors.unauthorized')}, {status: 401});
        }

        // Użyj tokenu z sesji do autoryzacji zapytania do zewnętrznego API
        try {
            const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${user.userToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();

                return NextResponse.json({
                    error: `${t('API.errors.serverError')}: ${response.status}`,
                    details: errorText
                }, {status: response.status});
            }

            const quizzes = await response.json();

            return NextResponse.json(quizzes);
        } catch (apiError) {
            // Bezpieczne wyciągnięcie wiadomości błędu
            const errorMessage = apiError instanceof Error ? apiError.message : t('API.errors.internalServerError');
            return NextResponse.json({
                error: t('API.errors.quizNotFound'),
                details: errorMessage
            }, {status: 500});
        }
    } catch (sessionError) {
        // Fallback to default locale if there's a session error
        const defaultLocale = 'pl';
        const t = await getTranslations({ locale: defaultLocale, namespace: '' });

        // Bezpieczne wyciągnięcie wiadomości błędu
        const errorMessage = sessionError instanceof Error ? sessionError.message : t('API.errors.internalServerError');
        return NextResponse.json({
            error: t('API.errors.unauthorized'),
            details: errorMessage
        }, {status: 500});
    }
}

