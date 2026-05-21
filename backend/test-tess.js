const { createWorker } = require('tesseract.js');
const path = require('path');
async function test() {
  try {
    const worker = await createWorker('eng', 1, {
      langPath: path.join(process.cwd())
    });
    console.log("Worker initialized");
    await worker.terminate();
  } catch (e) {
    console.error(e);
  }
}
test();
