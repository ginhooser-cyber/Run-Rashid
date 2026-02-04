const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureGameScreenshots() {
    const screenshotsDir = './screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('Navigating to game...');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for game to load
        await page.waitForTimeout(3000);
        
        // Screenshot 1: Main Menu
        console.log('Capturing main menu...');
        await page.screenshot({ path: path.join(screenshotsDir, '01-main-menu.png'), fullPage: false });
        
        // Try to start the game
        console.log('Looking for Start Story button...');
        const startButton = await page.locator('text=START STORY').first();
        if (await startButton.isVisible()) {
            await startButton.click();
            console.log('Clicked START STORY');
            await page.waitForTimeout(5000); // Wait for countdown and game to start
            
            // Screenshot 2: Act 1 Gameplay
            console.log('Capturing Act 1 gameplay...');
            await page.screenshot({ path: path.join(screenshotsDir, '02-act1-gameplay.png'), fullPage: false });
        }

        console.log('Screenshots saved to ./screenshots/');
        console.log('Files created:');
        const files = fs.readdirSync(screenshotsDir);
        files.forEach(f => console.log('  - ' + f));

    } catch (error) {
        console.error('Error:', error.message);
        // Take error screenshot
        await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: false });
    } finally {
        await browser.close();
    }
}

captureGameScreenshots();