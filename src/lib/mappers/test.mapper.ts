import type {
  Test,
  ApiTest,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/lib/types/course.types";
import { mapApiQuestionToUi, mapUiQuestionToApiPayload } from "./question.mapper";

export function mapApiTestToUiTest(apiTest: ApiTest): Test {
  return {
    id: apiTest.id,
    title: apiTest.title,
    countQuestion: apiTest.countQuestion || 0,
    questions: (apiTest.questions || []).map(mapApiQuestionToUi),
    passingScorePercentage: apiTest.passThreshold || 70,
    time: apiTest.timeTest || 0,
  };
}

export function mapUiTestToCreatePayload(uiTest: Partial<Test>): CreateTestPayload {
  return {
    Title: uiTest.title || "Bài kiểm tra không tên",
    PassThreshold: uiTest.passingScorePercentage || 70,
    TimeTest: uiTest.time || 0,
    Questions: (uiTest.questions || []).map(q => mapUiQuestionToApiPayload(q)),
  };
}

export function mapUiTestToUpdatePayload(uiTest: Partial<Test>): UpdateTestPayload {
  return {
    Title: uiTest.title || "Bài kiểm tra không tên",
    PassThreshold: uiTest.passingScorePercentage || 70,
    TimeTest: uiTest.time || 0,
  };
}
