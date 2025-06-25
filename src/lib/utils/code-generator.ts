/**
 * Utility functions for generating random codes
 */

/**
 * Generate a random code with specified prefix
 * @param prefix - The prefix for the code (e.g., "EMP", "DEPT")
 * @param timestampLength - Number of timestamp digits to use (default: 6)
 * @param randomLength - Number of random digits to use (default: 2)
 * @returns Generated code string
 */
export const generateRandomCode = (
  prefix: string,
  timestampLength: number = 6,
  randomLength: number = 2
): string => {
  const timestamp = Date.now().toString().slice(-timestampLength);
  const random = Math.floor(Math.random() * Math.pow(10, randomLength))
    .toString()
    .padStart(randomLength, "0");
  return `${prefix}${timestamp}${random}`;
};

/**
 * Generate employee ID
 * @returns Employee ID with EMP prefix
 */
export const generateEmployeeId = (): string => {
  return generateRandomCode("EMP", 6, 2);
};

/**
 * Generate department code
 * @returns Department code with DEPT prefix
 */
export const generateDepartmentCode = (): string => {
  return generateRandomCode("DEPT", 6, 2);
};

/**
 * Generate course code
 * @returns Course code with COURSE prefix
 */
export const generateCourseCode = (): string => {
  return generateRandomCode("CRSE", 6, 2);
};
