const pacote = require('pacote');
const path = require('path');
const fs = require('fs');

async function downloadPackageSource(packageName: any, targetDirectory: any) {
    try {
        const packageData = await pacote.manifest(packageName);
        const packageVersion = packageData.version;
        const packagePath = path.join(`${targetDirectory}/${packageName}`, `${packageName}@${packageVersion}`);
        if (fs.existsSync(packagePath)) {
            console.log(`Package "${packageName}", version: ${packageVersion} is already downloaded to ${packagePath}`);
        } else {
            await pacote.extract(packageName, packagePath);
            console.log(`Package "${packageName}" downloaded to ${packagePath}`);
        }
    } catch (error) {
        console.error(`Error downloading package "${packageName}":`, error);
    }
}

async function downloadAllPackagesSource(packageNames: any, targetDownloadDirectory: any) {
    for (let index = 0; index < packageNames.length; index++) {
        console.log(`Started downloading ${index + 1}/${packageNames.length} source code for package: ${packageNames[index]}`);
        await downloadPackageSource(packageNames[index], targetDownloadDirectory);
    }
}

export {
    downloadAllPackagesSource
}
