const pacote = require('pacote');
const path = require('path');

async function downloadPackageSource(packageName: any, targetDirectory: any) {
    try {
        const packageData = await pacote.manifest(packageName);
        const packageVersion = packageData.version;
        const packagePath = path.join(`${targetDirectory}/${packageName}`, `${packageName}@${packageVersion}`);

        await pacote.extract(packageName, packagePath);

        console.log(`Package "${packageName}" downloaded to ${packagePath}`);
    } catch (error) {
        console.error(`Error downloading package "${packageName}":`, error);
    }
}

async function downloadAllPackagesSource(packageNames: any, targetDownloadDirectory: any) {
    for (let index = 0; index < packageNames.length; index++) {
        console.log(`Started downloading source code for package: ${packageNames[index]}`);
        await downloadPackageSource(packageNames[index], targetDownloadDirectory);
    }
}

export {
    downloadAllPackagesSource
}
