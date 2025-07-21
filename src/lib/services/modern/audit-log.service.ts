import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import { AuditLogEntry, AuditLogParams } from "@/lib/types/audit-log.types";

// Helper to convert Vietnamese day names to English for robust parsing
const vietnameseToEnglishDays: { [key: string]: string } = {
  'Chủ Nhật': 'Sunday',
  'Thứ Hai': 'Monday',
  'Thứ Ba': 'Tuesday',
  'Thứ Tư': 'Wednesday',
  'Thứ Năm': 'Thursday',
  'Thứ Sáu': 'Friday',
  'Thứ Bảy': 'Saturday',
};

// Helper function to parse the custom Vietnamese date format
function parseVietnameseTimestamp(timestamp: string): string {
  if (!timestamp || typeof timestamp !== 'string') {
    return new Date().toISOString(); // Return a valid fallback
  }
  try {
    // Attempt direct parsing if it's already a valid ISO string
    const directDate = new Date(timestamp);
    if (!isNaN(directDate.getTime())) {
      return directDate.toISOString();
    }

    // Example: "Thứ Năm, 17 tháng 7, 2025, 08:44"
    let parsableString = timestamp
      .replace(/tháng (\d+)/, (match, month) => `${month}`) // "tháng 7" -> "7"
      .replace(/,(\s\d{2}:\d{2})$/, ' $1'); // ", 08:44" -> " 08:44"
    
    // Replace Vietnamese day name with English
    for (const [vi, en] of Object.entries(vietnameseToEnglishDays)) {
        if(parsableString.startsWith(vi)) {
            parsableString = parsableString.replace(vi, en);
            break;
        }
    }
    
    // Reformat to a more standard format like "YYYY-MM-DDTHH:mm:ss"
    const parts = parsableString.split(/[ ,]+/);
    if (parts.length >= 5) {
      const year = parts[3];
      const month = parts[2].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const time = parts[4];
      const isoString = `${year}-${month}-${day}T${time}:00`;
      
      const date = new Date(isoString);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  } catch (e) {
    console.error(`Failed to parse custom timestamp "${timestamp}"`, e);
  }
  
  // Final fallback
  return new Date().toISOString();
}

export class AuditLogService extends BaseService<AuditLogEntry> {
  constructor() {
    super(API_CONFIG.endpoints.auditLog.base);
  }

  async getCourseAuditLog(
    courseId: string,
    params?: AuditLogParams
  ): Promise<AuditLogEntry[]> {
    const queryParams: Record<string, any> = {
      courseId,
      ...params,
    };

    const response = await this.get<AuditLogEntry[]>(
      API_CONFIG.endpoints.auditLog.course,
      { params: queryParams }
    );
    
    return (Array.isArray(response) ? response : []).map(entry => {
        // Find a reliable ISO date from changedFields or addedFields as a priority
        const createdAtField = entry.addedFields.find(f => f.fieldName === 'CreatedAt');
        const updatedAtField = entry.changedFields.find(f => f.fieldName === 'UpdatedAt' || f.fieldName === 'ModifiedAt');

        let reliableTimestamp = '';
        if (updatedAtField && updatedAtField.newValue) {
          reliableTimestamp = new Date(updatedAtField.newValue).toISOString();
        } else if (createdAtField && createdAtField.value) {
           reliableTimestamp = new Date(createdAtField.value).toISOString();
        }

        return {
            ...entry,
            // Use the reliable timestamp if found, otherwise parse the custom one
            timestamp: reliableTimestamp || parseVietnameseTimestamp(entry.timestamp),
        }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUserAuditLog(
    userId: string,
    params?: AuditLogParams
  ): Promise<AuditLogEntry[]> {
    const queryParams = {
      userId,
      ...params,
    };
    
    const response = await this.get<AuditLogEntry[]>(
        API_CONFIG.endpoints.auditLog.user, { params: queryParams }
    );
    
    return Array.isArray(response) ? response : [];
  }

  async getAuditLog(params?: AuditLogParams): Promise<AuditLogEntry[]> {
     const response = await this.get<AuditLogEntry[]>(
        API_CONFIG.endpoints.auditLog.base, { params }
    );
    return Array.isArray(response) ? response : [];
  }
}

export const auditLogService = new AuditLogService();
export default auditLogService;
