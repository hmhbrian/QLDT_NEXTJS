import {
  Question,
  CreateQuestionPayload,
  ApiQuestion,
} from "@/lib/types/test.types";

export function mapUiQuestionToApiPayload(
  uiQuestion: Partial<Question>
): CreateQuestionPayload {
  const options = uiQuestion.options || ["", "", "", ""];

  let correctOption = "";
  if (
    uiQuestion.correctAnswerIndexes &&
    uiQuestion.correctAnswerIndexes.length > 0
  ) {
    correctOption = uiQuestion.correctAnswerIndexes
      .map((index) => String.fromCharCode(97 + index))
      .join(",");
  } else if (
    uiQuestion.correctAnswerIndex !== undefined &&
    uiQuestion.correctAnswerIndex >= 0
  ) {
    correctOption = String.fromCharCode(97 + uiQuestion.correctAnswerIndex);
  }

  const payload: CreateQuestionPayload = {
    QuestionText: uiQuestion.text || "",
    CorrectOption: correctOption,
    QuestionType: uiQuestion.correctAnswerIndexes?.length || 1,
    Explanation: uiQuestion.explanation || "",
    A: options[0] || "",
    B: options[1] || "",
    C: options[2] || "",
    D: options[3] || "",
  };

  // Only add Position if it's defined and greater than 0
  if (uiQuestion.position !== undefined && uiQuestion.position > 0) {
    payload.Position = uiQuestion.position;
  }

  return payload;
}

export function mapApiQuestionToUi(apiQuestion: ApiQuestion): Question {
  // Luôn đảm bảo có đủ 4 options, không filter ra options rỗng
  const options = [
    apiQuestion.a || "",
    apiQuestion.b || "",
    apiQuestion.c || "",
    apiQuestion.d || "",
  ];

  let correctAnswerIndex = -1;
  const correctAnswerIndexes: number[] = [];

  if (apiQuestion.correctOption) {
    const correctOptions = apiQuestion.correctOption
      .split(",")
      .map((s) => s.trim().toLowerCase());
    correctOptions.forEach((opt) => {
      const index = opt.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
      if (index >= 0 && index < 4) {
        // Luôn check với 4 options
        correctAnswerIndexes.push(index);
      }
    });
  }

  if (correctAnswerIndexes.length > 0) {
    correctAnswerIndex = correctAnswerIndexes[0];
  }

  return {
    id: apiQuestion.id,
    questionCode: `Q${apiQuestion.id}`, // Tạo questionCode từ id
    text: apiQuestion.questionText,
    options,
    correctAnswerIndex,
    correctAnswerIndexes: correctAnswerIndexes.sort((a, b) => a - b),
    explanation: apiQuestion.explanation || "",
    position: apiQuestion.position || 0,
  };
}
