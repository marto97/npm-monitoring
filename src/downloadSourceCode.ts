const pacote = require('pacote');
const path = require('path');
const fs = require('fs');

async function downloadPackageSource(packageName: string, targetDirectory: string) {
    console.log(`[INFO]: [${new Date().toISOString()}]: Starting download for package "${packageName}"`);
    try {
        const packageData = await pacote.manifest(packageName);
        console.log(`[INFO]: [${new Date().toISOString()}]: Manifest fetched for package "${packageName}": version ${packageData.version}`);
        const packageVersion = packageData.version;
        const packagePath = path.join(`${targetDirectory}/${packageName}`, `${packageName}@${packageVersion}`);
        if (fs.existsSync(packagePath)) {
            console.log(`[INFO]: [${new Date().toISOString()}]: Package "${packageName}", version: ${packageVersion} is already downloaded to ${packagePath}`);
        } else {
            console.log(`[INFO]: [${new Date().toISOString()}]: Extracting package "${packageName}" to ${packagePath}`);
            await pacote.extract(packageName, packagePath);
            console.log(`[INFO]: [${new Date().toISOString()}]: Package "${packageName}" downloaded to ${packagePath}`);
        }
    } catch (error) {
        console.error(`[ERROR]: [${new Date().toISOString()}]: Error downloading package "${packageName}":`, error);
    }
}

async function downloadAllPackagesSource(packageNames: any, targetDownloadDirectory: string) {
    console.log(`[INFO]: [${new Date().toISOString()}]: Starting download of ${packageNames.length} packages to ${targetDownloadDirectory}`);

    const downloadPromises = packageNames.map((packageName: string, index: number) => {
        console.log(`[INFO]: [${new Date().toISOString()}]: Queueing download ${index + 1}/${packageNames.length} for package: ${packageName}`);
        return downloadPackageSource(packageName, targetDownloadDirectory);
    });

    await Promise.all(downloadPromises);
    console.log(`[INFO]: [${new Date().toISOString()}]: All packages have been downloaded.`);
}

export {
    downloadAllPackagesSource
}
