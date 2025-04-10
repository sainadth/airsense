import { useState, useEffect, use } from 'react';
import axios from 'axios';
import SensorDataChart from './SensorDataChart';
import { FadeLoader } from 'react-spinners';

const SensorData = () => {
    const [sensorIndexes, setSensorIndexes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSensorIds = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/sensors');
            setSensorIndexes(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensorIds();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <FadeLoader />
        </div>
    );
    if (error) return <div>{error}</div>;

    return (
        <div className="h-screen bg-gray-100 display text-black flex items-center justify-center">
            <SensorDataChart sensors={sensorIndexes} />
        </div>
    );
};

export default SensorData;
