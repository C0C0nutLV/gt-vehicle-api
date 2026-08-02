require('dotenv').config();
const puppeteer = require('puppeteer');
const Captcha = require('2captcha');

// Initialize the CAPTCHA solver
const solver = new Captcha.Solver(process.env.TWOCAPTCHA_API_KEY);

/**
 * MASTER ORCHESTRATOR
 * This function runs all 4 scrapers in parallel to generate the report in seconds.
 */
async function generateGuatemalanReport(plate, nit, vin) {
    console.log(`Starting parallel data extraction for Plate: ${plate}, VIN: ${vin}`);
    
    // Launch a single browser instance to save memory
    const browser = await puppeteer.launch({
        headless: true, // MUST be true for production servers
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Bypasses server security blocks
    });

    try {
        // Run all scraping tasks at the exact same time
        const [satData, pncData, pmtData, mpData] = await Promise.all([
            scrapeSAT(browser, plate, nit),
            scrapePNC(browser, plate),
            scrapePMT(browser, plate), // Specifically Emetra (Guatemala City)
            scrapeMP(browser, plate, vin)
        ]);

        const finalReport = {
            vehicle_identity: plate,
            sat_status: satData,
            pnc_theft_record: pncData,
            pmt_fines: pmtData,
            mp_investigation_status: mpData,
            timestamp: new Date().toISOString()
        };

        console.log('--- FINAL COMBINED REPORT ---');
        console.dir(finalReport, { depth: null });
        return finalReport;

    } catch (error) {
        console.error('Critical failure in scraping orchestrator:', error);
    } finally {
        await browser.close();
    }
}

/* =========================================================
   INDIVIDUAL SCRAPER MODULES
   ========================================================= */

// 1. SAT Scraper (Taxes and Activation)
async function scrapeSAT(browser, plate, nit) {
    const page = await browser.newPage();
    try {
        await page.goto('https://declaraguate.sat.gob.gt/declaraguate-web/');
        // NOTE: In production, you will navigate directly to Form 4091.
        // Pseudo-code for CAPTCHA handling:
        // const captchaBase64 = await getCaptchaImage(page, '#captchaImg');
        // const code = await solver.imageCaptcha(captchaBase64);
        // await page.type('#captchaInput', code.data);
        
        // Mock returning data for architecture setup
        return { 
            status: "ACTIVO", 
            taxes_owed: "0.00 GTQ", 
            make: "MITSUBISHI", 
            model: "NATIVA", 
            year: "2006",
            color: "VERDE" 
        };
    } catch (err) {
        return { error: "SAT un-reachable", details: err.message };
    } finally {
        await page.close();
    }
}

// 2. PNC Scraper (Immediate Theft Reports)
async function scrapePNC(browser, plate) {
    const page = await browser.newPage();
    try {
        // PNC often uses a portal like policiales.pnc.gob.gt
        await page.goto('https://policiales.pnc.gob.gt/');
        
        // await page.type('#inputPlaca', plate);
        // await page.click('#btnBuscar');
        // await page.waitForSelector('.resultado-robo');
        
        return { 
            stolen_report_active: false, 
            last_checked: new Date().toISOString() 
        };
    } catch (err) {
        return { error: "PNC portal timeout" };
    } finally {
        await page.close();
    }
}

// 3. PMT Scraper (Traffic Fines - Emetra/Guatemala City)
async function scrapePMT(browser, plate) {
    const page = await browser.newPage();
    try {
        // Emetra portal for Guatemala City
        await page.goto('https://remisiones.muniguate.com/');
        
        // await page.select('#tipoVehiculo', 'PARTICULAR');
        // await page.type('#placa', plate);
        // await page.click('#btnConsultar');
        
        return { 
            municipality: "Guatemala City (Emetra)", 
            total_fines: 0, 
            amount_due: "0.00 GTQ" 
        };
    } catch (err) {
        return { error: "PMT portal offline" };
    } finally {
        await page.close();
    }
}

// 4. MP Scraper (Ministerio Público - Criminal/Recovered Vehicles)
async function scrapeMP(browser, plate, vin) {
    const page = await browser.newPage();
    try {
        // The MP has a specific query for recovered or investigated vehicles
        await page.goto('https://www.mp.gob.gt/vehiculos-robados-y-recuperados/');
        
        // Usually requires VIN or Plate
        // await page.type('#txtPlaca', plate);
        // await page.click('#btnBuscarMP');
        
        return { 
            under_criminal_investigation: false, 
            recovered_by_authorities: false 
        };
    } catch (err) {
        return { error: "MP portal unavailable" };
    } finally {
        await page.close();
    }
}

/* =========================================================
   TEST EXECUTION
   ========================================================= */
// When testing the MVP locally, you can use real details to verify the DOM selectors
generateGuatemalanReport // Export the function for server.js
module.exports = { generateGuatemalanReport };