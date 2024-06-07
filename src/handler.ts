import * as puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import chromium from '@sparticuz/chromium';

interface APIGatewayEvent {
  headers?: {
    [name: string]: string;
  };
  queryStringParameters?: {
    team?: string;
    pillar?: string;
    category?: string;
  };
}

export async function handler(event: APIGatewayEvent) {

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(process.env.AWS_EXECUTION_ENV
        ? '/opt/nodejs/node_modules/@sparticuz/chromium/bin'
        : undefined),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 360,
    height: 380
  })

  let fileContent;

  try {

    await page.goto('https://www.google.com/')

    // Wait 2 seconds for the page to load
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({
      path: '/tmp/screenshot.png'
    })

    fileContent = fs.readFileSync('/tmp/screenshot.png')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="screenshot.png"',
      },
      body: fileContent.toString('base64'),
      isBase64Encoded: true,
    }
  }
  catch (error: any) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
  finally {
    await page.close();
    await browser.close();
  }

}
