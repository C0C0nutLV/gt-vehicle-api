const express = require('express');
const { generateCompleteReport } = require('./guatemala_scraper');

const app = express();

app.use(express.json());

app.post('/api/check-vehicle', async (req, res) => {
    try {
        const { nit, vin } = req.body;
        console.log(`[API] Received request for NIT: ${nit}, VIN: ${vin}`);
        
        const report = await generateCompleteReport(nit, vin);
        
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=== SERVER IS RUNNING ON PORT ${PORT} ===`);
});