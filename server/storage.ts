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
  CompleteRide
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  updateUserRating(userId: number, rating: number): Promise<User>;
  incrementUserRides(userId: number): Promise<User>;
  
  // Driver methods
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  createDriver(driver: { userId: number, vehicle: string, licensePlate: string }): Promise<Driver>;
  getAvailableDrivers(): Promise<Driver[]>;
  
  // Ride methods
  getRide(id: number): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRideStatus(id: number, status: string): Promise<Ride>;
  assignDriverToRide(rideId: number, driverId: number): Promise<Ride>;
  completeRide(id: number, rating?: number): Promise<Ride>;
  getRidesForUser(userId: number, limit?: number): Promise<RideHistory[]>;
  getActiveRide(rideId: number): Promise<ActiveRide | undefined>;
  getCompleteRide(rideId: number): Promise<CompleteRide | undefined>;
  
  // Achievement methods
  getAchievement(id: number): Promise<Achievement | undefined>;
  getRecentAchievements(userId: number, limit?: number): Promise<Achievement[]>;
  getAllAchievements(userId: number): Promise<Achievement[]>;
  awardAchievement(userId: number, achievementId: number): Promise<void>;
  getAchievementForRide(rideId: number): Promise<Achievement | undefined>;
  
  // Badge methods
  getBadge(id: number): Promise<Badge | undefined>;
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(userId: number, badgeId: number): Promise<void>;
  
  // Leaderboard methods
  getLeaderboard(limit?: number): Promise<LeaderboardUser[]>;
  getUserRank(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drivers: Map<number, Driver>;
  private rides: Map<number, Ride>;
  private achievements: Map<number, Achievement>;
  private badges: Map<number, Badge>;
  private userAchievements: Map<string, { userId: number, achievementId: number, awardedAt: Date }>;
  private userBadges: Map<string, { userId: number, badgeId: number, awardedAt: Date }>;
  
  private currentUserId: number;
  private currentDriverId: number;
  private currentRideId: number;
  private currentAchievementId: number;
  private currentBadgeId: number;
  
  constructor() {
    this.users = new Map();
    this.drivers = new Map();
    this.rides = new Map();
    this.achievements = new Map();
    this.badges = new Map();
    this.userAchievements = new Map();
    this.userBadges = new Map();
    
    this.currentUserId = 1;
    this.currentDriverId = 1;
    this.currentRideId = 1;
    this.currentAchievementId = 1;
    this.currentBadgeId = 1;
    
    // Initialize some example data
    this.initializeData();
  }
  
  private initializeData() {
    // Create achievements
    const achievements: Partial<Achievement>[] = [
      {
        title: "5-Star Rider",
        description: "Received 5 stars on 10 consecutive rides",
        type: "star",
        pointsAwarded: 100,
        requirementType: "consecutive_ratings",
        requirementValue: 10
      },
      {
        title: "Early Bird",
        description: "Always on time for your rides",
        type: "check",
        pointsAwarded: 50,
        requirementType: "on_time",
        requirementValue: 5
      },
      {
        title: "Night Owl",
        description: "Complete 5 rides after 9pm",
        type: "shield",
        pointsAwarded: 75,
        requirementType: "night_rides",
        requirementValue: 5
      },
      {
        title: "Loyal Rider",
        description: "Complete 20 rides",
        type: "award",
        pointsAwarded: 100,
        requirementType: "total_rides",
        requirementValue: 20
      }
    ];
    
    achievements.forEach(achievement => {
      this.createAchievement(achievement as Achievement);
    });
    
    // Create badges
    const badges: Partial<Badge>[] = [
      { name: "5-Star Rider", description: "Maintained a 5-star rating", type: "star" },
      { name: "Early Bird", description: "Always on time", type: "check" },
      { name: "Loyal Rider", description: "Completed 20+ rides", type: "award" },
      { name: "Night Owl", description: "Frequent night rider", type: "shield" }
    ];
    
    badges.forEach(badge => {
      this.createBadge(badge as Badge);
    });
    
    // Create example users and drivers
    this.createUser({
      username: "john_doe",
      password: "password123",
      name: "John Doe",
      email: "john@example.com",
      isDriver: false
    });
    
    const driver1 = this.createUser({
      username: "michael_t",
      password: "password456",
      name: "Michael T.",
      email: "michael@example.com",
      isDriver: true
    });
    
    this.createDriver({
      userId: driver1.id,
      vehicle: "Toyota Camry",
      licensePlate: "ABC-1234"
    });
    
    // Create example leaderboard users
    this.createUser({
      username: "sarah_m",
      password: "password789",
      name: "Sarah M.",
      email: "sarah@example.com",
      isDriver: false
    });
    
    this.createUser({
      username: "robert_j",
      password: "password101",
      name: "Robert J.",
      email: "robert@example.com",
      isDriver: false
    });
    
    this.createUser({
      username: "amy_l",
      password: "password202",
      name: "Amy L.",
      email: "amy@example.com",
      isDriver: false
    });
    
    // Update points for leaderboard
    this.updateUserPoints(2, 3240);
    this.updateUserPoints(3, 3105);
    this.updateUserPoints(4, 2980);
    this.updateUserPoints(1, 2450);
    
    // Update ratings for users
    this.users.forEach((user, id) => {
      const randomRating = 4.8 + Math.random() * 0.2;
      this.updateUserRating(id, randomRating);
    });
    
    // Set leaderboard ranks based on points
    const usersByPoints = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points);
      
    usersByPoints.forEach((user, index) => {
      user.leaderboardRank = index + 1;
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      profilePicture: undefined,
      rating: 5.0,
      level: 1,
      points: 0,
      totalRides: 0,
      leaderboardRank: 99,
      notifications: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.points += points;
    
    // Level up if enough points (1000 points per level)
    const newLevel = Math.floor(user.points / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    // Update leaderboard ranks for all users
    const usersByPoints = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points);
      
    usersByPoints.forEach((u, index) => {
      u.leaderboardRank = index + 1;
    });
    
    return user;
  }
  
  async updateUserRating(userId: number, rating: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Calculate new average rating
    const totalRides = user.totalRides || 1;
    const currentRating = user.rating || 5.0;
    
    // Weighted average formula
    const newRating = (currentRating * (totalRides - 1) + rating) / totalRides;
    user.rating = parseFloat(newRating.toFixed(2));
    
    return user;
  }
  
  async incrementUserRides(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.totalRides += 1;
    return user;
  }
  
  // Driver methods
  async getDriver(id: number): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const user = await this.getUser(driver.userId);
    if (!user) return undefined;
    
    return {
      ...driver,
      name: user.name,
      rating: user.rating,
      level: user.level,
      totalRides: user.totalRides,
      profilePicture: user.profilePicture
    };
  }
  
  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const driver = Array.from(this.drivers.values()).find(
      (driver) => driver.userId === userId
    );
    
    if (!driver) return undefined;
    
    const user = await this.getUser(driver.userId);
    if (!user) return undefined;
    
    return {
      ...driver,
      name: user.name,
      rating: user.rating,
      level: user.level,
      totalRides: user.totalRides,
      profilePicture: user.profilePicture
    };
  }
  
  async createDriver(driver: { userId: number, vehicle: string, licensePlate: string }): Promise<Driver> {
    const id = this.currentDriverId++;
    const newDriver: Driver = {
      ...driver,
      id,
      isActive: true,
      latitude: undefined,
      longitude: undefined,
      createdAt: new Date(),
      name: "",
      rating: 5.0,
      level: 1,
      totalRides: 0
    };
    
    // Add driver info
    const user = await this.getUser(driver.userId);
    if (user) {
      newDriver.name = user.name;
      newDriver.rating = user.rating;
      newDriver.level = user.level;
      newDriver.totalRides = user.totalRides;
      newDriver.profilePicture = user.profilePicture;
    }
    
    this.drivers.set(id, newDriver);
    return newDriver;
  }
  
  async getAvailableDrivers(): Promise<Driver[]> {
    const availableDrivers = Array.from(this.drivers.values())
      .filter(driver => driver.isActive);
    
    // Enrich driver data with user info
    const enrichedDrivers: Driver[] = [];
    
    for (const driver of availableDrivers) {
      const user = await this.getUser(driver.userId);
      if (user) {
        enrichedDrivers.push({
          ...driver,
          name: user.name,
          rating: user.rating,
          level: user.level,
          totalRides: user.totalRides,
          profilePicture: user.profilePicture
        });
      }
    }
    
    return enrichedDrivers;
  }
  
  // Ride methods
  async getRide(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }
  
  async createRide(ride: InsertRide): Promise<Ride> {
    const id = this.currentRideId++;
    
    // Calculate fare if not provided
    const calculatedFare = ride.fare || (10 + Math.random() * 15); // Random fare between $10-$25
    
    const newRide: Ride = {
      ...ride,
      id,
      driverId: undefined,
      status: "requested",
      fare: calculatedFare,
      distance: 2 + Math.random() * 8, // Random distance between 2-10 miles
      duration: 5 + Math.floor(Math.random() * 25), // Random duration between 5-30 minutes
      rating: undefined,
      pointsEarned: 0,
      vehicleType: ride.vehicleType || "standard",
      paymentMethod: ride.paymentMethod || "cash",
      splitFare: ride.splitFare || false,
      splitWith: ride.splitWith || [],
      createdAt: new Date(),
      completedAt: undefined
    };
    this.rides.set(id, newRide);
    return newRide;
  }
  
  async updateRideStatus(id: number, status: string): Promise<Ride> {
    const ride = await this.getRide(id);
    if (!ride) throw new Error("Ride not found");
    
    ride.status = status;
    
    if (status === "completed" && !ride.completedAt) {
      ride.completedAt = new Date();
      
      // Award points to rider
      const pointsEarned = 20 + Math.floor(Math.random() * 25); // Base points + random bonus
      ride.pointsEarned = pointsEarned;
      
      await this.updateUserPoints(ride.riderId, pointsEarned);
      await this.incrementUserRides(ride.riderId);
    }
    
    return ride;
  }
  
  async assignDriverToRide(rideId: number, driverId: number): Promise<Ride> {
    const ride = await this.getRide(rideId);
    if (!ride) throw new Error("Ride not found");
    
    ride.driverId = driverId;
    ride.status = "accepted";
    
    return ride;
  }
  
  async completeRide(id: number, rating?: number): Promise<Ride> {
    const ride = await this.getRide(id);
    if (!ride) throw new Error("Ride not found");
    
    ride.status = "completed";
    ride.completedAt = new Date();
    
    if (rating) {
      ride.rating = rating;
      
      // Update driver's rating if available
      if (ride.driverId) {
        const driver = await this.getDriver(ride.driverId);
        if (driver) {
          await this.updateUserRating(driver.userId, rating);
        }
      }
      
      // Award additional points for rating
      await this.updateUserPoints(ride.riderId, 5);
    }
    
    return ride;
  }
  
  async getRidesForUser(userId: number, limit: number = 10): Promise<RideHistory[]> {
    const userRides = Array.from(this.rides.values())
      .filter(ride => ride.riderId === userId && ride.status === "completed")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    const rideHistory: RideHistory[] = [];
    
    for (const ride of userRides) {
      let driverName = "Unknown Driver";
      let driverRating = 5.0;
      let driverPicture = undefined;
      
      if (ride.driverId) {
        const driver = await this.getDriver(ride.driverId);
        if (driver) {
          driverName = driver.name;
          driverRating = driver.rating;
          driverPicture = driver.profilePicture;
        }
      }
      
      rideHistory.push({
        id: ride.id,
        pickupLocation: ride.pickupLocation,
        destination: ride.destination,
        fare: ride.fare,
        pointsEarned: ride.pointsEarned,
        completedAt: ride.completedAt?.toISOString() || new Date().toISOString(),
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
    
    // Only return active rides
    if (ride.status === "completed") return undefined;
    
    // Calculate estimated time remaining
    const minutesRemaining = Math.max(1, Math.floor(Math.random() * 15));
    
    // Generate mock current location (would be real GPS in production)
    const currentLocation = {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.01
    };
    
    return {
      id: ride.id,
      driverId: ride.driverId || 0,
      status: ride.status === "accepted" ? "On the way to destination" : ride.status,
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      fare: ride.fare,
      estimatedTimeRemaining: `${minutesRemaining} min`,
      potentialPoints: 20 + Math.floor(Math.random() * 10), // Estimate potential points
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
      currentLocation: currentLocation,
      splitFare: ride.splitFare,
      splitWith: ride.splitWith
    };
  }
  
  async getCompleteRide(rideId: number): Promise<CompleteRide | undefined> {
    const ride = await this.getRide(rideId);
    if (!ride || ride.status !== "completed") return undefined;
    
    return {
      id: ride.id,
      fare: ride.fare,
      pointsEarned: ride.pointsEarned,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod
    };
  }
  
  // Achievement methods
  private createAchievement(achievement: Achievement): Achievement {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = {
      ...achievement,
      id,
      createdAt: new Date()
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }
  
  async getRecentAchievements(userId: number, limit: number = 5): Promise<Achievement[]> {
    // Get all achievements
    const allAchievements = Array.from(this.achievements.values());
    
    // Get user achievement IDs
    const userAchievementIds = new Set(
      Array.from(this.userAchievements.values())
        .filter(ua => ua.userId === userId)
        .map(ua => ua.achievementId)
    );
    
    // Filter and sort achievements
    const userAchievements = allAchievements
      .filter(achievement => userAchievementIds.has(achievement.id))
      .map(achievement => ({
        ...achievement,
        achieved: true,
        isNew: true // Mark as new for UI purposes
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userAchievements;
  }
  
  async getAllAchievements(userId: number): Promise<Achievement[]> {
    // Get all achievements
    const allAchievements = Array.from(this.achievements.values());
    
    // Get user achievement IDs
    const userAchievementIds = new Set(
      Array.from(this.userAchievements.values())
        .filter(ua => ua.userId === userId)
        .map(ua => ua.achievementId)
    );
    
    // Map achievements with achieved status
    return allAchievements.map(achievement => ({
      ...achievement,
      achieved: userAchievementIds.has(achievement.id)
    }));
  }
  
  async awardAchievement(userId: number, achievementId: number): Promise<void> {
    const key = `${userId}-${achievementId}`;
    
    // Check if already awarded
    if (this.userAchievements.has(key)) return;
    
    this.userAchievements.set(key, {
      userId,
      achievementId,
      awardedAt: new Date()
    });
    
    // Award points to user
    const achievement = await this.getAchievement(achievementId);
    if (achievement) {
      await this.updateUserPoints(userId, achievement.pointsAwarded);
    }
  }
  
  async getAchievementForRide(rideId: number): Promise<Achievement | undefined> {
    // Simulate unlocking an achievement based on the ride
    const ride = await this.getRide(rideId);
    if (!ride || ride.status !== "completed") return undefined;
    
    const userId = ride.riderId;
    const userRides = Array.from(this.rides.values())
      .filter(r => r.riderId === userId && r.status === "completed");
    
    // Check for achievements based on total rides
    const achievements = Array.from(this.achievements.values());
    for (const achievement of achievements) {
      if (achievement.requirementType === "total_rides" && 
          userRides.length >= achievement.requirementValue) {
        
        // Check if already awarded
        const key = `${userId}-${achievement.id}`;
        if (!this.userAchievements.has(key)) {
          // Award achievement
          await this.awardAchievement(userId, achievement.id);
          return { ...achievement, isNew: true };
        }
      }
      
      // Night rides achievement (simulated)
      if (achievement.requirementType === "night_rides" && 
          Math.random() > 0.7) { // 30% chance to trigger
          
        // Check if already awarded
        const key = `${userId}-${achievement.id}`;
        if (!this.userAchievements.has(key)) {
          // Award achievement
          await this.awardAchievement(userId, achievement.id);
          return { ...achievement, isNew: true };
        }
      }
    }
    
    return undefined;
  }
  
  // Badge methods
  private createBadge(badge: Badge): Badge {
    const id = this.currentBadgeId++;
    const newBadge: Badge = {
      ...badge,
      id,
      createdAt: new Date()
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }
  
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async getUserBadges(userId: number): Promise<Badge[]> {
    // Get badge IDs awarded to user
    const userBadgeIds = Array.from(this.userBadges.values())
      .filter(ub => ub.userId === userId)
      .map(ub => ub.badgeId);
    
    // Get badge objects
    const badges = userBadgeIds.map(id => this.badges.get(id))
      .filter((badge): badge is Badge => !!badge);
    
    return badges;
  }
  
  async awardBadge(userId: number, badgeId: number): Promise<void> {
    const key = `${userId}-${badgeId}`;
    
    // Check if already awarded
    if (this.userBadges.has(key)) return;
    
    this.userBadges.set(key, {
      userId,
      badgeId,
      awardedAt: new Date()
    });
  }
  
  // Leaderboard methods
  async getLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
    const users = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      initials: user.name.split(' ').map(n => n[0]).join(''),
      points: user.points,
      rating: user.rating,
      level: user.level
    }));
  }
  
  async getUserRank(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 99;
    
    return user.leaderboardRank;
  }
}

export const storage = new MemStorage();
