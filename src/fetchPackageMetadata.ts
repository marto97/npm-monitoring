import { DateTime } from 'luxon';
import { checkIfExistsAndUpdatePackageInfoFile } from './checkLocalPackageVersion';
import { removePackage } from './removePackage';
import { appendFileSync, writeFileSync } from 'node:fs';
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

// TODO fix npm audit
async function runNpmAuditForPackage(packageName: string, folderName: string): Promise<void> {
    try {
        exec(`npm audit --json ${packageName}`, (error: any, stdout: string, stderr: any) => {
            if (error) {
                console.error(`Error running 'npm audit' for package '${packageName}': ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`'npm audit' for package '${packageName}' encountered an error: ${stderr}`);
                return;
            }

            const auditResults = JSON.parse(stdout);
            const timestamp = DateTime.local().toFormat('yyyyMMddHHmmss');
            const auditFile = `./${folderName}/${packageName}_npm_audit_results_${timestamp}.json`;

            fs.writeFileSync(auditFile, JSON.stringify(auditResults, null, 2));
            console.log(`'npm audit' results for package '${packageName}' saved to ${auditFile}`);
        });
    } catch (error) {
        console.error(`Error running npm audit for package '${packageName}':`, error);
    }
}

async function fetchPackageMetadata(packageNamesBatch: string[], batchIndex: number, folderName: string, localMetadataPackagesLatestVersion: string): Promise<void> {

    // const folderName = 'audit_results';

    try {
        const metadataPromises = packageNamesBatch.map(async packageName => {
            try {
                // TODO also check for removed packages     "description": "security holding package",
                //"repository": "npm/security-holder",

                const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
                const latestVersion = response.data['dist-tags'].latest;
                const check = await checkIfExistsAndUpdatePackageInfoFile(packageName, latestVersion, localMetadataPackagesLatestVersion);
                if (!check) {
                    return response.data;
                } else {
                    return null;
                }

            } catch (error) {
                //TODO remove package here
                const check = await removePackage(packageName, localMetadataPackagesLatestVersion);
                console.error(`Is package '${packageName}' removed? : ${check}`);
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

async function fetchAllPackageMetadataOld(packageNames: any, targetMetadataDirectory: any, batchSize: any, localMetadataPackagesLatestVersion: string) {
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

async function fetchAllPackageMetadata(packageNames: any, targetMetadataDirectory: any, batchSize: any, localMetadataPackagesLatestVersion: string) {

    const fileName = 'npm_all_docs9.json';
    writeFileSync(fileName, '[\n');  // Start the JSON array
    for (let index = 0; index < packageNames.length; index++) {

        try {
            let packageName = packageNames[index];
            console.time(`Step ${index + 1} time packageName: ${packageName}`);

            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            console.log(`[${new Date().toISOString()}], status:  ${response.status}, ${response.statusText}`);
            const jsonString = JSON.stringify(response.data, null, 2);

            appendFileSync(fileName, jsonString + (index < packageNames.length - 1 ? ',\n' : '\n'));
            console.timeEnd(`Step ${index + 1} time packageName: ${packageName}`);
        } catch (error) {
            console.log(`step ${index} packageName: ${packageNames[index]}`);
            console.log(error);
        }
    }

    appendFileSync(fileName, '{}]\n');  // Add an empty object to handle the trailing comma
    console.log(`All documents have been saved to ${fileName}`);
}

export {
    fetchAllPackageMetadata
}
