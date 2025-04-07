import React from 'react';
import RideCompletionComponent from '@/components/rider/RideCompletion';

interface RideCompletionProps {
  rideId: number;
  onComplete: () => void;
}

const RideCompletion: React.FC<RideCompletionProps> = ({ 
  rideId, 
  onComplete
}) => {
  return (
    <RideCompletionComponent
      rideId={rideId}
      onComplete={onComplete}
      isRider={false}
    />
  );
};

export default RideCompletion;