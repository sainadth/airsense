import { useState, useEffect, use } from 'react';
import axios from 'axios';
import SensorDataChart from './SensorDataChart';


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
        /* try {
            const response = await fetch('http://localhost:3000/api/sensors');
            const data = await response.json();
            setSensorIndexes(data);
        } catch (error) {
            setError('Failed to fetch sensor data');
        } finally {
            setLoading(false);
        } */
    };

    useEffect(() => {
        fetchSensorIds();
    }, []);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Sensor Data</h2>
            <SensorDataChart sensors={sensorIndexes}/>
        </div>
    );
};

export default SensorData;
