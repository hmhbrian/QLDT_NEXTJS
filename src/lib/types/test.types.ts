/**
 * Test & Question Domain Types
 * All test and question-related interfaces and types.
 */

// --- Frontend UI Models ---

export interface Question {
  id: number;
  questionCode?: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerIndexes: number[];
  explanation?: string;
  position?: number;
}

export interface Test {
  id: number;
  title: string;
  questions: Question[];
  passingScorePercentage: number;
  timeTest: number; // Add timeTest in minutes
  countQuestion: number;
  isDone: boolean;
  score?: number; // Add score field
  isPassed?: boolean; // Add isPassed field
  createdBy?: { id: string; name: string };
  updatedBy?: { id: string; name: string }; // Add updatedBy field
}

export interface UiQuestion {
  id: number;
  text: string;
  options: string[];
  correctOptions: string[];
  questionType: number;
  explanation: string;
  position: number;
}

export interface UiTest {
  id: string;
  courseId: string;
  title: string;
  passThreshold: number;
  timeTest: number; // Ensure this is here
  createdBy: {
    id: string;
    name: string;
  };
  questions: UiQuestion[];
}

// --- API DTOs and Payloads ---
export interface ApiQuestion {
  id: number;
  testId?: number;
  questionText: string;
  correctOption: string;
  questionType: number;
  explanation: string;
  position: number;
  a: string;
  b: string;
  c: string;
  d: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiTest {
  id: number;
  title: string;
  passThreshold: number;
  timeTest: number; // Ensure this is here
  countQuestion: number;
  isDone?: boolean; // Ensure isDone is here
  score?: number; // Add score field
  isPassed?: boolean; // Add isPassed field
  questions?: ApiQuestion[];
  createdBy?: { id: string; name: string };
  updatedBy?: { id: string; name: string }; // Add updatedBy field
}

export interface CreateQuestionPayload {
  QuestionText: string;
  CorrectOption?: string;
  QuestionType?: number;
  Explanation?: string;
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  Position?: number;
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {}

export interface CreateTestPayload {
  Title: string;
  PassThreshold: number;
  TimeTest: number; // Ensure this is here
  Questions: CreateQuestionPayload[];
}

export interface UpdateTestPayload {
  Title: string;
  PassThreshold: number;
  TimeTest: number;
}

// --- Test Submission Interfaces ---
export interface SelectedAnswer {
  questionId: number;
  selectedOptions: string[];
}

export interface TestSubmissionResponse {
  id: string;
  test: {
    id: number;
    title: string;
  };
  score: number;
  user: {
    id: string;
    name: string;
  };
  isPassed: boolean;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  startedAt: string;
  submittedAt: string;
}

export interface UserAnswerAndCorrectAnswer {
  question: ApiQuestion;
  selectedOptions: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface DetailedTestResult {
  userAnswers: UserAnswerAndCorrectAnswer[];
  id: string;
  test: {
    id: number;
    title: string;
  };
  score: number;
  user: {
    id: string;
    name: string;
  };
  isPassed: boolean;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  startedAt: string;
  submittedAt: string;
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  selectedOptions: string[];
  correctOptions: string[];
  isCorrect: boolean;
  explanation?: string;
}

// --- Question without answers (for security) ---
export interface QuestionNoAnswer {
  id: number;
  questionText: string;
  questionType: number;
  position: number;
  a: string;
  b: string;
  c: string;
  d: string;
}
