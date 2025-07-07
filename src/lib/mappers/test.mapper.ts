
import type {
  Test,
  Question,
  ApiTest,
  ApiQuestion,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/lib/types/course.types";

/**
 * Maps an API question object to a UI-friendly Question object.
 * @param apiQuestion - The question object from the API.
 * @returns A UI `Question` object.
 */
function mapApiQuestionToUi(apiQuestion: ApiQuestion): Question {
  const options = [
    apiQuestion.a,
    apiQuestion.b,
    apiQuestion.c,
    apiQuestion.d,
  ].filter((opt): opt is string => typeof opt === 'string' && opt.trim() !== '');

  const correctIndex = options.findIndex(opt => opt === apiQuestion.correctOption);

  return {
    id: apiQuestion.id.toString(), // Convert number ID to string for UI consistency
    questionCode: apiQuestion.questionCode || `Q${apiQuestion.id}`,
    text: apiQuestion.questionText,
    options,
    correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0,
    explanation: apiQuestion.explanation || "",
  };
}

/**
 * Maps an API test object to a UI-friendly Test object.
 * @param apiTest - The test object from the API.
 * @returns A UI `Test` object.
 */
export function mapApiTestToUiTest(apiTest: ApiTest): Test {
  return {
    id: apiTest.id,
    title: apiTest.title,
    questions: (apiTest.questions || []).map(mapApiQuestionToUi),
    passingScorePercentage: apiTest.passThreshold || 70,
    time: apiTest.timeTest || 0,
  };
}

/**
 * Maps a UI Question object to the format required for the API create payload.
 * @param uiQuestion - The UI Question object.
 * @returns An object matching the API's question structure.
 */
function mapUiQuestionToApiPayload(uiQuestion: Question): any {
  return {
    questionText: uiQuestion.text,
    correctOption: uiQuestion.options[uiQuestion.correctAnswerIndex],
    questionType: 0, // Defaulting as per API spec
    explanation: uiQuestion.explanation || "",
    a: uiQuestion.options[0] || "",
    b: uiQuestion.options[1] || "",
    c: uiQuestion.options[2] || "",
    d: uiQuestion.options[3] || "",
  };
}

/**
 * Maps a UI Test object to the payload for the 'create' API endpoint.
 * @param uiTest - The UI Test object.
 * @returns A `CreateTestPayload` object.
 */
export function mapUiTestToCreatePayload(uiTest: Test): CreateTestPayload {
  return {
    title: uiTest.title,
    passThreshold: uiTest.passingScorePercentage,
    timeTest: uiTest.time || 0,
    questions: (uiTest.questions || []).map(mapUiQuestionToApiPayload),
  };
}

/**
 * Maps a UI Test object to the payload for the 'update' API endpoint.
 * @param uiTest - The UI Test object.
 * @returns An `UpdateTestPayload` object.
 */
export function mapUiTestToUpdatePayload(uiTest: Test): UpdateTestPayload {
  return {
    title: uiTest.title,
    pass_threshold: uiTest.passingScorePercentage,
    time_test: uiTest.time || 0,
    position: 0, // Defaulting as per API spec
  };
}
