// worker.js
const pacote = require('pacote');
const path = require('path');
const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');

function getTimestamp() {
    const now = new Date();
    return now.toISOString(); // Example: '2023-06-27T14:00:00.000Z'
}


async function downloadPackageSource(packageName, targetDirectory) {
    // console.log(`[${getTimestamp()}] [INFO] Starting download for package "${packageName}"`);
    try {
        const packageData = await pacote.manifest(packageName);
        // console.log(`[${getTimestamp()}] [INFO] Manifest fetched for package "${packageName}": version ${packageData.version}`);
        const packageVersion = packageData.version;
        const packagePath = path.join(`${targetDirectory}/${packageName}`, `${packageName}@${packageVersion}`);
        if (fs.existsSync(packagePath)) {
            console.log(`[${getTimestamp()}] [INFO] Package "${packageName}", version: ${packageVersion} is already downloaded to ${packagePath}`);
        } else {
            // console.log(`[${getTimestamp()}] [INFO] Extracting package "${packageName}" to ${packagePath}`);
            await pacote.extract(packageName, packagePath);
            console.log(`[${getTimestamp()}] [INFO] Package "${packageName}" downloaded to ${packagePath}`);
        }
    } catch (error) {
        console.error(`[${getTimestamp()}] [ERROR] Error downloading package "${packageName}":`, error);
    }
}

(async () => {
    const { packageName, targetDirectory } = workerData;
    await downloadPackageSource(packageName, targetDirectory);
    parentPort?.postMessage({ status: 'done' });
})();
