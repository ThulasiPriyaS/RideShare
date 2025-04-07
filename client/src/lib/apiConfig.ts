// Api configuration and keys export
// The server will inject these values via API endpoints

/**
 * Gets the Google Maps API key from the server
 */
export async function getGoogleMapsApiKey(): Promise<string> {
  const res = await fetch('/api/config/googleMapsApiKey');
  const data = await res.json();
  return data.apiKey;
}

/**
 * Gets the Supabase configuration from the server
 */
export async function getSupabaseConfig(): Promise<{url: string, key: string}> {
  const res = await fetch('/api/config/supabaseConfig');
  return await res.json();
}