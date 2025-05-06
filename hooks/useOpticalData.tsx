import { useState } from 'react';
import axios from 'axios'; 

const useOpticalData = (id: string, token: string, fsp: string, ontid: string) => {
    const [opticalData, setOpticalData] = useState<{ ONU_RX: number | null;  } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    console.log('Optical Data Hook:', { id, token, fsp, ontid });
    const fetchOpticalData = async () => {
        if (!fsp || !ontid) return;

        setIsLoading(true);
        setError(null);
        setOpticalData(null); // Clear previous data to trigger re-render

        try {
             // Dynamically import axios
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const response = await axios.post(
                `${apiUrl}/device/${id}/onu/optical`,
                { FSP: fsp, ONTID: ontid },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            await setOpticalData({
                ONU_RX: response.data.ONU_RX || null,
                
            });
        } catch (err) {
            console.error('Optical Data Error:', err);
            setError('Failed to fetch optical data.');
        } finally {
            setIsLoading(false);
        }
    };
    const resetOpticalData = () => {
        setOpticalData(null);
        setIsLoading(false);
        setError(null);
    };

    return { opticalData, isLoading, error, fetchOpticalData, resetOpticalData };
};

export default useOpticalData;
