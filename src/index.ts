import { downloadAllPackagesSource } from './downloadSourceCode';
import { fetchAllPackageMetadata } from './fetchPackageMetadata';
import { checkDependencies } from './checkDependencies';
import { checkNpmPackage } from './findVulnerability';
const packageNames = require("all-the-package-names");

// Local testing for first 50 packages
const allPackageNames = packageNames.slice(0, 50);
const enableDownloadSourceCode = true;
const enableDownloadMetaData = true;
const enableCheckDependences = true;
const targetDownloadDirectory = './data/downloaded_packages';
const targetMetadataDirectory = './data/metadata';
const localMetadataPackagesLatestVersion = './data/localPackagesLatestVersion.json'
const batchSize = 1000; // Number of packages to process in each batch

async function main() {
    try {
        if (enableDownloadMetaData) {
            await fetchAllPackageMetadata(allPackageNames, targetMetadataDirectory, batchSize, localMetadataPackagesLatestVersion);
        }
        if (enableDownloadSourceCode) {
            await downloadAllPackagesSource(allPackageNames, targetDownloadDirectory);
        }
        if (enableCheckDependences) {
            const packageDir = './data/downloaded_packages/-adisagar2003-react-share-on-social/-adisagar2003-react-share-on-social@1.0.9'; // Replace with the path to your package directory
            checkDependencies(packageDir, true); // For devDependencies
            checkDependencies(packageDir, false); // For dependencies
        }
        if (true) {
            const packageName = "react";
            checkNpmPackage(packageName)
                .then((advisory) => {
                    if (advisory) {
                        console.log("Advisory found for package:", advisory);
                    } else {
                        console.log("No advisory found for package.");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    } catch (error) {
        console.error(`Failed to fetch or save package metadata: ${error}`);
    }
}

main();