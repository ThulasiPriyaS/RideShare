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
  // Active ride management
  // Define a type for the pending ride
  interface PendingRide {
    id: number;
    riderId: number;
    pickupLocation: string;
    destination: string;
    status: string;
    createdAt: Date;
    fare: number;
    riderRating?: number;
    riderName?: string;
    totalRides?: number;
  }
  
  let pendingRides: PendingRide[] = [];
  
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
      
      // Add to pending rides list with rider information
      const rider = await storage.getUser(ride.riderId);
      pendingRides.push({
        id: ride.id,
        riderId: ride.riderId,
        pickupLocation: ride.pickupLocation,
        destination: ride.destination,
        status: 'pending',
        createdAt: new Date(),
        fare: ride.fare || 12.50, // Fallback fare
        riderRating: rider?.rating || 5, // Include rating for priority
        riderName: rider?.name || "Unknown Rider",
        totalRides: rider?.totalRides || 0
      });
      
      res.status(201).json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to request ride" });
    }
  });
  
  // Get pending rides for drivers
  // Get pending rides with rider ratings for priority-based matching
  app.get("/api/driver/pending-rides", async (req, res) => {
    try {
      // Since we've already embedded rider information when creating the ride request,
      // we can simply sort the existing pending rides by rider rating
      
      // Sort by rider rating (higher rated riders get priority)
      const sortedRides = [...pendingRides].sort((a, b) => 
        (b.riderRating || 5) - (a.riderRating || 5)
      );
      
      res.json(sortedRides);
    } catch (error) {
      console.error("Error fetching pending rides:", error);
      // If there's an error, fall back to the unsorted list
      res.json(pendingRides);
    }
  });
  
  // Driver accepts a ride
  app.post("/api/driver/accept-ride", async (req, res) => {
    const { rideId, driverId } = req.body;
    
    if (!rideId || !driverId) {
      return res.status(400).json({ message: "Missing rideId or driverId" });
    }
    
    try {
      // Find the pending ride
      const pendingRideIndex = pendingRides.findIndex(ride => ride.id === Number(rideId));
      
      if (pendingRideIndex === -1) {
        return res.status(404).json({ message: "Ride not found or already accepted" });
      }
      
      // Get the ride and update storage
      const ride = await storage.getRide(rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found in storage" });
      }
      
      // Get the driver details (for the notification)
      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      
      // Assign driver to ride and update status
      await storage.assignDriverToRide(rideId, driverId);
      const updatedRide = await storage.updateRideStatus(rideId, "accepted");
      
      // Remove from pending rides
      const acceptedRide = pendingRides.splice(pendingRideIndex, 1)[0];
      
      // Send real-time update through Supabase
      try {
        await supabase
          .from('rides')
          .update({ 
            status: 'accepted',
            driver_id: driverId 
          })
          .eq('id', rideId);
          
        // Broadcast via Supabase realtime
        const channel = supabase.channel(`ride:${rideId}`);
        await channel.subscribe();
        
        // Using send message to broadcast
        channel.send({
          type: 'broadcast',
          event: 'ride_update',
          payload: {
            id: rideId,
            status: 'accepted',
            driverId: driverId,
            driver: {
              name: driver.name,
              vehicle: driver.vehicle,
              licensePlate: driver.licensePlate,
              rating: driver.rating
            }
          }
        });
      } catch (supaError) {
        console.error("Supabase realtime error:", supaError);
        // Continue even if supabase fails - the REST API will still work
      }
      
      res.json({ 
        message: "Ride accepted successfully", 
        ride: {
          ...acceptedRide,
          driverId,
          status: 'accepted', // Changed to 'accepted' first, then driver changes to 'in_progress'
          driver: {
            name: driver.name,
            vehicle: driver.vehicle,
            licensePlate: driver.licensePlate,
            rating: driver.rating
          }
        }
      });
    } catch (error) {
      console.error("Error accepting ride:", error);
      res.status(500).json({ message: "Failed to accept ride" });
    }
  });
  
  // Driver rejects a ride
  app.post("/api/driver/reject-ride", (req, res) => {
    const { rideId } = req.body;
    
    if (!rideId) {
      return res.status(400).json({ message: "Missing rideId" });
    }
    
    // Find the pending ride
    const pendingRideIndex = pendingRides.findIndex(ride => ride.id === Number(rideId));
    
    if (pendingRideIndex === -1) {
      return res.status(404).json({ message: "Ride not found or already accepted/rejected" });
    }
    
    // Remove from pending rides
    pendingRides.splice(pendingRideIndex, 1);
    
    res.json({ message: "Ride rejected successfully" });
  });
  
  app.get("/api/rides/:id", async (req, res) => {
    const rideId = parseInt(req.params.id);
    const activeRide = await storage.getActiveRide(rideId);
    
    if (!activeRide) {
      return res.status(404).json({ message: "Active ride not found" });
    }
    
    res.json(activeRide);
  });
  
  // Start a ride (from accepted to in_progress)
  app.post("/api/rides/:id/start", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    try {
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.status !== "accepted") {
        return res.status(400).json({ 
          message: "Ride cannot be started", 
          reason: `Current status is '${ride.status}', must be 'accepted'`
        });
      }
      
      await storage.updateRideStatus(rideId, "in_progress");
      
      res.json({ success: true, message: "Ride started successfully" });
    } catch (error) {
      console.error("Error starting ride:", error);
      res.status(500).json({ message: "Failed to start ride" });
    }
  });
  
  // Rider confirms ride completion
  app.post("/api/rides/:id/rider-complete", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    try {
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.status === "completed") {
        return res.status(400).json({ message: "Ride already completed" });
      }
      
      await storage.confirmRiderCompletedRide(rideId);
      const bothCompleted = await storage.checkBothCompletedRide(rideId);
      
      res.json({ 
        success: true, 
        message: bothCompleted 
          ? "Ride fully completed" 
          : "Waiting for driver to confirm completion" 
      });
    } catch (error) {
      console.error("Error completing ride:", error);
      res.status(500).json({ message: "Failed to complete ride" });
    }
  });
  
  // Driver confirms ride completion
  app.post("/api/rides/:id/driver-complete", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    try {
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.status === "completed") {
        return res.status(400).json({ message: "Ride already completed" });
      }
      
      await storage.confirmDriverCompletedRide(rideId);
      const bothCompleted = await storage.checkBothCompletedRide(rideId);
      
      res.json({ 
        success: true, 
        message: bothCompleted 
          ? "Ride fully completed" 
          : "Waiting for rider to confirm completion" 
      });
    } catch (error) {
      console.error("Error completing ride:", error);
      res.status(500).json({ message: "Failed to complete ride" });
    }
  });
  
  // Check ride completion status
  app.get("/api/rides/:id/complete-status", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    try {
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      res.json({
        rideId: ride.id,
        status: ride.status,
        riderCompleted: ride.riderCompletedRide || false,
        driverCompleted: ride.driverCompletedRide || false,
        bothCompleted: ride.riderCompletedRide && ride.driverCompletedRide
      });
    } catch (error) {
      console.error("Error checking ride status:", error);
      res.status(500).json({ message: "Failed to check ride status" });
    }
  });
  
  // Get completed ride details (for summary screen)
  app.get("/api/rides/:id/complete", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    // First try to get an active ride and check if already complete
    const ride = await storage.getRide(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    
    const completeRide = await storage.getCompleteRide(rideId);
    
    if (!completeRide) {
      return res.status(404).json({ message: "Completed ride not found" });
    }
    
    res.json(completeRide);
  });
  
  app.post("/api/rides/:id/cancel", async (req, res) => {
    const rideId = parseInt(req.params.id);
    
    try {
      // Get the ride
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      // Update ride status to canceled
      await storage.updateRideStatus(rideId, "canceled");
      
      // Remove from pending rides list if it's there
      const pendingRideIndex = pendingRides.findIndex(ride => ride.id === rideId);
      if (pendingRideIndex !== -1) {
        pendingRides.splice(pendingRideIndex, 1);
      }
      
      res.json({ success: true, message: "Ride canceled successfully" });
    } catch (error) {
      console.error("Error canceling ride:", error);
      res.status(500).json({ message: "Failed to cancel ride" });
    }
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
