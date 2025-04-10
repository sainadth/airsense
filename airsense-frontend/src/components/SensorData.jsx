import { useState, useEffect } from 'react';
import axios from 'axios';
import SensorDataChart from './SensorDataChart';
import { FadeLoader } from 'react-spinners';

const BASE_URL = 'https://airsense-2x0h.onrender.com';
// const BASE_URL = 'http://localhost:3000';

const calculateBoundingBox = (latitude, longitude, distance) => {
    /* calculating boundaries nw and se points @50 miles from current location */
    const earthRadius = 3960; // in miles
    const latChange = distance / 69; // 1 degree latitude ~ 69 miles
    const lonChange = distance / (69 * Math.cos(latitude * (Math.PI / 180))); // Adjust for latitude

    const nwPoint = {
        latitude: latitude + latChange,
        longitude: longitude - lonChange,
    };

    const sePoint = {
        latitude: latitude - latChange,
        longitude: longitude + lonChange,
    };

    return { nwPoint, sePoint };
};

const SensorData = () => {
    const [sensorIndexes, setSensorIndexes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState({ latitude: null, longitude: null });

    const fetchSensorIds = async (nwPoint, sePoint) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/sensors/`, {
                params: {
                    nwlat: nwPoint.latitude,
                    nwlng: nwPoint.longitude,
                    selat: sePoint.latitude,
                    selng: sePoint.longitude,
                },
            });
            setSensorIndexes(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error("Error fetching location:", error);
                        setError("Failed to fetch location");
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser");
            }
        };

        fetchLocation();
    }, []);

    useEffect(() => {
        if (location.latitude && location.longitude) {
            const { nwPoint, sePoint } = calculateBoundingBox(location.latitude, location.longitude, 50);
            fetchSensorIds(nwPoint, sePoint);
        }
    }, [location]);

    if (!location.latitude || !location.longitude) return (
        <div className="flex items-center justify-center min-h-screen">
            <FadeLoader />
            <p>Fetching location...</p>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <FadeLoader />
        </div>
    );

    return (
        <div className="h-screen bg-gray-100 display text-black flex items-center justify-center">
            <SensorDataChart sensors={sensorIndexes} />
        </div>
    );
};

export default SensorData;
