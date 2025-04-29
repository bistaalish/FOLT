import { useState } from 'react';
import axios from 'axios'; 

interface SNResult {
  status: string;
  description: string;
  fsp: string;
  sn: string;
  ontid: string;
  vendorsn: string;
  lineProfile: string;
}

interface UseSNSearchResult {
  results: SNResult[];
  isLoading: boolean;
  error: string | null;
  searchSN: () => Promise<void>;
  clearResults: () => void; // ✅ new function
}

const useSNSearch = (
  id: string,
  token: string,
  sn: string
): UseSNSearchResult => {
  const [results, setResults] = useState<SNResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSN = async () => {
    const trimmedSN = sn.trim();
    if (!trimmedSN) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/device/${id}/onu/search/sn`,
        { sn: trimmedSN },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (response.status === 404 || !data) {
        setResults([]);
        setError('No matching devices found.');
        return;
      }

      const formattedResults: SNResult[] = [{
        status: data.status,
        description: data.Description,
        fsp: data.FSP,
        sn: data.SN,
        ontid: data.ONTID,
        vendorsn: data.VendorSN,
        lineProfile: data.LineProfile,
      }];

      setResults(formattedResults);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Function to clear results and error
  const clearResults = () => {
    setResults([]);
    setError(null);
    setIsLoading(false);
  };

  return { results, isLoading, error, searchSN, clearResults };
};

export default useSNSearch;
