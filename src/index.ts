import { downloadAllPackagesSource } from './downloadSourceCode';
import { fetchAllPackageMetadata } from './fetchPackageMetadata';
const packageNames = require("all-the-package-names");

// Local testing for first 50 packages
const allPackageNames = packageNames.slice(0, 50);
const enableDownloadSourceCode = true;
const enableDownloadMetaData = true;
const targetDownloadDirectory = './data/downloaded_packages';
const targetMetadataDirectory = './data/metadata';
const batchSize = 1000; // Number of packages to process in each batch

async function main() {
    try {
        if (enableDownloadMetaData) {
            await fetchAllPackageMetadata(allPackageNames, targetMetadataDirectory, batchSize);
        }
        if (enableDownloadSourceCode) {
            await downloadAllPackagesSource(allPackageNames, targetDownloadDirectory);
        }
    } catch (error) {
        console.error(`Failed to fetch or save package metadata: ${error}`);
    }
}

main();