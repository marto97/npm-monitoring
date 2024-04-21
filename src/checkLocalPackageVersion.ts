const fs = require('fs');

interface PackageInfo {
    [packageName: string]: string; // packageName: latestVersion
}

async function checkIfExistsAndUpdatePackageInfoFile(packageName: string, latestVersion: string, filePath: any): Promise<boolean> {
    try {
        // Read existing package info from external file
        const existingPackageInfo: PackageInfo = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Check if packageName already exists in packageInfo
        if (existingPackageInfo.hasOwnProperty(packageName)) {
            // If the version is different, overwrite with the latest version
            if (existingPackageInfo[packageName] !== latestVersion) {
                existingPackageInfo[packageName] = latestVersion;
                // Write updated package info back to external file
                fs.writeFileSync(filePath, JSON.stringify(existingPackageInfo, null, 2), 'utf-8');
                console.log(`Updated version of ${packageName} to ${latestVersion}`);
                return false;
            }
            return true;
        } else {
            // If the packageName does not exist, append it
            existingPackageInfo[packageName] = latestVersion;
            // Write updated package info back to external file
            fs.writeFileSync(filePath, JSON.stringify(existingPackageInfo, null, 2), 'utf-8');
            console.log(`Added ${packageName} with version ${latestVersion}`);
            return false;
        }

    } catch (error) {
        console.error(`Error updating package info: ${error}`);
        throw error;
    }
}

export {
    checkIfExistsAndUpdatePackageInfoFile
}