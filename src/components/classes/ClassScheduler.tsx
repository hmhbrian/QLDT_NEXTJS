'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { scheduleClass, type ScheduleClassInput, type ScheduleClassOutput } from '@/ai/flows/schedule-class';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, CalendarCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const scheduleClassSchema = z.object({
  className: z.string().min(3, { message: 'Tên lớp học phải có ít nhất 3 ký tự.' }),
  instructorAvailability: z.string().min(10, { message: 'Thông tin lịch trống của giảng viên là bắt buộc.' }),
  classroomAvailability: z.string().min(10, { message: 'Thông tin lịch trống của phòng học là bắt buộc.' }),
  classDuration: z.string().min(1, { message: 'Thời lượng lớp học là bắt buộc (ví dụ: 1 giờ, 90 phút).' }),
  existingSchedule: z.string().min(10, { message: 'Thông tin lịch học hiện tại là bắt buộc.' }),
});

export function ClassScheduler() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScheduleClassOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ScheduleClassInput>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      className: '',
      instructorAvailability: 'Giảng viên A: Thứ 2 9h-17h, Thứ 3 13h-17h; Giảng viên B: Thứ 4 9h-12h, Thứ 6 9h-17h',
      classroomAvailability: 'Phòng 101: Thứ 2-Thứ 6 8h-18h; Phòng 102: Thứ 2, Thứ 4, Thứ 6 8h-18h',
      classDuration: '1.5 giờ',
      existingSchedule: 'Toán 101 (Giảng viên A): Thứ 2 10h-11h30 (Phòng 101); Lý 202 (Giảng viên B): Thứ 4 9h-10h30 (Phòng 102)',
    },
  });

  const onSubmit: SubmitHandler<ScheduleClassInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const output = await scheduleClass(data);
      setResult(output);
      toast({
        title: "Lập lịch thành công",
        description: `Đã nhận được đề xuất cho lớp "${data.className}".`,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Lập lịch thất bại",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-xl md:text-2xl">
          <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6 text-accent" />
          Trình lập lịch AI
        </CardTitle>
        <CardDescription>
          Cung cấp thông tin chi tiết bên dưới và để AI tìm cré créneau phù hợp nhất cho lớp học mới của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên lớp học</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: JavaScript Nâng cao" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instructorAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lịch trống của Giảng viên</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nhập tên giảng viên và các khung giờ trống..." {...field} rows={5} />
                    </FormControl>
                    <FormDescription>Ví dụ: "Nguyễn Văn A: T2 9-12, T4 13-16; Trần Thị B: T3 10-13, T5 14-17"</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classroomAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lịch trống của Phòng học</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nhập tên phòng học và các khung giờ trống..." {...field} rows={5} />
                    </FormControl>
                    <FormDescription>Ví dụ: "Phòng A: T2-T6 8-18; Phòng B: T2,4,6 9-17"</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="classDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng lớp học</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: 1 giờ, 1.5 giờ, 90 phút" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="existingSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lịch học hiện tại</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Liệt kê các lớp học, thời gian, giảng viên và phòng hiện tại..." {...field} rows={6} />
                  </FormControl>
                  <FormDescription>Cung cấp bối cảnh các lớp đã được lên lịch để tránh xung đột.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Tìm lịch tối ưu
            </Button>
          </CardFooter>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="m-4 md:m-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="m-4 md:m-6 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-300 text-lg md:text-xl">
              <CalendarCheck className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Đề xuất Lịch học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Thời gian đề xuất:</h4>
              <p className="text-base md:text-lg">{result.scheduledTime}</p>
            </div>
            <div>
              <h4 className="font-semibold">Phòng học được chỉ định:</h4>
              <p className="text-base md:text-lg">{result.classroom}</p>
            </div>
            <div>
              <h4 className="font-semibold">Lý do của AI:</h4>
              <p className="text-sm text-muted-foreground italic bg-secondary p-3 rounded-md">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
