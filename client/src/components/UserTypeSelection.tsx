import { useState } from 'react';
import { UserCog, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserTypeSelectionProps {
  onSelect: (type: 'rider' | 'driver') => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect }) => {
  const [selectedType, setSelectedType] = useState<'rider' | 'driver' | null>(null);

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#276EF1] text-white p-6 text-center">
          <h2 className="text-2xl font-bold">Welcome to RideBoost</h2>
          <p className="mt-2 opacity-90">Please select how you'd like to use the app</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedType === 'rider' 
                  ? 'border-[#276EF1] bg-[#276EF1]/5' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('rider')}
            >
              <div className="w-16 h-16 rounded-full bg-[#276EF1]/10 flex items-center justify-center mb-3">
                <UserCog className="h-8 w-8 text-[#276EF1]" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Rider</h3>
              <p className="text-sm text-gray-500 text-center">Book rides to your destination</p>
            </div>

            <div 
              className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedType === 'driver' 
                  ? 'border-[#276EF1] bg-[#276EF1]/5' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('driver')}
            >
              <div className="w-16 h-16 rounded-full bg-[#276EF1]/10 flex items-center justify-center mb-3">
                <Car className="h-8 w-8 text-[#276EF1]" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Driver</h3>
              <p className="text-sm text-gray-500 text-center">Offer rides and earn money</p>
            </div>
          </div>

          <Button 
            className="w-full py-6 text-lg"
            onClick={handleSelect}
            disabled={!selectedType}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;