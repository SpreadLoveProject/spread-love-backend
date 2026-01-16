import puppeteer from "puppeteer";

import { PUPPETEER } from "../constants/common.js";
import { ERROR_MESSAGE } from "../constants/errorCodes.js";

const captureFullPage = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: PUPPETEER.VIEWPORT_WIDTH,
      height: PUPPETEER.VIEWPORT_HEIGHT,
    });
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PUPPETEER.PAGE_LOAD_TIMEOUT_MS,
    });

    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });

    const base64 = screenshotBuffer.toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      throw new Error(ERROR_MESSAGE.INVALID_URL);
    }

    if (error.message.includes("Timeout")) {
      throw new Error(ERROR_MESSAGE.PAGE_LOAD_TIMEOUT);
    }

    throw new Error(`${ERROR_MESSAGE.PAGE_CAPTURE_FAILED}: ${error.message}`);
  } finally {
    await browser.close();
  }
};

export { captureFullPage };
