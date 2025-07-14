import type {
  Question,
  CreateQuestionPayload,
  ApiQuestion,
} from "@/lib/types/course.types";


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

  return {
    QuestionText: uiQuestion.text || "",
    CorrectOption: correctOption,
    QuestionType: uiQuestion.correctAnswerIndexes?.length || 1,
    Explanation: uiQuestion.explanation || "",
    A: options[0] || "",
    B: options[1] || "",
    C: options[2] || "",
    D: options[3] || "",
    Position: uiQuestion.position,
  };
}


export function mapApiQuestionToUi(apiQuestion: ApiQuestion): Question {
  const options = [
    apiQuestion.a || "",
    apiQuestion.b || "",
    apiQuestion.c || "",
    apiQuestion.d || "",
  ].filter(opt => opt); // Filter out empty options

  let correctAnswerIndex = -1;
  const correctAnswerIndexes: number[] = [];

  if (apiQuestion.correctOption) {
    const correctOptions = apiQuestion.correctOption.split(',').map(s => s.trim().toLowerCase());
    correctOptions.forEach(opt => {
        const index = opt.charCodeAt(0) - 97;
        if(index >= 0 && index < options.length) {
            correctAnswerIndexes.push(index);
        }
    });
  }

  if (correctAnswerIndexes.length > 0) {
      correctAnswerIndex = correctAnswerIndexes[0];
  }
  
  return {
    id: apiQuestion.id,
    text: apiQuestion.questionText,
    options,
    correctAnswerIndex,
    correctAnswerIndexes: correctAnswerIndexes.sort((a,b) => a - b),
    explanation: apiQuestion.explanation || "",
    position: apiQuestion.position,
  };
}
