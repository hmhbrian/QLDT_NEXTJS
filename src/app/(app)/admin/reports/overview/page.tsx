
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { StarRatingDisplay } from '@/components/courses/StarRatingDisplay';
import { BookCheck, Users, Percent, Clock, Award, TrendingUp, FileText, Activity, PieChart, CheckSquare, BarChartHorizontalBig, BookText as BookTextIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useCookie } from "@/hooks/use-cookie";
import { useUserStore } from "@/stores/user-store";
import type { Course, User, StudentCourseEvaluation, Department } from "@/lib/types";
import {
    mockCourses as initialMockCourses,
    mockEvaluations as initialMockEvaluations
} from "@/lib/mock";
import { departmentOptions as globalDepartmentOptions } from '@/lib/constants';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
} from 'date-fns';


const OVERVIEW_REPORT_COURSES_KEY = 'becamex-courses-data';
const OVERVIEW_REPORT_EVALUATIONS_KEY = 'becamex-course-evaluations-data';

const evaluationCriteriaLabels: Record<keyof StudentCourseEvaluation['ratings'], string> = {
  contentRelevance: "Nội dung phù hợp công việc",
  clarity: "Kiến thức dễ hiểu",
  structureLogic: "Cấu trúc logic",
  durationAppropriateness: "Thời lượng hợp lý",
  materialsEffectiveness: "Tài liệu hiệu quả",
};

type CriteriaKey = keyof StudentCourseEvaluation['ratings'];

const criteriaOrder: CriteriaKey[] = [
  'contentRelevance',
  'clarity',
  'structureLogic',
  'durationAppropriateness',
  'materialsEffectiveness'
];

interface DepartmentStat {
  id: Department;
  name: string;
  courses: number;
  trainees: number;
  score: number;
}

function getDateRange(period: string): { start: Date; end: Date } | null {
  const now = new Date();
  switch (period) {
    case 'last_month':
      const prevMonth = subMonths(now, 1);
      return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };
    case 'last_quarter':
      const prevQuarter = subQuarters(now, 1);
      return { start: startOfQuarter(prevQuarter), end: endOfQuarter(prevQuarter) };
    case 'last_year':
      const prevYear = subYears(now, 1);
      return { start: startOfYear(prevYear), end: endOfYear(prevYear) };
    case 'all_time':
    default:
      return null; // Trả về null nếu là 'all_time' hoặc giá trị không xác định
  }
}


export default function TrainingOverviewReportPage() {
  const [allCoursesFromCookie] = useCookie<Course[]>(OVERVIEW_REPORT_COURSES_KEY, initialMockCourses);
  const [allEvaluationsFromCookie] = useCookie<StudentCourseEvaluation[]>(OVERVIEW_REPORT_EVALUATIONS_KEY, initialMockEvaluations);
  const allUsersFromStore = useUserStore(state => state.users);

  const [selectedPeriod, setSelectedPeriod] = useState<string>("all_time");

  const reportData = useMemo(() => {
    const safeCourses = Array.isArray(allCoursesFromCookie) ? allCoursesFromCookie : [];
    const safeEvaluations = Array.isArray(allEvaluationsFromCookie) ? allEvaluationsFromCookie : [];
    const safeUsers = Array.isArray(allUsersFromStore) ? allUsersFromStore : [];

    const dateRange = getDateRange(selectedPeriod);

    // Lọc các khóa học dựa trên giai đoạn và trạng thái
    const coursesInPeriod = safeCourses.filter(course => {
      if (!course) return false; // Bỏ qua nếu khóa học không hợp lệ
      const isActiveStatus = course.status === 'published' || course.status === 'archived';
      if (!isActiveStatus) return false;
      if (!dateRange) return true; // Bao gồm tất cả nếu là 'all_time'
      if (!course.startDate) return false; // Không thể lọc nếu không có ngày bắt đầu
      try {
        const courseStartDate = new Date(course.startDate);
        if (isNaN(courseStartDate.getTime())) return false; // Ngày không hợp lệ
        return isWithinInterval(courseStartDate, dateRange);
      } catch (e) {
        console.error("Lỗi phân tích cú pháp ngày bắt đầu khóa học:", course.startDate, e);
        return false; // Lỗi trong quá trình phân tích cú pháp ngày
      }
    });

    const numCoursesOrganized = coursesInPeriod.length;

    // Tính toán số học viên duy nhất
    const uniqueParticipantIds = new Set<string>();
    coursesInPeriod.forEach(course => {
      if (course && Array.isArray(course.enrolledTrainees)) {
        course.enrolledTrainees.forEach(id => {
          if (id) uniqueParticipantIds.add(id);
        });
      }
    });
    const totalUniqueParticipants = uniqueParticipantIds.size;

    // Tính toán tổng số lượt ghi danh
    let totalEnrollmentsInRelevantCourses = 0;
    coursesInPeriod.forEach(course => {
      if (course && Array.isArray(course.enrolledTrainees)) {
        totalEnrollmentsInRelevantCourses += course.enrolledTrainees.length;
      }
    });

    // Tính toán tổng số lượt hoàn thành
    let totalCompletions = 0;
    safeUsers.forEach(user => {
        if (user && Array.isArray(user.completedCourses)) {
            user.completedCourses.forEach(completedCourse => {
                if (completedCourse && coursesInPeriod.some(c => c && c.id === completedCourse.courseId)) {
                    totalCompletions++;
                }
            });
        }
    });
    const completionRate = totalEnrollmentsInRelevantCourses > 0
        ? Math.round((totalCompletions / totalEnrollmentsInRelevantCourses) * 100)
        : 0;

    // Tính toán tổng số giờ đào tạo được cung cấp
    let totalCourseHoursOffered = 0;
    coursesInPeriod.forEach(course => {
        if (course && course.duration && typeof course.duration.sessions === 'number' && typeof course.duration.hoursPerSession === 'number') {
            totalCourseHoursOffered += course.duration.sessions * course.duration.hoursPerSession;
        }
    });
    const avgTrainingHoursPerPerson = totalUniqueParticipants > 0
        ? parseFloat((totalCourseHoursOffered / totalUniqueParticipants).toFixed(1))
        : 0;

    // Lọc các đánh giá dựa trên giai đoạn
    const evaluationsInPeriod = safeEvaluations.filter(evaluation => {
      if (!evaluation || !coursesInPeriod.some(c => c && c.id === evaluation.courseId)) return false;
      if (!dateRange) return true; // Bao gồm tất cả nếu là 'all_time'
      if (!evaluation.submissionDate) return false; // Không thể lọc nếu không có ngày nộp
      try {
        const submissionDate = new Date(evaluation.submissionDate);
        if (isNaN(submissionDate.getTime())) return false; // Ngày không hợp lệ
        return isWithinInterval(submissionDate, dateRange);
      } catch (e) {
        console.error("Lỗi phân tích cú pháp ngày nộp đánh giá:", evaluation.submissionDate, e);
        return false; // Lỗi trong quá trình phân tích cú pháp ngày
      }
    });

    // Tính toán tỷ lệ đánh giá tích cực
    let positiveEvaluationsCount = 0;
    evaluationsInPeriod.forEach(evaluation => {
        if (evaluation && evaluation.ratings) {
            const criteriaRatings = Object.values(evaluation.ratings);
            const highlyRatedCriteria = criteriaRatings.filter(rating => typeof rating === 'number' && rating >= 4).length;
            const numCriteria = Object.keys(evaluationCriteriaLabels).length;
            if (numCriteria > 0 && highlyRatedCriteria >= Math.max(1, numCriteria -1) ) { // Tích cực nếu >= (số tiêu chí - 1) tiêu chí được đánh giá cao, tối thiểu 1
                positiveEvaluationsCount++;
            }
        }
    });
    const totalRelevantEvaluationsCount = evaluationsInPeriod.length;
    const positiveEvaluationRate = totalRelevantEvaluationsCount > 0
        ? Math.round((positiveEvaluationsCount / totalRelevantEvaluationsCount) * 100)
        : 0;

    // Khởi tạo điểm đánh giá tổng thể
    const overallScores: Record<CriteriaKey, { sum: number, count: number }> = {} as any;
    criteriaOrder.forEach(key => {
        overallScores[key] = { sum: 0, count: 0 };
    });
    let totalValidEvaluationsForCriteria = 0;

    evaluationsInPeriod.forEach(evaluation => {
      if (evaluation && evaluation.ratings) {
        let validCriteriaInEval = 0;
        criteriaOrder.forEach(key => {
          const rating = evaluation.ratings[key];
          if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
            overallScores[key].sum += rating;
            overallScores[key].count += 1;
            validCriteriaInEval++;
          }
        });
        if (validCriteriaInEval > 0) totalValidEvaluationsForCriteria++;
      }
    });

    const overallEvaluationAverages = {} as Record<CriteriaKey, { average: number; count: number }>;
    criteriaOrder.forEach(key => {
      overallEvaluationAverages[key] = {
        average: overallScores[key].count > 0 ? parseFloat((overallScores[key].sum / overallScores[key].count).toFixed(2)) : 0,
        count: overallScores[key].count,
      };
    });

    // Tính toán điểm đánh giá trung bình theo khóa học
    const perCourseEvaluationAverages = coursesInPeriod
      .map(course => {
        if (!course) return null;
        const courseEvaluations = evaluationsInPeriod.filter(ev => ev && ev.courseId === course.id);
        if (!courseEvaluations.length) return null;

        const courseScores: Record<CriteriaKey, { sum: number, count: number }> = {} as any;
        criteriaOrder.forEach(key => {
            courseScores[key] = { sum: 0, count: 0 };
        });
        let totalEvaluationsForCourse = 0;

        courseEvaluations.forEach(evaluation => {
            if (evaluation && evaluation.ratings) {
                let validCriteriaInEval = 0;
                criteriaOrder.forEach(key => {
                    const rating = evaluation.ratings[key];
                    if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
                      courseScores[key].sum += rating;
                      courseScores[key].count += 1;
                      validCriteriaInEval++;
                    }
                });
                if(validCriteriaInEval > 0) totalEvaluationsForCourse++;
            }
        });

        const courseAverages = {} as Record<CriteriaKey, { average: number; count: number }>;
        criteriaOrder.forEach(key => {
          courseAverages[key] = {
            average: courseScores[key].count > 0 ? parseFloat((courseScores[key].sum / courseScores[key].count).toFixed(2)) : 0,
            count: courseScores[key].count,
          };
        });

        return {
          courseId: course.id,
          courseTitle: course.title,
          averages: courseAverages,
          totalEvaluationsForCourse,
        };
      })
      .filter(Boolean) as Array<{ courseId: string; courseTitle: string; averages: Record<CriteriaKey, {average: number; count: number}>; totalEvaluationsForCourse: number}>;

    // Tính toán top phòng ban
    const departmentStatsMap = new Map<Department, { trainees: Set<string>; coursesAttended: Set<string> }>();

    safeUsers.forEach(user => {
        if (user && user.department && user.role === 'Trainee') {
            const deptKey = user.department as Department;
            if (!departmentStatsMap.has(deptKey)) {
                departmentStatsMap.set(deptKey, { trainees: new Set(), coursesAttended: new Set() });
            }
            const stats = departmentStatsMap.get(deptKey)!;
            stats.trainees.add(user.id);

            coursesInPeriod.forEach(courseInP => { // Chỉ xem xét các khóa học trong giai đoạn
                if (courseInP && Array.isArray(courseInP.enrolledTrainees) && courseInP.enrolledTrainees.includes(user.id)) {
                    stats.coursesAttended.add(courseInP.id);
                }
            });
        }
    });

    const calculatedTopDepartments: DepartmentStat[] = Array.from(departmentStatsMap.entries())
        .map(([deptKey, stats]) => {
            const deptInfo = globalDepartmentOptions.find(opt => opt.value === deptKey);
            return {
                id: deptKey,
                name: deptInfo ? deptInfo.label : deptKey.toString().toUpperCase(), // Đảm bảo tên là chuỗi
                trainees: stats.trainees.size,
                courses: stats.coursesAttended.size,
                score: (stats.trainees.size * 1) + (stats.coursesAttended.size * 3), // Ví dụ: điểm được tính dựa trên số học viên và số khóa học
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return {
      numCoursesOrganized,
      totalParticipants: totalUniqueParticipants,
      completionRate,
      avgTrainingHoursPerPerson,
      topDepartments: calculatedTopDepartments,
      positiveEvaluationRate,
      totalRelevantEvaluations: totalRelevantEvaluationsCount,
      overallEvaluationAverages,
      perCourseEvaluationAverages,
      totalValidEvaluationsForCriteria,
    };
  }, [allCoursesFromCookie, allEvaluationsFromCookie, allUsersFromStore, selectedPeriod]);


  const metrics = [
    { id: "coursesOrganized", title: "Số Khóa học Đã Tổ chức", value: reportData.numCoursesOrganized.toString(), icon: FileText, unit: "khóa học" },
    { id: "totalParticipants", title: "Tổng Số Học viên Duy nhất", value: reportData.totalParticipants.toString(), icon: Users, unit: "học viên" },
    { id: "completionRate", title: "Tỷ lệ Hoàn thành", value: `${reportData.completionRate}%`, icon: CheckSquare, unit: `(${reportData.totalParticipants} lượt ghi danh)` },
    { id: "avgTrainingHours", title: "Số Giờ Đào tạo TB/Người", value: `${reportData.avgTrainingHoursPerPerson} giờ`, icon: Clock, unit: "(dựa trên giờ học cung cấp)" },
    { id: "positiveEvalRate", title: "Tỷ lệ Đánh giá Tích cực", value: `${reportData.positiveEvaluationRate}%`, icon: Award, unit: `(${reportData.totalRelevantEvaluations} đánh giá)` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-semibold">Báo cáo Tổng quan & Đánh giá Đào tạo</h1>
          <p className="text-muted-foreground mt-1">Cung cấp cái nhìn tổng thể về hiệu quả, tình hình và chất lượng đào tạo.</p>
        </div>
        <div className="w-full md:w-auto pt-2 md:pt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                 <SelectTrigger className="w-full md:w-[240px] bg-background shadow-sm">
                    <SelectValue placeholder="Chọn Giai đoạn Báo cáo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all_time">Toàn bộ thời gian</SelectItem>
                    <SelectItem value="last_month">Tháng Trước</SelectItem>
                    <SelectItem value="last_quarter">Quý Trước</SelectItem>
                    <SelectItem value="last_year">Năm Trước</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map(metric => (
          <Card key={metric.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-[15px] font-semibold text-card-foreground">{metric.title}</CardTitle>
              <metric.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="text-4xl font-bold text-primary">{metric.value}</div>
              {metric.unit && <p className="text-xs text-muted-foreground pt-1">{metric.unit}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-xl">
            <BarChartHorizontalBig className="mr-3 h-6 w-6 text-primary" />
            Điểm Đánh giá Bình quân Chung ({reportData.totalValidEvaluationsForCriteria} đánh giá)
          </CardTitle>
          <CardDescription>Điểm trung bình cho từng tiêu chí trên tất cả các khóa học trong giai đoạn đã chọn.</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.totalValidEvaluationsForCriteria > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criteriaOrder.map(key => (
                <Card key={key} className="bg-muted/30 p-4">
                  <p className="text-sm font-medium text-muted-foreground">{evaluationCriteriaLabels[key]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRatingDisplay rating={reportData.overallEvaluationAverages[key]?.average || 0} size={5} />
                    <span className="text-lg font-bold text-primary">({reportData.overallEvaluationAverages[key]?.average || 0}/5)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">({reportData.overallEvaluationAverages[key]?.count || 0} lượt)</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Chưa có dữ liệu đánh giá nào để tổng hợp cho giai đoạn này.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-xl">
            <BookTextIcon className="mr-3 h-6 w-6 text-primary" />
            Điểm Đánh giá Chi tiết Theo Khóa học
          </CardTitle>
          <CardDescription>Điểm trung bình cho từng tiêu chí của mỗi khóa học có đánh giá trong giai đoạn đã chọn.</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.perCourseEvaluationAverages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Tên Khóa học</TableHead>
                    {criteriaOrder.map(key => (
                      <TableHead key={key} className="min-w-[180px] text-center">{evaluationCriteriaLabels[key]}</TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">Tổng ĐG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.perCourseEvaluationAverages.map(item => (
                    <TableRow key={item.courseId}>
                      <TableCell className="font-medium">{item.courseTitle}</TableCell>
                      {criteriaOrder.map(key => (
                        <TableCell key={key} className="text-center">
                           <div className="flex flex-col items-center">
                            <StarRatingDisplay rating={item.averages[key]?.average || 0} size={4} />
                            <span className="text-xs text-muted-foreground">({item.averages[key]?.average || 0}/5 - {item.averages[key]?.count || 0} ĐG)</span>
                           </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.totalEvaluationsForCourse}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-8">Không có dữ liệu đánh giá chi tiết theo khóa học để hiển thị cho giai đoạn này.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-xl">
            <Activity className="mr-3 h-6 w-6 text-primary" />Top Phòng ban Tích cực Đào tạo
          </CardTitle>
          <CardDescription>Các phòng ban có hoạt động đào tạo nổi bật nhất trong giai đoạn đã chọn.</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.topDepartments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground w-10">#</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Tên Phòng Ban</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Số Khóa Tham Gia</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Số Học Viên</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Điểm Hoạt Động</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topDepartments.map((dept, index) => (
                    <tr key={dept.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <span className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${
                          index === 0 ? 'bg-primary text-primary-foreground' :
                          (index === 1 ? 'bg-orange-400 text-white' :
                          (index === 2 ? 'bg-yellow-400 text-black' : 'bg-muted text-muted-foreground'))
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-card-foreground">{dept.name}</td>
                      <td className="p-3 text-right">{dept.courses}</td>
                      <td className="p-3 text-right">{dept.trainees}</td>
                      <td className="p-3 text-right font-semibold text-primary">{dept.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu về phòng ban để hiển thị cho giai đoạn này.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
