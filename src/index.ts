import { downloadAllPackagesSource } from './downloadSourceCode';
import { fetchAllPackageMetadata, fetchAllPackageMetadataNew } from './fetchPackageMetadata';
import { checkDependencies } from './checkDependencies';
import { checkNpmPackage } from './findVulnerability';
import { getNpmPackagePopularity } from './getPackagePopularity';
import { fetchAndSaveNpmDocs } from './fetchAndSaveNpmDocs';
const packageNames = require("all-the-package-names");

// Local testing for first 50 packages
// const allPackageNames = packageNames.slice(0, 50);
const fetchAllNpmDocs = false;
const enableDownloadSourceCode = true;
const enableDownloadMetaData = false;
const enableCheckDependences = false;
const enableGetNPMPackagePopularity = false;
const targetDownloadDirectory = './data/downloaded_packages_source_code';
const targetMetadataDirectory = './data/metadata';
const localMetadataPackagesLatestVersion = './data/localPackagesLatestVersion.json'
const batchSize = 1000; // Number of packages to process in each batch

const allPackageNames = packageNames;
// Local testing for most popular 50 packages
// const allPackageNames = [
//     "lodash",
//     "chalk",
//     "request",
//     "commander",
//     "react",
//     "express",
//     "debug",
//     "async",
//     "fs-extra",
//     "moment",
//     "prop-types",
//     "react-dom",
//     "bluebird",
//     "underscore",
//     "vue",
//     "axios",
//     "tslib",
//     "mkdirp",
//     "glob",
//     "yargs",
//     "colors",
//     "inquirer",
//     "webpack",
//     "uuid",
//     "classnames",
//     "minimist",
//     "body-parser",
//     "rxjs",
//     "babel-runtime",
//     "jquery",
//     "yeoman-generator",
//     "through2",
//     "babel-core",
//     "core-js",
//     "semver",
//     "babel-loader",
//     "cheerio",
//     "rimraf",
//     "q",
//     "eslint",
//     "css-loader",
//     "shelljs",
//     "dotenv",
//     "typescript",
//     "@types/node",
//     "@angular/core",
//     "js-yaml",
//     "style-loader",
//     "winston",
//     "@angular/common",
//     "redux"
// ];


async function main() {
    try {
        // const percentCompleted = Math.round((allPackageNames.indexOf('react-native-open-pdf') * 100) / allPackageNames.length);
        // console.log(`Downloaded: ${percentCompleted}% - ${allPackageNames.indexOf('react-native-open-pdf')} from total: ${allPackageNames.length}`);
        if (fetchAllNpmDocs){
            await fetchAndSaveNpmDocs();
        }
        if (enableDownloadMetaData) {
            await fetchAllPackageMetadata(allPackageNames, targetMetadataDirectory, batchSize, localMetadataPackagesLatestVersion);
            // await fetchAllPackageMetadataNew();
        }
        if (enableDownloadSourceCode) {
            await downloadAllPackagesSource(allPackageNames, targetDownloadDirectory);
        }
        if (enableCheckDependences) {
            const packageDir = './data/downloaded_packages/eslint/eslint@9.2.0';
            checkDependencies(packageDir, true); // For devDependencies
            checkDependencies(packageDir, false); // For dependencies
        }
        if (enableGetNPMPackagePopularity) {
            const packageName = 'react';
            const startDate = '2024-05-05';
            const endDate = '2024-05-17';

            await getNpmPackagePopularity(packageName, startDate, endDate);
        }

        //TODO implement Vulnerabilities checker
        if (false) {
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