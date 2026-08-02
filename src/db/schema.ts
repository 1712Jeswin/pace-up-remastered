import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  index,
  uniqueIndex,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enable pgvector extension when migrating if needed:
// CREATE EXTENSION IF NOT EXISTS vector;

// Better Auth required tables + Paceup custom fields (handle)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  handle: varchar("handle", { length: 30 }).unique(),
}, (table) => [
  // Case-insensitive uniqueness — prevents "Jeswin" and "jeswin" from coexisting.
  // Handle lookups use LOWER() to match against this index.
  uniqueIndex("user_handle_lower_idx").on(sql`LOWER(${table.handle})`),
]);

// ─── Global User Profile ──────────────────────────────────────────────────────

export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Global skillset default for the user
  skills: jsonb("skills").$type<{ name: string; confidence: "Comfortable" | "Learning" }[]>(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// ─── Project enums ────────────────────────────────────────────────────────────

export const projectTypeEnum = pgEnum("project_type", [
  "Hackathon",
  "Final-Year Project",
  "Coursework",
  "Club Project",
  "Research",
]);

export const projectRoleEnum = pgEnum("project_role", ["owner", "member"]);

export const projectRolePreferenceEnum = pgEnum("project_role_preference", [
  "Frontend",
  "Backend",
  "Design",
  "Research",
  "PM-ish",
  "Flexible",
]);

// ─── Project ─────────────────────────────────────────────────────────────────

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 120 }).notNull(),
    type: projectTypeEnum("type").notNull(),
    // 0-100 integer representing task completion percentage
    progress: integer("progress").notNull().default(0),
    deadline: timestamp("deadline"),
    // Soft-archive: not deleted, hidden from the active grid
    archivedAt: timestamp("archivedAt"),
    lastActiveAt: timestamp("lastActiveAt").notNull(),
    ownerId: text("ownerId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [
    // "All projects where ownerId = X" - used by the owned-by-me filter
    index("project_owner_idx").on(table.ownerId),
    // Default sort: recently active
    index("project_last_active_idx").on(table.lastActiveAt),
    // Archived filter
    index("project_archived_idx").on(table.archivedAt),
  ]
);

// ─── Project Member ───────────────────────────────────────────────────────────

export const projectMember = pgTable(
  "project_member",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: projectRoleEnum("role").notNull().default("member"),
    
    // Project-specific profile setup
    skills: jsonb("skills").$type<{ name: string; confidence: "Comfortable" | "Learning" }[]>(),
    rolePreference: projectRolePreferenceEnum("rolePreference"),
    interests: text("interests"),
    weeklyHours: integer("weeklyHours"),
    otherProjects: boolean("otherProjects").default(false),
    timezone: text("timezone"),
    
    joinedAt: timestamp("joinedAt").notNull(),
  },
  (table) => [
    // "All members of project X" - used for avatar clusters on the card
    index("project_member_project_idx").on(table.projectId),
    // "All projects user Y is in" - used by the hub member filter
    index("project_member_user_idx").on(table.userId),
    // A user can only appear once per project
    uniqueIndex("project_member_unique_idx").on(table.projectId, table.userId),
  ]
);

// ─── Project Invite ───────────────────────────────────────────────────────────

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

export const projectInvite = pgTable(
  "project_invite",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    // Invited user - null if link-based invite not yet claimed
    inviteeId: text("inviteeId").references(() => user.id, { onDelete: "set null" }),
    invitedByUserId: text("invitedByUserId")
      .notNull()
      .references(() => user.id),
    // Short code for manual entry; token for link-based invites
    code: varchar("code", { length: 16 }).unique(),
    token: text("token").unique(),
    status: inviteStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    // Pending invites for a given user - shown in hub banner
    index("project_invite_invitee_idx").on(table.inviteeId),
    index("project_invite_project_idx").on(table.projectId),
  ]
);

// ─── AI Provider Key ──────────────────────────────────────────────────────────

export const aiProviderEnum = pgEnum("ai_provider", [
  "gemini",
  "openai",
  "anthropic",
  "openrouter",
  "groq",
]);

export const keyPolicyEnum = pgEnum("key_policy", [
  // The project owner's key is used for all AI calls in this project
  "owner_key",
  // Each member must connect their own key
  "per_member_key",
]);

/**
 * Stores an encrypted AI provider API key for a user+project combination.
 * The key is AES-256-GCM envelope-encrypted server-side and NEVER returned
 * to the client in plaintext. Once saved, the UI shows only "Key saved ✓".
 *
 * Policy: either the owner's key is shared (owner_key) or each member
 * must supply their own (per_member_key). Stored per (projectId, userId).
 */
export const projectApiKey = pgTable(
  "project_api_key",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: aiProviderEnum("provider").notNull(),
    // Envelope-encrypted ciphertext: iv:authTag:encDataKey:iv2:authTag2:ciphertext (hex, colon-delimited)
    encryptedKey: text("encryptedKey").notNull(),
    policy: keyPolicyEnum("policy").notNull().default("owner_key"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [
    // One key per user per project per provider
    uniqueIndex("project_api_key_unique_idx").on(table.projectId, table.userId, table.provider),
    // "All keys for project X" — used when determining which members have connected
    index("project_api_key_project_idx").on(table.projectId),
  ]
);
