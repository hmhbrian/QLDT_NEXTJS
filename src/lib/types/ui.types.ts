/**
 * UI and Navigation Types
 * Types related to user interface and navigation
 */

import type { LucideIcon } from "lucide-react";
import type { Role } from "./user.types";

// Navigation item interface
export interface NavItem {
  label: string;
  href?: string; // Optional for group headers
  icon: LucideIcon;
  roles: Role[];
  disabled?: boolean;
  children?: NavItem[]; // For nested sub-menus
}
