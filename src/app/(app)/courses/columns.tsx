"use client";

import { getUserCourseColumns } from "@/components/courses/columns";

// This file now re-exports the centralized column definition function
// to maintain the original import path for the user-facing courses page.
export { getUserCourseColumns as getColumns };
