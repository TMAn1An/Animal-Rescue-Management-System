import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PET_TYPES = ["dog", "cat", "bird", "other"] as const;
export const CONDITIONS = ["normal", "moderate", "serious"] as const;
export const STATUSES = ["pending", "assigned", "completed", "cancelled"] as const;
export const EVENT_TYPES = ["created", "assigned", "reassigned", "completed", "cancelled", "reopened", "note"] as const;

export type PetType = (typeof PET_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type Status = (typeof STATUSES)[number];
export type EventType = (typeof EVENT_TYPES)[number];

const now = sql`(unixepoch())`;

/** Staff accounts that can sign in to the admin console. */
export const staff = sqliteTable("staff", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

/** People who report animals in need. Created automatically from the public form. */
export const reporters = sqliteTable("reporters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

/** Volunteer rescuers who can be assigned to requests. */
export const rescuers = sqliteTable("rescuers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  nid: text("nid"),
  area: text("area"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

export const requests = sqliteTable(
  "requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Public tracking code, e.g. AR-7K2M9Q */
    code: text("code").notNull().unique(),
    reporterId: integer("reporter_id").notNull().references(() => reporters.id, { onDelete: "cascade" }),
    rescuerId: integer("rescuer_id").references(() => rescuers.id, { onDelete: "set null" }),
    petType: text("pet_type", { enum: PET_TYPES }).notNull(),
    condition: text("condition", { enum: CONDITIONS }).notNull(),
    area: text("area").notNull(),
    address: text("address").notNull(),
    description: text("description").notNull(),
    note: text("note"),
    donationAmount: real("donation_amount"),
    /** Optional JPEG data URL (resized in the browser, ≤ ~400 KB). */
    photo: text("photo"),
    /** Optional GPS coordinates captured with the browser's location prompt. */
    lat: real("lat"),
    lng: real("lng"),
    status: text("status", { enum: STATUSES }).notNull().default("pending"),
    eta: integer("eta", { mode: "timestamp" }),
    assignedAt: integer("assigned_at", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    outcome: text("outcome"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [
    index("requests_status_idx").on(t.status),
    index("requests_reporter_idx").on(t.reporterId),
    index("requests_rescuer_idx").on(t.rescuerId),
    index("requests_created_idx").on(t.createdAt),
  ],
);

/** Append-only timeline shown on the public tracking page and the admin detail view. */
export const requestEvents = sqliteTable(
  "request_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: integer("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    type: text("type", { enum: EVENT_TYPES }).notNull(),
    message: text("message"),
    actorId: integer("actor_id").references(() => staff.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [index("events_request_idx").on(t.requestId)],
);

export const requestsRelations = relations(requests, ({ one, many }) => ({
  reporter: one(reporters, { fields: [requests.reporterId], references: [reporters.id] }),
  rescuer: one(rescuers, { fields: [requests.rescuerId], references: [rescuers.id] }),
  events: many(requestEvents),
}));
export const reportersRelations = relations(reporters, ({ many }) => ({ requests: many(requests) }));
export const rescuersRelations = relations(rescuers, ({ many }) => ({ requests: many(requests) }));
export const eventsRelations = relations(requestEvents, ({ one }) => ({
  request: one(requests, { fields: [requestEvents.requestId], references: [requests.id] }),
  actor: one(staff, { fields: [requestEvents.actorId], references: [staff.id] }),
}));
