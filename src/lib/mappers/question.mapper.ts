import type {
  Question,
  CreateQuestionPayload,
  ApiQuestion,
} from "@/lib/types/course.types";

/**
 * Maps a UI Question object to the format required for the API create/update payload.
 * @param uiQuestion - The UI Question object.
 * @returns An object matching the API's question structure.
 */
export function mapUiQuestionToApiPayload(
  uiQuestion: Partial<Question>
): CreateQuestionPayload {
  const options = uiQuestion.options || ["", "", "", ""];
  return {
    questionText: uiQuestion.text || "",
    correctOption: options[uiQuestion.correctAnswerIndex || 0] || "",
    questionType: 0, // Defaulting as per API spec
    explanation: uiQuestion.explanation || "",
    a: options[0] || "",
    b: options[1] || "",
    c: options[2] || "",
    d: options[3] || "",
  };
}

/**
 * Maps an API question object to a UI-friendly Question object.
 * @param apiQuestion - The question object from the API.
 * @returns A UI `Question` object.
 */
export function mapApiQuestionToUi(apiQuestion: ApiQuestion): Question {
  const options = [
    apiQuestion.a,
    apiQuestion.b,
    apiQuestion.c,
    apiQuestion.d,
  ].filter((opt): opt is string => typeof opt === "string" && opt.trim() !== "");

  const correctIndex = options.findIndex(
    (opt) => opt === apiQuestion.correctOption
  );

  return {
    id: apiQuestion.id,
    questionCode: apiQuestion.questionCode || `Q${apiQuestion.id}`,
    text: apiQuestion.questionText,
    options,
    correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0,
    explanation: apiQuestion.explanation || "",
  };
}
