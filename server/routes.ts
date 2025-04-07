import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRideSchema } from "@shared/schema";
import { z } from "zod";
import { supabase } from "./supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API endpoints prefixed with /api
  
  // User endpoints
  app.get("/api/user/current", async (req, res) => {
    // For demo, return the first user
    const user = await storage.getUser(1);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Driver endpoints
  app.get("/api/drivers/:id", async (req, res) => {
    const driverId = parseInt(req.params.id);
    const driver = await storage.getDriver(driverId);
    
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json(driver);
  });
  
  app.get("/api/drivers", async (req, res) => {
    const drivers = await storage.getAvailableDrivers();
    res.json(drivers);
  });
  
  // Ride endpoints
  app.post("/api/rides/request", async (req, res) => {
    try {
      // For demo, use the first user as the rider
      const rideData = {
        riderId: 1,
        pickupLocation: req.body.pickupLocation,
        destination: req.body.destination,
        vehicleType: req.body.vehicleType,
        paymentMethod: req.body.paymentMethod,
        fare: req.body.fare,
        splitFare: req.body.splitFare,
        splitWith: req.body.splitWith
      };
      
      const ride = await storage.createRide(rideData);
      
      // Auto-assign the first available driver
      const drivers = await storage.getAvailableDrivers();
      if (drivers.length > 0) {
        await storage.assignDriverToRide(ride.id, drivers[0].id);
      }
      
      res.status(201).json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to request ride" });
    }
  });
  
  app.get("/api/rides/:id", async (req, res) => {
    const rideId = parseInt(req.params.id);
    const activeRide = await storage.getActiveRide(rideId);
    
    if (!activeRide) {
      return res.status(404).json({ message: "Active ride not found" });
    }
    
    res.json(activeRide);
  });
  
  app.get("/api/rides/:id/complete", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    // First try to get an active ride and mark it complete
    const ride = await storage.getRide(rideId);
    if (ride && ride.status !== "completed") {
      await storage.updateRideStatus(rideId, "completed");
    }
    
    const completeRide = await storage.getCompleteRide(rideId);
    
    if (!completeRide) {
      return res.status(404).json({ message: "Completed ride not found" });
    }
    
    res.json(completeRide);
  });
  
  app.post("/api/rides/:id/rate", async (req, res) => {
    const rideId = parseInt(req.params.id);
    const { rating } = req.body;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    try {
      const ride = await storage.completeRide(rideId, rating);
      res.json({ success: true, ride });
    } catch (error) {
      res.status(500).json({ message: "Failed to rate ride" });
    }
  });
  
  app.get("/api/rides/:id/achievement", async (req, res) => {
    const rideId = parseInt(req.params.id);
    const achievement = await storage.getAchievementForRide(rideId);
    
    if (!achievement) {
      return res.status(404).json({ message: "No achievement for this ride" });
    }
    
    res.json(achievement);
  });
  
  // User rides
  app.get("/api/user/rides", async (req, res) => {
    // For demo, use the first user
    const userId = 1;
    const rides = await storage.getRidesForUser(userId);
    res.json(rides);
  });
  
  app.get("/api/users/:id/rides", async (req, res) => {
    const userId = parseInt(req.params.id);
    const rides = await storage.getRidesForUser(userId);
    res.json(rides);
  });
  
  // Achievement endpoints
  app.get("/api/achievements/recent", async (req, res) => {
    // For demo, use the first user
    const userId = 1;
    const achievements = await storage.getRecentAchievements(userId);
    res.json(achievements);
  });
  
  app.get("/api/achievements/all", async (req, res) => {
    // For demo, use the first user
    const userId = 1;
    const achievements = await storage.getAllAchievements(userId);
    res.json(achievements);
  });
  
  // Badge endpoints
  app.get("/api/user/badges", async (req, res) => {
    // For demo, use the first user
    const userId = 1;
    const badges = await storage.getUserBadges(userId);
    res.json(badges);
  });
  
  app.get("/api/users/:id/badges", async (req, res) => {
    const userId = parseInt(req.params.id);
    const badges = await storage.getUserBadges(userId);
    res.json(badges);
  });
  
  // Leaderboard endpoints
  app.get("/api/leaderboard", async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });
  
  // API config endpoints - securely provide credentials to frontend
  app.get("/api/config/googleMapsApiKey", (req, res) => {
    // Only provide the API key, never return the full environment object
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ 
        error: "Google Maps API key not configured", 
        message: "The server doesn't have a Google Maps API key configured."
      });
    }
    
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
  });
  
  app.get("/api/config/supabaseConfig", (req, res) => {
    // Only provide specific config, never return the full environment object
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: "Supabase configuration not complete", 
        message: "The server doesn't have Supabase URL or anon key configured."
      });
    }
    
    res.json({ 
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_ANON_KEY
    });
  });
  
  // Supabase authentication endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Email and password are required"
        });
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return res.status(400).json({ 
          error: "Signup failed", 
          message: error.message
        });
      }
      
      res.json({ 
        message: "Signup successful", 
        user: data.user,
        session: data.session
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ 
        error: "Server error", 
        message: "An unexpected error occurred during signup"
      });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Email and password are required"
        });
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return res.status(400).json({ 
          error: "Login failed", 
          message: error.message
        });
      }
      
      res.json({ 
        message: "Login successful", 
        user: data.user,
        session: data.session
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        error: "Server error", 
        message: "An unexpected error occurred during login"
      });
    }
  });
  
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(400).json({ 
          error: "Logout failed", 
          message: error.message
        });
      }
      
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ 
        error: "Server error", 
        message: "An unexpected error occurred during logout"
      });
    }
  });

  return httpServer;
}
