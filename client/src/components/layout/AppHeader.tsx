import { Bell, Car, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  userType?: 'rider' | 'driver' | null;
  onSwitchUserType?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userType, onSwitchUserType }) => {
  const { data: user } = useQuery<User>({ 
    queryKey: ['/api/user/current']
  });

  // Fallback values in case user data is not loaded yet
  const userPoints = user?.points || 0;
  const notificationCount = user?.notifications || 0;
  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "US";

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#276EF1]">RideBoost</h1>
          
          {/* User type badge */}
          {userType && (
            <Badge 
              variant="outline" 
              className="ml-2 cursor-pointer flex items-center gap-1"
              onClick={onSwitchUserType}
            >
              {userType === 'rider' ? (
                <>
                  <UserCog className="h-3 w-3" />
                  <span>Rider</span>
                </>
              ) : (
                <>
                  <Car className="h-3 w-3" />
                  <span>Driver</span>
                </>
              )}
            </Badge>
          )}
        </div>
        
        {/* Only show points for riders */}
        {userType === 'rider' && (
          <div className="ml-3 bg-[#F5A623]/10 px-2 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F5A623]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-[#1A1A1A] ml-1">
              {userPoints.toLocaleString()} pts
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        {/* Switch user type button for small screens */}
        {userType && onSwitchUserType && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2 px-2 py-1 h-auto text-xs md:hidden"
            onClick={onSwitchUserType}
          >
            Switch to {userType === 'rider' ? 'Driver' : 'Rider'}
          </Button>
        )}
        
        <div className="mr-3 relative">
          <button className="relative p-1">
            <Bell className="h-6 w-6 text-[#6E6E6E]" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        <div className="h-8 w-8 rounded-full bg-[#276EF1] flex items-center justify-center text-white font-medium text-sm">
          {userInitials}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
