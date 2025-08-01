"use client";

import { getAdminCourseColumns } from "@/components/courses/columns";

// This file now re-exports the centralized column definition function
// to maintain the original import path for the admin page.
export { getAdminCourseColumns as getColumns };
