const express = require('express');
const { generateGuatemalanReport } = require('./guatemala_scraper');

const app = express();

app.use(express.json());

app.post('/api/check-vehicle', async (req, res) => {
    try {
        const { nit, vin } = req.body;
        console.log(`[API] Received request for NIT: ${nit}, VIN: ${vin}`);
        
        // This exact name must match the scraper's export!
        const report = await generateGuatemalanReport('P000000', nit, vin);
        
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`=== SERVER IS RUNNING ON PORT ${PORT} ===`);
});