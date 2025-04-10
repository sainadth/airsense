import React, { act, useEffect, useState } from 'react';

import { ScaleLoader } from 'react-spinners';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts';

import axios from 'axios';
import { Loader } from 'lucide-react';

const colors = [
  "red",
  "blue",
  "purple",
  "green",
];

const SensorDataChart = ({ sensors }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeLine, setActiveLine] = useState(
    sensors.reduce((acc, sensor) => ({ ...acc, [sensor.name]: true }), {})
  );
  const [selectedField, setSelectedField] = useState('pm2.5'); // Default field

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  const fetchSensorWithRetry = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  };

  const fetchSensorData = async () => {
    try {
      const sensorDataPromises = sensors.map(async (sensor) => {
        const url = `http://localhost:3000/api/sensor/${sensor.sensor_index}/${selectedField}`;
        const response = await fetchSensorWithRetry(url, 5, 2000);

        return response.data.map((item) => ({
          time: item.time,
          [sensor.name]: item[selectedField], // Fetch selected field
        }));
      });

      const sensorData = await Promise.all(sensorDataPromises);

      console.log("My Sensor data:", sensorData);

      const merged = {};
      sensorData.flat().forEach((reading) => {
        const { time, ...sensorReading } = reading;
        if (!merged[time]) {
          merged[time] = { time };
        }
        Object.assign(merged[time], sensorReading);
      });

      const finalData = Object.values(merged).sort(
        (a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`)
      );

      setChartData(finalData);
    } catch (error) {
      console.log("Error fetching sensor data:", error);
      setError('Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(() => {
      console.log("In UseEffect refreshing data, ", new Date().toLocaleTimeString());
      fetchSensorData();
    }, 600000); // every 10 mins
    return () => clearInterval(interval);
  }, [selectedField]);

  const handleOnClick = (e) => {
    console.log("Clicked on legend:", e.dataKey);
    if (e.dataKey) {
      setActiveLine((prev) => {
        const newState = { ...prev, [e.dataKey]: !prev[e.dataKey] };
        console.log("New state:", newState);
        return newState;
      });
    }
  };

  return (
    <div style={{ width: '800px', height: '400px' }} className="mx-auto">
      <div className="mb-4 justify-center flex items-center flex">
        <label htmlFor="field-select" className="mr-2">Select Field:</label>
        <select
          id="field-select"
          value={selectedField}
          onChange={handleFieldChange}
          className="border border-gray-300 rounded p-1"
        >
          <option value="pm2.5">PM2.5</option>
          <option value="humidity">Humidity</option>
          <option value="temperature">Temperature</option>
          <option value="pressure">Pressure</option>
        </select>
      </div>
      {loading ? (
        <div className='flex items-center justify-center text-center '>
          <ScaleLoader className='flex items-center justify-center text-center' />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              ticks={chartData
                .filter((item) => {
                  const time = new Date(item.time); // Parse the time directly
                  const hours = time.getHours();
                  const minutes = time.getMinutes();
                  return (hours === 0 && minutes === 0) || (hours === 12 && minutes === 0);
                })
                .map((item) => item.time)}
              tickFormatter={(value) => {
                const time = new Date(value); // Parse the time directly
                const hours = time.getHours();
                const minutes = time.getMinutes();
                if (hours === 0 && minutes === 0) {
                  return time.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                  });
                } else if (hours === 12 && minutes === 0) {
                  return '12:00';
                }
                return value;
              }}
            />
            <YAxis >
              <Label value={selectedField.toUpperCase()} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip
              content={({ payload, active }) => {
                if (active && payload && payload.length) {
                  const date = payload[0]?.payload?.time || 'N/A';
                  return (
                    <div className="bg-white border border-gray-300 text-black p-2 rounded shadow-lg">
                      <p><strong>Date:</strong> {date}</p>
                      {payload.map((item, index) => (
                        <p key={index} style={{ color: item.stroke }}>
                          {`${item.dataKey}: ${item.value}`}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {sensors.map((sensor, index) => (
              <Line
                key={sensor.name}
                type="monotone"
                dataKey={sensor.name}
                stroke={colors[index]}
                dot={false}
                visibility={activeLine[sensor.name] ? "visible" : "hidden"}
              />
            ))}
            <Legend
              onClick={(e) => {
                handleOnClick(e);
              }}
              formatter={(value) => (
                <span
                  style={{
                    opacity: activeLine[value] ? 1 : 0.5, // Adjust opacity based on activeLine state
                  }}
                >
                  {value}
                </span>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SensorDataChart;
