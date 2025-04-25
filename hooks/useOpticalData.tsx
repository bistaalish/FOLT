import { useState } from 'react';

const useOpticalData = (id: string, token: string, fsp: string, ontid: string) => {
    const [opticalData, setOpticalData] = useState<{ ONU_RX: number | null; OLT_RX: number | null } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOpticalData = async () => {
        if (!fsp || !ontid) return;

        setIsLoading(true);
        setError(null);
        setOpticalData(null); // Clear previous data to trigger re-render

        try {
            const response = await fetch(`http://olt.linuxeval.eu.org/device/${id}/onu/optical`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ FSP: fsp, ONTID: ontid }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch optical data');
            }

            const data = await response.json();
            setOpticalData({
                ONU_RX: data.ONU_RX || null,
                OLT_RX: data.OLT_RX || null,
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
