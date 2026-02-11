import puppeteer from "puppeteer";

import { PUPPETEER } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";
import { assertExternalUrl } from "./urlUtils.js";

const captureFullPage = async (url) => {
  assertExternalUrl(url);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
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
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: PUPPETEER.VIEWPORT_WIDTH,
        height: PUPPETEER.MAX_CAPTURE_HEIGHT,
      },
    });

    const base64 = screenshotBuffer.toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      throw new AppError("VALIDATION_URL_INVALID");
    }

    if (error.message.includes("Timeout")) {
      throw new AppError("PUPPETEER_PAGE_TIMEOUT");
    }

    throw new AppError("PUPPETEER_CAPTURE_FAILED");
  } finally {
    await browser.close();
  }
};

export { captureFullPage };
