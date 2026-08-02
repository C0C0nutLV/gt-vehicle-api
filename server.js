const express = require('express');
const { generateGuatemalanReport} = require('./guatemala_scraper');

const app = express();

// Enable parsing of JSON body data
app.use(express.json());

// Create the POST endpoint
app.post('/api/check-vehicle', async (req, res) => {
    try {
        const { nit, vin } = req.body;
        console.log(`[API] Received request for NIT: ${nit}, VIN: ${vin}`);
        
        // Call the exported scraper function
        const report = await generateGuatemalanReport(nit, vin);
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('[API Error]:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start listening on Port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=== SERVER IS RUNNING ON HTTP://LOCALHOST:${PORT} ===`);
    console.log('Ready to receive requests from your test command...');
});