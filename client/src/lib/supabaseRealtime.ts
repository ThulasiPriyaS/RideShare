import { getSupabase } from './supabaseClient';

/**
 * Subscribe to ride status updates
 * @param rideId The ID of the ride to listen for updates
 * @param onUpdate Callback function when ride status changes
 * @returns A function to unsubscribe from the channel
 */
export async function subscribeToRideUpdates(
  rideId: number,
  onUpdate: (payload: any) => void
) {
  const supabase = await getSupabase();
  
  const channel = supabase
    .channel(`ride:${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `id=eq.${rideId}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to new ride requests (for drivers)
 * @param onNewRide Callback function when a new ride is created
 * @returns A function to unsubscribe from the channel
 */
export async function subscribeToNewRides(
  onNewRide: (payload: any) => void
) {
  const supabase = await getSupabase();
  
  const channel = supabase
    .channel('new_rides')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rides',
        filter: `status=eq.pending`
      },
      (payload) => {
        onNewRide(payload.new);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to pending ride updates (for drivers)
 * @param onUpdate Callback function when a pending ride is updated
 * @returns A function to unsubscribe from the channel
 */
export async function subscribeToPendingRideUpdates(
  onUpdate: (payload: any) => void
) {
  const supabase = await getSupabase();
  
  const channel = supabase
    .channel('pending_rides')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `status=eq.pending`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}