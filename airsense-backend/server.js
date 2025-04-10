require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.PURPLE_AIR_API_KEY;
const BASE_URL = `https://api.purpleair.com/v1/sensors`

app.use(cors());

app.get('/api/sensors', async (req, res) => {
    console.log("Loaded API key:", apiKey);

    // Ensure you set this in your environment variables
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                fields: 'name',
                nwlat: 28.216241,
                nwlng: -97.665848,
                selat: 27.411418,
                selng: -96.934244
            },
            headers: {
                'X-API-Key': apiKey
            },
        });
        const formattedData = response.data.data.map(sensor => ({
            name: sensor[1],
            sensor_index: sensor[0]
        }));
        // console.log("Formatted data:", formattedData);
        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching sensors indexes data');
    }
});


app.get('/api/sensor/:sensor_index/:selectedField', async (req, res) => {
    try {
        let selectedField = req.params.selectedField || 'pm2.5_alt';
        if(selectedField === 'pm2.5') { selectedField = 'pm2.5_alt'}
        // console.log("feilds:", selectedField);
        const response = await axios.get(BASE_URL + `/${req.params.sensor_index}/history`, {
            params: {
                sensor_index: req.params.sensor_index,
                fields: selectedField,
                average: '10',
                start_timestamp: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 3, // 3 days
            },
            headers: {
                'X-API-Key': apiKey
            },
        });
        // console.log("Sensor data response:", response.data);
        if (!response) {
            return res.status(404).send("Sensor data not found");
        }
        if(selectedField == 'pm2.5_alt') {
            selectedField = 'pm2.5'
        }
        const formattedData = response.data.data
            .map(sensor => ({
                sensor_index: response.data.sensor_index,
                timestamp : sensor[0],
                time: new Date(sensor[0] * 1000).toLocaleString(),
                [`${selectedField}`]: sensor[1]
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
        // console.log("Formatted sensor data:", formattedData);
        res.json(formattedData);
    } catch (error) {
        // console.error(error);
        console.error("Error fetching sensor data:", error.message);
        res.status(500).send('Error fetching sensors data');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});