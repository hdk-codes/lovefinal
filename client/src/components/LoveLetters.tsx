import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '../lib/dataProvider';

interface LoveLetter {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  // Add other letter properties as needed
}

export function LoveLetters() {
  const { 
    data: letters, 
    isLoading,
    error 
  } = useQuery<LoveLetter[]>({
    queryKey: ['letters'],
    queryFn: () => dataProvider.letters(),
    gcTime: 30000, // 30 seconds garbage collection time
    staleTime: 1000, // 1 second before refetch
    refetchInterval: (data) => data ? 5000 : 1000, // Poll every 5s if we have data, 1s if not
    retry: 2,
    initialData: [], // Provide empty array as initial data
  });

  if (error) {
    return <div>Error loading letters: {(error as Error).message}</div>;
  }

  if (isLoading) {
    return <div>Loading love letters...</div>;
  }

  return (
    <div className="space-y-4">
      {letters.map((letter) => (
        <div 
          key={letter._id}
          className="p-4 bg-white rounded-lg shadow"
        >
          <h3 className="text-lg font-medium">{letter.title}</h3>
          <p className="text-gray-600">{letter.content}</p>
          <span className="text-sm text-gray-400">
            {new Date(letter.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}
      {letters.length === 0 && (
        <p className="text-center text-gray-500">No letters found</p>
      )}
    </div>
  );
}
