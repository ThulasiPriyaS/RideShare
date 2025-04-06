import { useLocation, useRoute, Link } from "wouter";
import { Home, ClipboardList, Plus, Gift, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const [isHome] = useRoute("/");
  const [isActivity] = useRoute("/activity");
  const [isRewards] = useRoute("/rewards");
  const [isProfile] = useRoute("/profile");
  const [, navigate] = useLocation();

  const handleTabChange = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-lg py-2 sticky bottom-0 z-10">
      <div className="flex items-center justify-around">
        <button 
          onClick={() => handleTabChange("home", "/")}
          className={`flex flex-col items-center py-1 px-3 ${isHome ? "text-[#276EF1]" : "text-[#6E6E6E]"}`}
        >
          <Home className="h-6 w-6" />
          <span className={`text-xs mt-1 ${isHome ? "font-medium" : ""}`}>
            Home
          </span>
        </button>
        
        <button 
          onClick={() => handleTabChange("activity", "/activity")}
          className={`flex flex-col items-center py-1 px-3 ${isActivity ? "text-[#276EF1]" : "text-[#6E6E6E]"}`}
        >
          <ClipboardList className="h-6 w-6" />
          <span className={`text-xs mt-1 ${isActivity ? "font-medium" : ""}`}>
            Activity
          </span>
        </button>
        
        <button 
          onClick={() => handleTabChange("request", "/request")}
          className={`flex flex-col items-center py-1 px-3 ${activeTab === "request" ? "text-[#276EF1]" : "text-[#6E6E6E]"}`}
        >
          <Plus className="h-6 w-6" />
          <span className={`text-xs mt-1 ${activeTab === "request" ? "font-medium" : ""}`}>
            Request
          </span>
        </button>
        
        <button 
          onClick={() => handleTabChange("rewards", "/rewards")}
          className={`flex flex-col items-center py-1 px-3 ${isRewards ? "text-[#276EF1]" : "text-[#6E6E6E]"}`}
        >
          <Gift className="h-6 w-6" />
          <span className={`text-xs mt-1 ${isRewards ? "font-medium" : ""}`}>
            Rewards
          </span>
        </button>
        
        <button 
          onClick={() => handleTabChange("profile", "/profile")}
          className={`flex flex-col items-center py-1 px-3 ${isProfile ? "text-[#276EF1]" : "text-[#6E6E6E]"}`}
        >
          <User className="h-6 w-6" />
          <span className={`text-xs mt-1 ${isProfile ? "font-medium" : ""}`}>
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
