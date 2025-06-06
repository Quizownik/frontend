import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';
import { API_BASE_URL } from '@/app/[locale]/lib/utils';

// Interfejs dla struktury odpowiedzi
interface Answer {
  answer: string;
  isCorrect: boolean;
}

// Interfejs dla struktury pytania
interface QuestionData {
  question: string;
  category: string;
  answers: Answer[];
}

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
    const body = await request.json() as QuestionData;

    // Walidacja danych
    if (!body.question || !body.category || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid question data. Required fields: question, category, answers (array)' },
        { status: 400 }
      );
    }


    // Sprawdzenie czy jest co najmniej jedna poprawna odpowiedź
    if (!body.answers.some((answer: Answer) => answer.isCorrect)) {
      return NextResponse.json(
        { error: 'At least one answer must be marked as correct' },
        { status: 400 }
      );
    }

    // Sprawdzenie czy wszystkie odpowiedzi mają treść
    if (body.answers.some((answer: Answer) => !answer.answer || answer.answer.trim() === '')) {
      return NextResponse.json(
        { error: 'All answers must have content' },
        { status: 400 }
      );
    }

    // Przygotowanie danych do wysłania
    const questionData = {
      question: body.question,
      category: body.category,
      answers: body.answers
    };

    // Wywołanie API backend
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData)
    });

    // Obsługa błędów z API
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating question:', errorText);

      return NextResponse.json(
        { error: 'Failed to create question', details: errorText },
        { status: response.status }
      );
    }

    // Zwracanie odpowiedzi z serwera
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating question:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
