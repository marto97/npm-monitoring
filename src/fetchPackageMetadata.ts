import { DateTime } from 'luxon';
import { checkIfExistsAndUpdatePackageInfoFile } from './checkLocalPackageVersion';
const axios = require('axios');
const fs = require('fs');

async function fetchPackageMetadata(packageNamesBatch: string[], batchIndex: number, folderName: string, localMetadataPackagesLatestVersion: string): Promise<void> {
    try {
        const metadataPromises = packageNamesBatch.map(async packageName => {
            try {
                const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
                const latestVersion = response.data['dist-tags'].latest;
                const check = await checkIfExistsAndUpdatePackageInfoFile(packageName, latestVersion, localMetadataPackagesLatestVersion);
                if (!check) {
                    return response.data;
                } else {
                    return null;
                }

            } catch (error) {
                console.error(`Failed to fetch metadata for package '${packageName}': ${error}`);
                return null;
            }
        });
        const batchMetadata = await Promise.all(metadataPromises);
        const filteredMetadata = batchMetadata.filter(metadata => metadata !== null);
        if (filteredMetadata.length > 0) {
            const timestamp = DateTime.local().toFormat('yyyyMMddHHmmss');
            const metadataFile = `./${folderName}/package_metadata_batch_${batchIndex}_${timestamp}.json`;
            fs.writeFileSync(metadataFile, JSON.stringify(filteredMetadata, null, 2));
            console.log(`Package metadata for batch ${batchIndex} saved to ${metadataFile}`);
        } else {
            console.log('No valid metadata to write to file.');
        }
    } catch (error) {
        console.error(`Failed to process batch ${batchIndex}: ${error}`);
    }
}

async function fetchAllPackageMetadata(packageNames: any, targetMetadataDirectory: any, batchSize: any, localMetadataPackagesLatestVersion: string) {
    const currentDate = DateTime.local().toFormat('yyyyMMdd');
    const folderName = `${targetMetadataDirectory}/metadata_${currentDate}`;
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const totalPackages = packageNames.length;
    const batches = Math.ceil(totalPackages / batchSize);

    for (let i = 0; i < batches; i++) {
        const startIdx = i * batchSize;
        const endIdx = Math.min((i + 1) * batchSize, totalPackages);
        const packageNamesBatch = packageNames.slice(startIdx, endIdx);

        console.log(`Starting batch ${i + 1}/${batches}`);
        await fetchPackageMetadata(packageNamesBatch, i + 1, folderName, localMetadataPackagesLatestVersion);
        console.log(`Completed batch ${i + 1}/${batches}`);
    }
}

export {
    fetchAllPackageMetadata
}
