export interface OverallAvgFeedback {
  q1_relevanceAvg: number;
  q2_clarityAvg: number;
  q3_structureAvg: number;
  q4_durationAvg: number;
  q5_materialAvg: number;
  totalFeedbacks: number; // This might be a separate call or part of another response
}

export interface CourseAndAvgFeedback {
  courseName: string;
  avgFeedback: Omit<OverallAvgFeedback, "totalFeedbacks">;
}

export interface TopDepartment {
  departmentName: string;
  numberOfUsersParticipated: number;
  totalUsers: number;
  participationRate: number;
}

export interface TrainingOverviewStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  completionRate: number;
  avgTrainingHours: number;
  positiveFeedbackRate: number;
}
