import { downloadPackageSource } from './downloadSourceCode';
import { DateTime } from 'luxon';
const packageNames = require("all-the-package-names");
const axios = require('axios');
const fs = require('fs')

const enableDownloadSourceCode = true;
const enableDownloadMetaData = false;
const targetDownloadDirectory = './data/downloaded_packages';
const batchSize = 1000; // Number of packages to process in each batch

async function fetchPackageMetadata(packageNamesBatch: string[], batchIndex: number, folderName: string): Promise<void> {
    try {
        const metadataPromises = packageNamesBatch.map(async packageName => {
            try {
                const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
                return response.data;
            } catch (error) {
                console.error(`Failed to fetch metadata for package '${packageName}': ${error}`);
                return null;
            }
        });
        const batchMetadata = await Promise.all(metadataPromises);
        const timestamp = DateTime.local().toFormat('yyyyMMddHHmmss');
        const metadataFile = `./${folderName}/package_metadata_batch_${batchIndex}_${timestamp}.json`;
        fs.writeFileSync(metadataFile, JSON.stringify(batchMetadata, null, 2));
        console.log(`Package metadata for batch ${batchIndex} saved to ${metadataFile}`);
    } catch (error) {
        console.error(`Failed to process batch ${batchIndex}: ${error}`);
    }
}

async function main() {
    try {

        if (enableDownloadMetaData) {
            const currentDate = DateTime.local().toFormat('yyyyMMdd');
            const folderName = `./data/metadata/metadata_${currentDate}`;
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName);
            }
            const totalPackages = packageNames.length;
            const batches = Math.ceil(totalPackages / batchSize);

            for (let i = 0; i < batches; i++) {
                const startIdx = i * batchSize;
                const endIdx = Math.min((i + 1) * batchSize, totalPackages);
                const packageNamesBatch = packageNames.slice(startIdx, endIdx);

                await fetchPackageMetadata(packageNamesBatch, i + 1, folderName);
                console.log(`Processed batch ${i + 1}/${batches}`);
            }
        }
        if (enableDownloadSourceCode) {
            //TODO remove "index < 5 &&" when finish local testing
            for (let index = 0; index < 5 && index < packageNames.length; index++) {
                console.log(`Started downloading source code for package: ${packageNames[index]}`);
                await downloadPackageSource(packageNames[index], targetDownloadDirectory);
            }
        }
    } catch (error) {
        console.error(`Failed to fetch or save package metadata: ${error}`);
    }
}

main();