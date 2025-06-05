import { ClassScheduler } from '@/components/classes/ClassScheduler';

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-headline font-semibold">Quản lý &amp; Lập lịch học</h1>
      <p className="text-muted-foreground">
        Sử dụng trình lập lịch hỗ trợ bởi AI để tìm thời gian tối ưu cho các lớp học mới, xem xét tình trạng sẵn có của giảng viên và phòng học, đồng thời giảm thiểu xung đột.
      </p>
      <ClassScheduler />
    </div>
  );
}
