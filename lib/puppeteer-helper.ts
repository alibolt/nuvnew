// Helper to check if Puppeteer is available
export async function isPuppeteerAvailable(): Promise<boolean> {
  try {
    await import('puppeteer');
    return true;
  } catch (error) {
    console.log('Puppeteer not available, using fallback scraper');
    return false;
  }
}

// Get launch options based on environment
export function getPuppeteerLaunchOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const options: any = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  };

  // In production with Docker
  if (isProduction && process.env.PUPPETEER_EXECUTABLE_PATH) {
    options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // In development, use default chromium
  // Puppeteer will download chromium automatically

  return options;
}