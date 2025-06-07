import {NextRequest, NextResponse} from 'next/server';
import {getCurrentUser} from '@/app/[locale]/lib/session';
import {API_BASE_URL} from '@/app/[locale]/lib/utils';

export async function PUT(
    request: NextRequest,
    {params}: { params: { id: string } }
) {

    // Pobierz dane użytkownika z sesji
    const user = await getCurrentUser();

    if (!user || !user.userToken) {
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        );
    }

    try {
        // Walidacja ID quizu
        const {id} = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json(
                {error: 'Invalid quiz ID'},
                {status: 400}
            );
        }

        // Parsowanie danych z ciała żądania
        const body = await request.json();

        // Walidacja danych
        if (!body.name || !body.category || !Array.isArray(body.questionIds)) {
            return NextResponse.json(
                {error: 'Invalid quiz data. Required fields: name, category, questionIds (array)'},
                {status: 400}
            );
        }

        // Przygotowanie danych do wysłania zgodnie ze Swaggerem
        const quizData = {
            name: body.name,
            category: body.category,
            questionIds: body.questionIds
        };

        console.log(quizData);

        // Wywołanie API backend
        const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${user.userToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData)
        });

        // Obsługa błędów z API
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error updating quiz ${id}:`, errorText);

            return NextResponse.json(
                {error: 'Failed to update quiz', details: errorText},
                {status: response.status}
            );
        }

        // Zwracanie odpowiedzi z serwera
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating quiz:', error);

        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}
