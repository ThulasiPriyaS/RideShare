import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  profilePicture: text("profile_picture"),
  isDriver: boolean("is_driver").default(false),
  rating: doublePrecision("rating").default(5.0),
  level: integer("level").default(1),
  points: integer("points").default(0),
  totalRides: integer("total_rides").default(0),
  leaderboardRank: integer("leaderboard_rank").default(99),
  notifications: integer("notifications").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Drivers table
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicle: text("vehicle").notNull(),
  licensePlate: text("license_plate").notNull(),
  isActive: boolean("is_active").default(true),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rides table
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  riderId: integer("rider_id").notNull(),
  driverId: integer("driver_id"),
  pickupLocation: text("pickup_location").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("requested"),
  fare: doublePrecision("fare").default(0),
  distance: doublePrecision("distance").default(0),
  duration: integer("duration").default(0),
  rating: integer("rating"),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("award"),
  pointsAwarded: integer("points_awarded").notNull(),
  requirementType: text("requirement_type").notNull(),
  requirementValue: integer("requirement_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements table (many-to-many)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("award"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges table (many-to-many)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  isDriver: true,
});

export const insertDriverSchema = createInsertSchema(drivers).pick({
  userId: true,
  vehicle: true,
  licensePlate: true,
});

export const insertRideSchema = createInsertSchema(rides).pick({
  riderId: true,
  pickupLocation: true,
  destination: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  title: true,
  description: true,
  type: true,
  pointsAwarded: true,
  requirementType: true,
  requirementValue: true,
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  type: true,
});

// Types for frontend use
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Driver = typeof drivers.$inferSelect & {
  name: string;
  rating: number;
  level: number;
  totalRides: number;
  profilePicture?: string;
};

export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;

export type Achievement = typeof achievements.$inferSelect & {
  achieved?: boolean;
  isNew?: boolean;
};

export type Badge = typeof badges.$inferSelect;

// Additional types for UI components
export type ActiveRide = {
  id: number;
  driverId: number;
  status: string;
  pickupLocation: string;
  destination: string;
  fare: number;
  estimatedTimeRemaining: string;
  potentialPoints: number;
};

export type CompleteRide = {
  id: number;
  fare: number;
  pointsEarned: number;
  achievementUnlocked?: number;
};

export type LeaderboardUser = {
  id: number;
  name: string;
  initials: string;
  points: number;
  rating: number;
  level: number;
};

export type RideHistory = {
  id: number;
  pickupLocation: string;
  destination: string;
  fare: number;
  pointsEarned: number;
  completedAt: string;
  driverName: string;
  driverRating: number;
  driverPicture?: string;
};
