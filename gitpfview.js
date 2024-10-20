const puppeteer = require('puppeteer');
const chalk = require('chalk');
const ora = require('ora'); // For the spinner
const readline = require('readline'); // For user input

// Function to create delay
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Function to center text
const center = (text, width) => {
    if (text.length > width) {
        return text; // Return the text as is if it's too long
    }
    const totalPadding = width - text.length;
    const leftPadding = ' '.repeat(Math.floor(totalPadding / 2));
    return leftPadding + text;
};

// Function to prompt user for URL and validate it
async function promptUserForURL() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(chalk.hex('#0366D6')('Please enter the GitHub URL you want to visit (e.g., https://github.com/username/repo): '), (answer) => { // Dark Blue
            rl.close();
            if (!answer.startsWith('https://github.com/')) {
                console.error(chalk.hex('#EA3A2D')('Invalid URL. Please enter a valid GitHub URL.')); // Red
                process.exit(1); // Exit if input is invalid
            }
            console.log(chalk.hex('#6A737D')('You will be visiting this URL multiple times as specified.')); // Clarification
            resolve(answer);
        });
    });
}

// Function to prompt user for input and validate it
async function promptUserForVisits() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(chalk.hex('#0366D6')('How many times do you want to visit the URL? '), (answer) => { // Dark Blue
            rl.close();
            const visits = parseInt(answer, 10);
            if (isNaN(visits) || visits <= 0) {
                console.error(chalk.hex('#EA3A2D')('Please enter a valid positive integer.')); // Red
                process.exit(1); // Exit if input is invalid
            }
            console.log(chalk.hex('#6A737D')(`You will be visiting the URL ${visits} times.`)); // Clarification
            resolve(visits);
        });
    });
}

// Improved list of User-Agent strings for rotation
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.96 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 12; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.96 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Ubuntu; 20.04; rv:102.0) Gecko/20100101 Firefox/102.0',
    // Add more as needed
];

// Main function to run Gitpfview
(async () => {
    const bannerWidth = 50; // Adjusted width of the banner to fit longer messages
    console.log(chalk.hex('#6A737D').bold('╭──────────────────────────────────────────────────╮')); // Dark Gray
    console.log(chalk.hex('#0366D6').bold(center(' Welcome to Gitpfview! ', bannerWidth))); // Blue
    console.log(chalk.hex('#28A745').bold(center(' A fun project to boost your GitHub view count! ', bannerWidth))); // Green
    console.log(chalk.hex('#0366D6').bold(center(' Designed for profiles or repos with view counters. ', bannerWidth))); // Blue
    console.log(chalk.hex('#6A737D').bold('╰──────────────────────────────────────────────────╯')); // Dark Gray

    const MAX_RETRIES = 10;
    let retries = 0;
    let browser;

    // Prompt user for GitHub URL and number of visits
    const url = await promptUserForURL();
    const visitCount = await promptUserForVisits();
    console.log(chalk.hex('#0366D6').bold(`You chose to visit the URL ${url} ${visitCount} times.`)); // Dark Blue

    try {
        console.log(chalk.hex('#28A745').bold('Launching the browser...')); // Green
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        console.log(chalk.hex('#28A745')('Opening a fresh tab.')); // Green

        let successCount = 0; // Counter for successful visits
        let totalRetries = 0; // Counter for total retries

        for (let visit = 0; visit < visitCount; visit++) {
            retries = 0; // Reset retries for each visit
            while (retries < MAX_RETRIES) {
                try {
                    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                    await page.setUserAgent(randomUserAgent);
                    console.log(chalk.hex('#28A745')('User-Agent set for the browser.')); // Green

                    const spinner = ora(chalk.hex('#6A737D')(`Attempt ${retries + 1} to visit the URL...`)).start(); // Dark Gray
                    const response = await page.goto(url, { waitUntil: 'networkidle2' });

                    // Check if the response was successful
                    if (!response.ok()) {
                        if (response.status() === 304) {
                            console.log(chalk.hex('#6A737D')(`The page has not been modified (304).`)); // Dark Gray
                            successCount++; // Count as a success
                            break; // Exit loop if content has not changed
                        }
                        console.error(chalk.hex('#EA3A2D')(`Failed to visit the URL: ${response.status()} - ${response.statusText()}`)); // Red
                        retries++;
                        totalRetries++;
                        console.log(chalk.hex('#6A737D')(`Retrying... Attempt ${retries} of ${MAX_RETRIES}.`)); // Dark Gray
                        await delay(2000); // Wait 2 seconds before retrying
                        continue; // Retry the loop
                    }

                    spinner.succeed(chalk.hex('#28A745')('Page visited successfully.')); // Green
                    successCount++; // Count as a success

                    // Wait time between visits for rate limiting
                    const randomWait = Math.floor(Math.random() * (30000 - 20000)) + 20000; // Between 20 and 30 seconds
                    console.log(chalk.hex('#6A737D')(`Waiting for ${randomWait} milliseconds to simulate user behavior...`)); // Dark Gray
                    await delay(randomWait); // Use the delay function for the wait time

                    console.log(chalk.hex('#28A745')(`Visit ${visit + 1} completed.`)); // Green
                    console.log(chalk.hex('#0366D6')(`Progress: ${visit + 1}/${visitCount} visits completed.`)); // Dark Blue
                    break; // Exit loop if successful
                } catch (error) {
                    retries++;
                    totalRetries++;
                    console.error(chalk.hex('#EA3A2D')(`Attempt ${retries} failed: ${error.message}`)); // Red
                    if (retries === MAX_RETRIES) {
                        console.error(chalk.hex('#EA3A2D')('Max retries reached for this visit, moving to the next one.')); // Red
                    } else {
                        console.log(chalk.hex('#6A737D')('Retrying...')); // Dark Gray
                        await delay(2000); // Wait 2 seconds before retrying
                    }
                }
            }

            // Provide feedback during execution
            console.log(chalk.hex('#0366D6')(`Completed ${visit + 1} out of ${visitCount} visits.`)); // Dark Blue
        }

        // Summary of successful visits
        console.log(chalk.hex('#0366D6').bold(`Total successful visits: ${successCount}`)); // Dark Blue
        console.log(chalk.hex('#EA3A2D').bold(`Total retries made: ${totalRetries}`)); // Red
    } catch (error) {
        console.error(chalk.hex('#EA3A2D')('An unexpected error occurred:'), error); // Red
    } finally {
        if (browser) {
            console.log(chalk.hex('#28A745')('Closing the browser...')); // Green
            await browser.close();
            console.log(chalk.hex('#28A745')('Browser closed.')); // Green
        }
        console.log(chalk.hex('#0366D6').bold('Script execution completed.')); // Dark Blue
    }
})();

// Shutdown on Ctrl+C
process.on('SIGINT', async () => {
    console.log(chalk.hex('#6A737D')('Caught interrupt signal (Ctrl+C). Closing the browser...')); // Dark Gray
    if (browser) {
        await browser.close();
        console.log(chalk.hex('#28A745')('Browser closed.')); // Green
    }
    process.exit(0); // Exit
});
