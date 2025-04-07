import React from 'react';
import { RideCompletion as BaseRideCompletion } from '@/components/rider/RideCompletion';

interface RideCompletionProps {
  rideId: number;
  onComplete: () => void;
}

const RideCompletion: React.FC<RideCompletionProps> = ({ 
  rideId, 
  onComplete
}) => {
  return (
    <BaseRideCompletion
      rideId={rideId}
      onComplete={onComplete}
      isRider={false}
    />
  );
};

export default RideCompletion;