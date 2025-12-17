import { ServiceType, ApiResponse } from '../types';

// NOTE: Most of these file hosts (Filemoon, Abyss) use a standardized API structure 
// often based on XFileSharing or similar scripts.
// Typically: https://hostname/api/upload/url?key=KEY&url=URL

const BASE_URLS = {
  [ServiceType.ABYSS]: 'https://abyss.to/api/upload/url',
  [ServiceType.FILEMOON]: 'https://filemoon.sx/api/upload/url',
};

export const initiateRemoteUpload = async (
  service: ServiceType,
  apiKey: string,
  targetUrl: string
): Promise<ApiResponse> => {
  const baseUrl = BASE_URLS[service];
  
  if (!apiKey) {
    throw new Error(`API Key for ${service} is missing.`);
  }

  // Construct URL with query parameters
  const endpoint = new URL(baseUrl);
  endpoint.searchParams.append('key', apiKey);
  endpoint.searchParams.append('url', targetUrl);
  // Some services require a specific output format, typically JSON is default or requested via &new=1
  endpoint.searchParams.append('new', '1'); 

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'GET', // Most XFS implementations use GET for remote upload initiation
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize response
    // Success usually: { status: 200, result: { filecode: "..." } }
    // Error usually: { status: 4xx, msg: "..." }
    
    return data as ApiResponse;

  } catch (error: any) {
    // Handle CORS errors specifically as they are common in browser-to-API calls
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('CORS Error: The service blocked the request. You may need a browser extension or a backend proxy.');
    }
    throw error;
  }
};