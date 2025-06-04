import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

/**
 * Endpoint do tworzenia nowego quizu.
 * Format danych zgodny ze Swaggerem:
 * {
 *   "position": 0,
 *   "name": "string",
 *   "category": "Vocabulary",
 *   "questionIds": [0]
 * }
 */
export async function POST(request: NextRequest) {
  // Pobierz dane użytkownika z sesji
  const user = await getCurrentUser();

  if (!user || !user.userToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Parsowanie danych z ciała żądania
    const body = await request.json();

    // Walidacja danych
    if (!body.name || !body.category || !Array.isArray(body.questionIds)) {
      return NextResponse.json(
        { error: 'Invalid quiz data. Required fields: name, category, questionIds (array)' },
        { status: 400 }
      );
    }

    // Przygotowanie danych do wysłania zgodnie ze Swaggerem
    const quizData = {
      position: body.position || 0,
      name: body.name,
      category: body.category,
      questionIds: body.questionIds
    };

    // Wywołanie API backend
    const response = await fetch(`${API_BASE_URL}/quizzes/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData)
    });

    // Obsługa błędów z API
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating quiz:', errorText);

      return NextResponse.json(
        { error: 'Failed to create quiz', details: errorText },
        { status: response.status }
      );
    }

    // Zwracanie odpowiedzi z serwera
    const data = await response;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating quiz:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
