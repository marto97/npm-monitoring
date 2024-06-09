const fs = require('fs');

interface PackageInfo {
    [packageName: string]: string; // packageName: latestVersion
}

async function removePackage(packageName: string, filePath: any): Promise<boolean> {
    try {
        // Read existing package info from external file
        const existingPackageInfo: PackageInfo = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Check if packageName already exists in packageInfo
        if (existingPackageInfo.hasOwnProperty(packageName)) {
            // Remove the package entry
            delete existingPackageInfo[packageName];
            // Write updated package info back to external file
            fs.writeFileSync(filePath, JSON.stringify(existingPackageInfo, null, 2), 'utf-8');
            console.log(`Removed ${packageName} from package info`);

            // Log removed package to a separate JSON file
            // const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
            // const logFileName = `removedPackages_${currentDate}.json`;
            // const logFilePath = path.join(__dirname, logFileName);

            const logFileName = `removedPackages.json`;

            let removedPackages = [];
            if (fs.existsSync(logFileName)) {
                // If the log file exists, read its content
                const logFileContent = fs.readFileSync(logFileName, 'utf-8');
                removedPackages = JSON.parse(logFileContent);
            }

            // Add the removed package to the list
            removedPackages.push({ packageName, removalDate: new Date().toISOString() });

            // Write the updated list back to the log file
            fs.writeFileSync(logFileName, JSON.stringify(removedPackages, null, 2), 'utf-8');


            return true;
        } else {
            // Package not removed
            return false;
        }

    } catch (error) {
        console.error(`Error updating package info: ${error}`);
        throw error;
    }
}

export {
    removePackage
}