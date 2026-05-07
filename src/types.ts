/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SystemStatus {
  ONLINE = "ONLINE",
  FAILING = "FAILING",
  MAINTENANCE = "MAINTENANCE",
  OFFLINE = "OFFLINE",
}

export enum UserContext {
  DEEP_WORK = "DEEP_WORK",
  AVAILABLE = "AVAILABLE",
  EMERGENCY = "EMERGENCY",
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "academic" | "personal" | "work";
}

export interface GithubIssue {
  id: string;
  title: string;
  repository: string;
  status: "open" | "closed";
  priority: "high" | "medium" | "low";
  description?: string;
  severity?: "P0" | "P1" | "P2" | "P3";
}

export interface TechnicalManual {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
}
