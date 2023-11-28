const puppeteer = require("puppeteer");

const takeScreenshot = async (videoUrl) => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  try {
    // Navigate to the video URL
    await page.goto(videoUrl);

    // Wait for the video to load (you might need to adjust the waiting time based on the video and network speed)
    await page.waitForTimeout(5000);

    // Take a screenshot as base64-encoded string
    const screenshotBase64 = await page.screenshot({ encoding: "base64" });

    // Convert the base64 string to a buffer
    const screenshotBuffer = Buffer.from(screenshotBase64, "base64");
    return screenshotBuffer;

    // You can now use the screenshotBuffer as needed

    // For example, you can log the buffer length
    // console.log("Screenshot buffer length:", screenshotBuffer.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
};

module.exports = { takeScreenshot };
