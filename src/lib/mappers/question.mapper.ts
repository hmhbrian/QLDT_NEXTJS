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

  // Support both single and multiple correct answers
  let correctOption = "";

  if (
    uiQuestion.correctAnswerIndexes &&
    uiQuestion.correctAnswerIndexes.length > 0
  ) {
    // Multiple correct answers - convert indices to letters (a,b,c,d)
    const letters = uiQuestion.correctAnswerIndexes
      .filter(index => index >= 0 && index < 4) // Validate indices
      .map(index => String.fromCharCode(97 + index)); // 97 = 'a'
    correctOption = letters.join(",");
  } else if (
    uiQuestion.correctAnswerIndex !== undefined &&
    uiQuestion.correctAnswerIndex >= 0 &&
    uiQuestion.correctAnswerIndex < 4
  ) {
    // Single correct answer (backward compatibility) - store as letter
    correctOption = String.fromCharCode(97 + uiQuestion.correctAnswerIndex);
  }

  return {
    questionText: uiQuestion.text || "",
    correctOption,
    questionType: 0, // Defaulting as per API spec
    explanation: uiQuestion.explanation || "",
    a: options[0] || "",
    b: options[1] || "",
    c: options[2] || "",
    d: options[3] || "",
    position: uiQuestion.position,
  };
}

/**
 * Maps an API question object to a UI-friendly Question object.
 * @param apiQuestion - The question object from the API.
 * @returns A UI `Question` object.
 */
export function mapApiQuestionToUi(apiQuestion: ApiQuestion): Question {
  // Keep all 4 options to maintain index consistency
  const options = [
    apiQuestion.a || "",
    apiQuestion.b || "",
    apiQuestion.c || "",
    apiQuestion.d || "",
  ];

  // Handle both single and multiple correct answers
  let correctAnswerIndex = 0;
  let correctAnswerIndexes: number[] = [];

  if (apiQuestion.correctOption) {
    if (apiQuestion.correctOption.includes(",")) {
      // Multiple correct answers - format like "a,b,c"
      const letters = apiQuestion.correctOption
        .split(",")
        .map((s) => s.trim().toLowerCase());
      correctAnswerIndexes = letters
        .map((letter) => letter.charCodeAt(0) - 97) // 97 = 'a'
        .filter((index) => index >= 0 && index < 4);

      // For backward compatibility, set the first correct answer as the main index
      correctAnswerIndex = correctAnswerIndexes[0] || 0;
    } else {
      // Single correct answer - could be letter (a,b,c,d) or actual text
      const singleAnswer = apiQuestion.correctOption.trim();

      if (singleAnswer.length === 1 && /[a-d]/i.test(singleAnswer)) {
        // It's a letter like "a", "b", etc.
        correctAnswerIndex = singleAnswer.toLowerCase().charCodeAt(0) - 97;
        correctAnswerIndexes = [correctAnswerIndex];
      } else {
        // It's the actual answer text - find matching option
        const foundIndex = options.findIndex(
          (opt) => opt.trim() !== "" && opt === singleAnswer
        );
        correctAnswerIndex = foundIndex !== -1 ? foundIndex : 0;
        correctAnswerIndexes = [correctAnswerIndex];
      }
    }
  }

  return {
    id: apiQuestion.id,
    questionCode: apiQuestion.questionCode || `Q${apiQuestion.id}`,
    text: apiQuestion.questionText,
    options,
    correctAnswerIndex,
    correctAnswerIndexes,
    explanation: apiQuestion.explanation || "",
    position: apiQuestion.position,
  };
}
