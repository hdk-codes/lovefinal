import { QueryClient } from '@tanstack/react-query';
import { client } from './sanity';
import { queries } from './query-utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Define default query functions
const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const [endpoint, ...params] = queryKey;
  
  switch (endpoint) {
    case '/api/love-letters':
      return client.fetch(queries.loveLetters);
    case '/api/albums':
      return client.fetch(queries.albums, { identity: 'current-user' });
    case '/api/gallery/featured':
      return client.fetch(queries.galleryFeatured);
    default:
      throw new Error(`No query function found for endpoint: ${endpoint}`);
  }
};

const fetchQuery = async ({ queryKey }: { queryKey: readonly string[] }) => {
  const response = await fetch(queryKey[0]);
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Set the default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: defaultQueryFn
  }
});
