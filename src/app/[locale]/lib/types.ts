export type Question = {
    id: number;
    question: string;
    category: string;
    answers: {
        id: number;
        answer: string;
        isCorrect: boolean;
    }[];
};

export type Quiz = {
    id?: number;
    position: number;
    name: string;
    category: string;
    questionIds: number[];
    questions?: Question[];
};

export type QuizLabel = {
    id: number;
    position: number;
    name: string;
    category: string;
    level: string;
    isMastered: boolean;
    numberOfQuestions: number;
}

export type Sort = {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
};

export type Pageable = {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

export type PageResponse = {
    content: QuizLabel[];
    pageable: Pageable;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // Aktualny numer strony
    sort: Sort;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
};

