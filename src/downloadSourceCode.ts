const pacote = require('pacote');
const path = require('path');
const fs = require('fs');
import { Worker } from 'worker_threads';
import os from 'os';

// const CONCURRENCY_LIMIT = 8; // Adjust this value based on server's capacity
const CONCURRENCY_LIMIT = os.cpus().length; // Use all available cores

// Helper function to get the current timestamp
function getTimestamp(): string {
    const now = new Date();
    return now.toISOString(); // Example: '2023-06-27T14:00:00.000Z'
}

async function downloadPackageSource(packageName: string, targetDirectory: string) {
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

async function downloadAllPackagesSourceOld(packageNames: string[], targetDownloadDirectory: string) {
    console.log(`[${getTimestamp()}] [INFO] Starting download of ${packageNames.length} packages to ${targetDownloadDirectory}`);

    const queue: (() => Promise<void>)[] = [];
    let activeCount = 0;

    const enqueue = async (packageName: string) => {
        activeCount++;
        try {
            await downloadPackageSource(packageName, targetDownloadDirectory);
        } catch (error) {
            console.error(`[${getTimestamp()}] [ERROR] Error in enqueue for package "${packageName}":`, error);
        }
        activeCount--;

        if (queue.length > 0) {
            const nextTask = queue.shift();
            if (nextTask) nextTask();
        }
    };

    for (let index = 206400; index < packageNames.length; index++) {
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`[${getTimestamp()}] [INFO] All packages have been downloaded.`);
}

function createWorker(packageName: string, targetDirectory: string) {
    return new Promise<void>((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, './worker.ts'), {
            workerData: { packageName, targetDirectory }
        });

        worker.on('message', (message) => {
            if (message.status === 'done') {
                resolve();
            }
        });

        worker.on('error', (error) => {
            console.error(`[${getTimestamp()}] [ERROR] Worker error for package "${packageName}":`, error);
            reject(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`[${getTimestamp()}] [ERROR] Worker stopped with exit code ${code} for package "${packageName}"`);
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function downloadAllPackagesSource(packageNames: string[], targetDownloadDirectory: string) {
    console.log(`[${getTimestamp()}] [INFO] Starting download of ${packageNames.length} packages to ${targetDownloadDirectory} with max cores ${CONCURRENCY_LIMIT}`);

    const queue: (() => Promise<void>)[] = [];
    let activeCount = 0;

    const enqueue = async (packageName: string) => {
        activeCount++;
        try {
            await createWorker(packageName, targetDownloadDirectory);
        } catch (error) {
            console.error(`[${getTimestamp()}] [ERROR] Error in enqueue for package "${packageName}":`, error);
        }
        activeCount--;

        if (queue.length > 0) {
            const nextTask = queue.shift();
            if (nextTask) nextTask();
        }
    };

    for (let index = 216900; index < packageNames.length; index++) {
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

    while (activeCount > 0 || queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[${getTimestamp()}] [INFO] All packages have been downloaded.`);
}


// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${getTimestamp()}] [ERROR] Unhandled Rejection at:`, promise, 'reason:', reason);
});


export {
    downloadAllPackagesSource
}
