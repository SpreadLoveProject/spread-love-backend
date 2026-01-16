import puppeteer from "puppeteer";

const captureFullPage = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });

    const base64 = screenshotBuffer.toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      throw new Error("유효하지 않은 URL입니다");
    }

    if (error.message.includes("Timeout")) {
      throw new Error("페이지 로딩 시간이 초과되었습니다");
    }

    throw new Error(`페이지 캡처에 실패했습니다: ${error.message}`);
  } finally {
    await browser.close();
  }
};

export { captureFullPage };
