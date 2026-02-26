import puppeteer from "puppeteer";

import { ARTICLE_TEXT, PUPPETEER } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";
import { assertExternalUrl } from "./urlUtils.js";

const capturePage = async (url, extractText = false) => {
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
      waitUntil: extractText ? "load" : "networkidle2",
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

    const imageDataUrl = `data:image/png;base64,${screenshotBuffer.toString("base64")}`;

    if (!extractText) return { imageDataUrl };

    const pageText = await page.evaluate((maxLength) => {
      /* eslint-disable no-undef */
      ["nav", "header", "footer", "aside", "script", "style"].forEach((tag) =>
        document.querySelectorAll(tag).forEach((el) => el.remove()),
      );
      return document.body.innerText.trim().slice(0, maxLength);
      /* eslint-enable no-undef */
    }, ARTICLE_TEXT.MAX_LENGTH);

    return { imageDataUrl, pageText: pageText || null };
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

export const captureFullPage = async (url) => {
  const { imageDataUrl } = await capturePage(url, false);
  return imageDataUrl;
};

export const capturePageWithText = async (url) => {
  return capturePage(url, true);
};
