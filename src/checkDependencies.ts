const axios = require('axios');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

interface DependencyInfo {
    name: string;
    version: string;
}

// TODO get it from local JSON file to reduce npm requests
// DONE add signs checks
async function getLatestPackageVersion(packageName: string): Promise<string | null> {
    try {
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
        return response.data['dist-tags'].latest;
    } catch (error) {
        console.error(`Failed to fetch latest version for package '${packageName}': ${error}`);
        return null;
    }
}

function readPackageJsonDependencies(packageDir: string, dev: boolean): DependencyInfo[] | null {
    try {
        const packageJsonPath = path.join(packageDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = dev ? packageJson.devDependencies : packageJson.dependencies;
        if (!dependencies) {
            return [];
        }
        return Object.entries(dependencies).map(([name, version]) => ({ name, version: version as string }));
    } catch (error) {
        console.error(`Error reading package.json in directory '${packageDir}': ${error}`);
        return null;
    }
}

async function checkDependencies(packageDir: string, dev: boolean): Promise<void> {
    const dependencies = readPackageJsonDependencies(packageDir, dev);
    if (!dependencies) {
        console.error(`No valid dependencies found in package.json in directory '${packageDir}'`);
        return;
    }

    for (const dependency of dependencies) {
        const latestVersion = await getLatestPackageVersion(dependency.name);
        if (!latestVersion) {
            console.error(`Failed to get latest version for package '${dependency.name}'`);
            continue;
        }

        if (semver.satisfies(latestVersion, dependency.version)) {
            console.log(`Package '${dependency.name}' is up to date. Used version: ${dependency.version}, Latest version: ${latestVersion}`);
        } else {
            console.log(`Package '${dependency.name}' is outdated. Used version: ${dependency.version}, Latest version: ${latestVersion}`);
        }
    }
}

export{
    checkDependencies
}
