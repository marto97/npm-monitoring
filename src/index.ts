import { downloadAllPackagesSource } from './downloadSourceCode';
import { fetchAllPackageMetadata } from './fetchPackageMetadata';
import { checkDependencies } from './checkDependencies';
import { checkNpmPackage } from './findVulnerability';
const packageNames = require("all-the-package-names");

// Local testing for first 50 packages
// const allPackageNames = packageNames.slice(0, 50);
const enableDownloadSourceCode = true;
const enableDownloadMetaData = true;
const enableCheckDependences = false;
const targetDownloadDirectory = './data/downloaded_packages';
const targetMetadataDirectory = './data/metadata';
const localMetadataPackagesLatestVersion = './data/localPackagesLatestVersion.json'
const batchSize = 1000; // Number of packages to process in each batch

// Local testing for most popular 50 packages
const allPackageNames = [
    "lodash",
    "chalk",
    "request",
    "commander",
    "react",
    "express",
    "debug",
    "async",
    "fs-extra",
    "moment",
    "prop-types",
    "react-dom",
    "bluebird",
    "underscore",
    "vue",
    "axios",
    "tslib",
    "mkdirp",
    "glob",
    "yargs",
    "colors",
    "inquirer",
    "webpack",
    "uuid",
    "classnames",
    "minimist",
    "body-parser",
    "rxjs",
    "babel-runtime",
    "jquery",
    "yeoman-generator",
    "through2",
    "babel-core",
    "core-js",
    "semver",
    "babel-loader",
    "cheerio",
    "rimraf",
    "q",
    "eslint",
    "css-loader",
    "shelljs",
    "dotenv",
    "typescript",
    "@types/node",
    "@angular/core",
    "js-yaml",
    "style-loader",
    "winston",
    "@angular/common",
    "redux"
  ]


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