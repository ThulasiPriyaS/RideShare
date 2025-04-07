import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import ActivityPage from "@/pages/activity";
import RewardsPage from "@/pages/rewards";
import DriverPage from "@/pages/driver";
import NotFound from "@/pages/not-found";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UserTypeSelection from "@/components/UserTypeSelection";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [userType, setUserType] = useState<'rider' | 'driver' | null>(null);
  const [showUserTypeModal, setShowUserTypeModal] = useState(true);
  const [location, setLocation] = useLocation();

  // Check for stored user type in localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType === 'rider' || storedUserType === 'driver') {
      setUserType(storedUserType);
      setShowUserTypeModal(false);
    }
  }, []);

  // Handle user type selection
  const handleUserTypeSelection = (type: 'rider' | 'driver') => {
    setUserType(type);
    localStorage.setItem('userType', type);
    setShowUserTypeModal(false);
    
    // Redirect to appropriate page
    if (type === 'driver') {
      setLocation('/driver');
    }
  };

  // Handle toggle between rider and driver
  const toggleUserType = () => {
    const newType = userType === 'rider' ? 'driver' : 'rider';
    setUserType(newType);
    localStorage.setItem('userType', newType);
    
    // Redirect to appropriate page
    if (newType === 'driver') {
      setLocation('/driver');
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Show user type selection if not selected */}
      {showUserTypeModal && (
        <UserTypeSelection onSelect={handleUserTypeSelection} />
      )}
      
      <AppHeader 
        userType={userType as 'rider' | 'driver' | null} 
        onSwitchUserType={toggleUserType} 
      />
      
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={() => <HomePage setActiveTab={setActiveTab} />} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/activity" component={ActivityPage} />
          <Route path="/rewards" component={RewardsPage} />
          <Route path="/driver" component={DriverPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Only show bottom navigation for riders */}
      {userType !== 'driver' && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;
