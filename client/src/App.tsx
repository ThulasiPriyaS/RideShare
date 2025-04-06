import { useState } from "react";
import { Switch, Route } from "wouter";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import ActivityPage from "@/pages/activity";
import RewardsPage from "@/pages/rewards";
import NotFound from "@/pages/not-found";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />
      
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={() => <HomePage setActiveTab={setActiveTab} />} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/activity" component={ActivityPage} />
          <Route path="/rewards" component={RewardsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
