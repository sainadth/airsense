import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

import axios from 'axios';



const SensorDataChart = ({ sensors }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({});

    const fetchSensorWithRetry = async (url, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(url);
                console.log("Sensor data from retry:", response);
                return response;
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(res => setTimeout(res, delay));
            }
        }
        // return {{status: 500}}
    };

    const fetchSensorData = async () => {
        console.log("IN fetchSensorData", sensors);
        try {
            const sensorDataPromises = sensors.map(async (sensor) => {
                const url = `http://localhost:3000/api/sensor/${sensor.sensor_index}`;
                const response = await fetchSensorWithRetry(url, 3, 2000); 
                console.log("Sensor data:", response);
                const formateedResonse = response.data.data.map((item) => (
                    console.log("Sensor data item:", item),
                    {
                    [item.time]: time,
                    [sensor.name]: item['pm2.5'],
                }));
                console.log("Formatted Sensor data:", formateedResonse);
                return formateedResonse;
            });

            const sensorData = await Promise.all(sensorDataPromises);

            console.log("Promises awaited");
            console.log("My Sensor data:", sensorData);

            const merged = {};
            allSensorData.flat().forEach((reading) => {
                const { time, ...sensorReading } = reading;
                if (!merged[time]) {
                    merged[time] = { time };
                }
                Object.assign(merged[time], sensorReading);
            });

            const finalData = Object.values(merged).sort(
                (a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`)
            );
    
            console.log("Final chartData:", finalData);
            setChartData(finalData);


        } catch (error) {
            console.error("asfasdfs");
            setError('Failed to fetch sensor data');
        }
        console.log("OUT fetchSensorData");
    };
    // const fetchSensorData = async () => {
    //     console.log("IN fetchSensorData", sensors);
    //     try {
    //         const sensorDataPromises = sensors.map(async (sensor) => {
    //             const response = await fetch(`http://localhost:3000/api/sensor/${sensor.sensor_index}`);
    //             const data = await response.json();
    //             console.log("Sensor data:", data);
    //             return { [sensor.name]: date };
    //         });

    //         const sensorData = await Promise.all(sensorDataPromises);
    //         console.log("Promises awaited");
    //         console.log("My Sensor data:", sensorData);
    //         setChartData(sensorData);
    //     } catch (error) {
    //         setError('Failed to fetch sensor data');
    //     }
    //     console.log("OUT fetchSensorData");
    // };

    useEffect(() => {
        console.log("Sensors IN child:", sensors);
        if (sensors.length > 0) {
            fetchSensorData();
            const interval = setInterval(fetchSensorData, 600000); // every 10 mins
            return () => clearInterval(interval);
        }
    }, [sensors]);


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-xl">
                <h1 className="text-2xl font-bold mb-4 text-center">Live Metrics</h1>
                <ResponsiveContainer width="100%" height={300}>
                    {
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis />
                            {/* sensors.map((sensorData, index) => (

                            <Line key={index} type="monotone" dataKey={sensorData['pm.2.5']} stroke="#6366f1" strokeWidth={2} />
                            )) */}
                            <Legend verticalAlign="bottom" height={36} />
                            <Tooltip />
                        </LineChart>
                    }
                    {/* <XAxis dataKey="name" /> */}
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default SensorDataChart
