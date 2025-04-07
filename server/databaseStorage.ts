import { eq, desc, and, asc, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  User,
  InsertUser,
  Driver,
  Ride,
  InsertRide,
  Achievement,
  Badge,
  LeaderboardUser,
  RideHistory,
  ActiveRide,
  CompleteRide,
  users,
  drivers,
  rides,
  achievements,
  badges,
  userAchievements,
  userBadges
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    
    const currentPoints = user.points || 0;
    const newPoints = currentPoints + points;
    
    const [updatedUser] = await db
      .update(users)
      .set({ points: newPoints })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserRating(userId: number, rating: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    
    // Average the ratings
    const currentRating = user.rating || 5;
    const rideCount = user.totalRides || 0;
    const newRating = (currentRating * rideCount + rating) / (rideCount + 1);
    
    const [updatedUser] = await db
      .update(users)
      .set({ rating: newRating })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async incrementUserRides(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    
    const totalRides = (user.totalRides || 0) + 1;
    
    const [updatedUser] = await db
      .update(users)
      .set({ totalRides })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Driver methods
  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    
    if (!driver) return undefined;
    
    const user = await this.getUser(driver.userId);
    if (!user) return undefined;
    
    return {
      ...driver,
      name: user.name,
      rating: user.rating || 5,
      level: user.level || 1,
      totalRides: user.totalRides || 0,
      profilePicture: user.profilePicture || undefined
    };
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    
    if (!driver) return undefined;
    
    const user = await this.getUser(driver.userId);
    if (!user) return undefined;
    
    return {
      ...driver,
      name: user.name,
      rating: user.rating || 5,
      level: user.level || 1,
      totalRides: user.totalRides || 0,
      profilePicture: user.profilePicture || undefined
    };
  }

  async createDriver(driver: { userId: number, vehicle: string, licensePlate: string }): Promise<Driver> {
    const [newDriver] = await db.insert(drivers).values(driver).returning();
    
    const user = await this.getUser(driver.userId);
    if (!user) throw new Error(`User ${driver.userId} not found`);
    
    await db.update(users).set({ isDriver: true }).where(eq(users.id, driver.userId));
    
    return {
      ...newDriver,
      name: user.name,
      rating: user.rating || 5,
      level: user.level || 1,
      totalRides: user.totalRides || 0,
      profilePicture: user.profilePicture || undefined
    };
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(eq(drivers.isActive, true));
    
    const driverResults: Driver[] = [];
    
    for (const driver of availableDrivers) {
      const user = await this.getUser(driver.userId);
      if (user) {
        driverResults.push({
          ...driver,
          name: user.name,
          rating: user.rating || 5,
          level: user.level || 1,
          totalRides: user.totalRides || 0,
          profilePicture: user.profilePicture || undefined
        });
      }
    }
    
    // Sort by rating (Higher rated drivers first)
    return driverResults.sort((a, b) => b.rating - a.rating);
  }

  // Ride methods
  async getRide(id: number): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride;
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const [newRide] = await db.insert(rides).values(ride).returning();
    return newRide;
  }

  async updateRideStatus(id: number, status: string): Promise<Ride> {
    const [updatedRide] = await db
      .update(rides)
      .set({ status })
      .where(eq(rides.id, id))
      .returning();
    
    return updatedRide;
  }

  async assignDriverToRide(rideId: number, driverId: number): Promise<Ride> {
    // Get the driver to check rating
    const driver = await this.getDriver(driverId);
    if (!driver) throw new Error(`Driver ${driverId} not found`);
    
    // Update the ride with the driver ID
    const [updatedRide] = await db
      .update(rides)
      .set({ driverId })
      .where(eq(rides.id, rideId))
      .returning();
    
    return updatedRide;
  }

  async completeRide(id: number, rating?: number): Promise<Ride> {
    const ride = await this.getRide(id);
    if (!ride) throw new Error(`Ride ${id} not found`);
    
    // Calculate points earned - base on fare and rating
    const pointsEarned = Math.round((ride.fare || 0) * (rating ? rating / 3 : 1));
    
    let updates: Partial<Ride> = {
      status: "completed",
      completedAt: new Date(),
      rating,
      pointsEarned
    };
    
    // Update the ride
    const [updatedRide] = await db
      .update(rides)
      .set(updates)
      .where(eq(rides.id, id))
      .returning();
    
    // Award points to the rider
    if (pointsEarned > 0) {
      await this.updateUserPoints(ride.riderId, pointsEarned);
    }
    
    // If there's a driver and rating, update their rating
    if (ride.driverId && rating) {
      const driver = await this.getDriver(ride.driverId);
      if (driver) {
        await this.updateUserRating(driver.userId, rating);
        await this.incrementUserRides(driver.userId);
      }
    }
    
    // Also update rider's ride count
    await this.incrementUserRides(ride.riderId);
    
    return updatedRide;
  }

  async getRidesForUser(userId: number, limit: number = 10): Promise<RideHistory[]> {
    const userRides = await db
      .select()
      .from(rides)
      .where(or(
        eq(rides.riderId, userId),
        eq(rides.driverId, userId)
      ))
      .orderBy(desc(rides.createdAt))
      .limit(limit);
    
    const rideHistory: RideHistory[] = [];
    
    for (const ride of userRides) {
      // For rides where the user was the rider, get driver info
      // For rides where the user was the driver, we'll show "You" as driver
      let driverName = "Unknown Driver";
      let driverRating = 5;
      let driverPicture = undefined;
      
      if (ride.driverId && ride.riderId === userId) {
        const driver = await this.getDriver(ride.driverId);
        if (driver) {
          driverName = driver.name;
          driverRating = driver.rating;
          driverPicture = driver.profilePicture;
        }
      } else if (ride.driverId === userId) {
        driverName = "You (Driver)";
        const user = await this.getUser(userId);
        if (user) {
          driverRating = user.rating || 5;
          driverPicture = user.profilePicture || undefined;
        }
      }
      
      rideHistory.push({
        id: ride.id,
        pickupLocation: typeof ride.pickupLocation === 'string' ? ride.pickupLocation : JSON.parse(ride.pickupLocation).name,
        destination: typeof ride.destination === 'string' ? ride.destination : JSON.parse(ride.destination).name,
        fare: ride.fare || 0,
        pointsEarned: ride.pointsEarned || 0,
        completedAt: ride.completedAt?.toISOString() || ride.createdAt?.toISOString() || new Date().toISOString(),
        driverName,
        driverRating,
        driverPicture
      });
    }
    
    return rideHistory;
  }

  async getActiveRide(rideId: number): Promise<ActiveRide | undefined> {
    const ride = await this.getRide(rideId);
    if (!ride) return undefined;
    
    // Only return active ride data if it's in an active state
    if (!['requested', 'accepted', 'in_progress'].includes(ride.status)) return undefined;
    
    // Calculate estimated time remaining - for demo just use a random value
    const estimatedTimeRemaining = `${Math.floor(Math.random() * 10) + 5} min`;
    
    // Calculate potential points
    const potentialPoints = Math.round((ride.fare || 0) * 1.5);
    
    // Current location - for demo use a random offset from pickup
    let currentLocation;
    try {
      const pickup = typeof ride.pickupLocation === 'string' 
        ? JSON.parse(ride.pickupLocation) 
        : ride.pickupLocation;
      
      currentLocation = {
        latitude: pickup.latitude + (Math.random() * 0.01 - 0.005),
        longitude: pickup.longitude + (Math.random() * 0.01 - 0.005)
      };
    } catch (e) {
      // If we can't parse the pickup location, skip the current location
    }
    
    return {
      id: ride.id,
      driverId: ride.driverId || 0,
      status: ride.status,
      pickupLocation: typeof ride.pickupLocation === 'string' ? ride.pickupLocation : JSON.stringify(ride.pickupLocation),
      destination: typeof ride.destination === 'string' ? ride.destination : JSON.stringify(ride.destination),
      fare: ride.fare || 0,
      estimatedTimeRemaining,
      potentialPoints,
      vehicleType: ride.vehicleType || undefined,
      paymentMethod: ride.paymentMethod || undefined,
      currentLocation,
      splitFare: ride.splitFare || false,
      splitWith: ride.splitWith || undefined
    };
  }

  async getCompleteRide(rideId: number): Promise<CompleteRide | undefined> {
    const ride = await this.getRide(rideId);
    if (!ride) return undefined;
    
    // For demo purposes, return a complete ride even if not fully completed
    return {
      id: ride.id,
      fare: ride.fare || 0,
      pointsEarned: ride.pointsEarned || Math.round((ride.fare || 0) * 1.2), // Estimate if not set
      vehicleType: ride.vehicleType || undefined,
      paymentMethod: ride.paymentMethod || undefined
    };
  }

  async confirmRiderCompletedRide(rideId: number): Promise<Ride> {
    const [updatedRide] = await db
      .update(rides)
      .set({ riderCompletedRide: true })
      .where(eq(rides.id, rideId))
      .returning();
    
    return updatedRide;
  }

  async confirmDriverCompletedRide(rideId: number): Promise<Ride> {
    const [updatedRide] = await db
      .update(rides)
      .set({ driverCompletedRide: true })
      .where(eq(rides.id, rideId))
      .returning();
    
    return updatedRide;
  }

  async checkBothCompletedRide(rideId: number): Promise<boolean> {
    const ride = await this.getRide(rideId);
    if (!ride) return false;
    
    return ride.riderCompletedRide === true && ride.driverCompletedRide === true;
  }

  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async getRecentAchievements(userId: number, limit: number = 5): Promise<Achievement[]> {
    const recentUserAchievements = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.awardedAt))
      .limit(limit);
    
    const achievementList: Achievement[] = [];
    
    for (const ua of recentUserAchievements) {
      const achievement = await this.getAchievement(ua.achievementId);
      if (achievement) {
        achievementList.push({
          ...achievement,
          achieved: true,
          isNew: ua.awardedAt && (new Date().getTime() - ua.awardedAt.getTime() < 24 * 60 * 60 * 1000) // Is new if less than 24 hours old
        });
      }
    }
    
    return achievementList;
  }

  async getAllAchievements(userId: number): Promise<Achievement[]> {
    // Get all achievements
    const allAchievements = await db.select().from(achievements);
    
    // Get user's achievements
    const userAchieved = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    // Map achievement IDs the user has
    const userAchievedIds = new Set(userAchieved.map(ua => ua.achievementId));
    
    // Mark which ones the user has achieved
    return allAchievements.map(achievement => ({
      ...achievement,
      achieved: userAchievedIds.has(achievement.id)
    }));
  }

  async awardAchievement(userId: number, achievementId: number): Promise<void> {
    // Check if already awarded
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
    
    if (existing) return; // Already awarded
    
    // Award the achievement
    await db.insert(userAchievements).values({
      userId,
      achievementId,
      awardedAt: new Date()
    });
    
    // Award points if applicable
    const achievement = await this.getAchievement(achievementId);
    if (achievement && achievement.pointsAwarded) {
      await this.updateUserPoints(userId, achievement.pointsAwarded);
    }
  }

  async getAchievementForRide(rideId: number): Promise<Achievement | undefined> {
    // For demo, return a random achievement if ride exists
    const ride = await this.getRide(rideId);
    if (!ride) return undefined;
    
    const [randomAchievement] = await db
      .select()
      .from(achievements)
      .limit(1);
    
    if (randomAchievement) {
      // Award it to the user if real achievement
      await this.awardAchievement(ride.riderId, randomAchievement.id);
      
      return {
        ...randomAchievement,
        achieved: true,
        isNew: true
      };
    }
    
    return undefined;
  }

  // Badge methods
  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge;
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgeRecords = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    
    const badgeList: Badge[] = [];
    
    for (const ub of userBadgeRecords) {
      const badge = await this.getBadge(ub.badgeId);
      if (badge) {
        badgeList.push(badge);
      }
    }
    
    return badgeList;
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    // Check if already awarded
    const [existing] = await db
      .select()
      .from(userBadges)
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeId)
      ));
    
    if (existing) return; // Already awarded
    
    // Award the badge
    await db.insert(userBadges).values({
      userId,
      badgeId,
      awardedAt: new Date()
    });
  }

  // Leaderboard methods
  async getLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
    const topUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
    
    return topUsers.map(user => {
      // Create initials from name
      const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      return {
        id: user.id,
        name: user.name,
        initials,
        points: user.points || 0,
        rating: user.rating || 5,
        level: user.level || 1
      };
    });
  }

  async getUserRank(userId: number): Promise<number> {
    // Count how many users have more points than this user
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    const userPoints = user.points || 0;
    
    const { count } = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.points} > ${userPoints}`)
      .then(rows => rows[0]);
    
    // Rank is count + 1 (1-indexed)
    return count + 1;
  }
}