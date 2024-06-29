const pacote = require('pacote');
const path = require('path');
const fs = require('fs');

const CONCURRENCY_LIMIT = 1000; // Adjust this value based on server's capacity

// Helper function to get the current timestamp
function getTimestamp(): string {
    const now = new Date();
    return now.toISOString(); // Example: '2023-06-27T14:00:00.000Z'
}

async function downloadPackageSource(packageName: string, targetDirectory: string) {
    console.log(`[${getTimestamp()}] [INFO] Starting download for package "${packageName}"`);
    try {
        const packageData = await pacote.manifest(packageName);
        console.log(`[${getTimestamp()}] [INFO] Manifest fetched for package "${packageName}": version ${packageData.version}`);
        const packageVersion = packageData.version;
        const packagePath = path.join(`${targetDirectory}/${packageName}`, `${packageName}@${packageVersion}`);
        if (fs.existsSync(packagePath)) {
            console.log(`[${getTimestamp()}] [INFO] Package "${packageName}", version: ${packageVersion} is already downloaded to ${packagePath}`);
        } else {
            console.log(`[${getTimestamp()}] [INFO] Extracting package "${packageName}" to ${packagePath}`);
            await pacote.extract(packageName, packagePath);
            console.log(`[${getTimestamp()}] [INFO] Package "${packageName}" downloaded to ${packagePath}`);
        }
    } catch (error) {
        console.error(`[${getTimestamp()}] [ERROR] Error downloading package "${packageName}":`, error);
    }
}

async function downloadAllPackagesSource(packageNames: string[], targetDownloadDirectory: string) {
    console.log(`[${getTimestamp()}] [INFO] Starting download of ${packageNames.length} packages to ${targetDownloadDirectory}`);

    const queue: (() => Promise<void>)[] = [];
    let activeCount = 0;

    const enqueue = async (packageName: string) => {
        activeCount++;
        await downloadPackageSource(packageName, targetDownloadDirectory);
        activeCount--;

        if (queue.length > 0) {
            const nextTask = queue.shift();
            if (nextTask) nextTask();
        }
    };

    for (let index = 0; index < packageNames.length; index++) {
        if (activeCount >= CONCURRENCY_LIMIT) {
            await new Promise<void>((resolve) => {
                queue.push(() => {
                    resolve(enqueue(packageNames[index]));
                    return Promise.resolve();
                });
            });
        } else {
            enqueue(packageNames[index]);
        }
        console.log(`[${getTimestamp()}] [INFO] Queueing download ${index + 1}/${packageNames.length} for package: ${packageNames[index]}`);
    }

    // Wait for all active tasks and queued tasks to complete
    while (activeCount > 0 || queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[${getTimestamp()}] [INFO] All packages have been downloaded.`);
}

export {
    downloadAllPackagesSource
}
