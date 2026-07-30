// Shared type for a project card displayed in the Projects Hub.
// This is the shape returned by the server action / API that
// fetches projects for the current user.

export type ProjectType =
  | "Hackathon"
  | "Final-Year Project"
  | "Coursework"
  | "Club Project"
  | "Research";

export type ProjectRole = "owner" | "member";

export interface ProjectMemberAvatar {
  id: string;
  name: string;
  // URL to the user's avatar image; null if not set
  image: string | null;
}

export interface ProjectCardData {
  id: string;
  title: string;
  type: ProjectType;
  // 0-100 integer
  progress: number;
  // null if no deadline set
  deadline: Date | null;
  // null if not archived
  archivedAt: Date | null;
  lastActiveAt: Date;
  role: ProjectRole;
  memberAvatars: ProjectMemberAvatar[];
}

export type SortOption = "lastActive" | "deadline" | "progress" | "alphabetical";
export type FilterOption = "all" | "owned" | "member" | "archived";
