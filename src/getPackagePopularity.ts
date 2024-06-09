// import fetch from 'node-fetch';

// interface NpmDownloads {
//   downloads: number;
//   start: string;
//   end: string;
//   package: string;
// }

// async function getNpmPackagePopularity(packageName: string, startDate: string, endDate: string): Promise<number> {
//   const url = `https://api.npmjs.org/downloads/period/${startDate}:${endDate}/${packageName}`;
  
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Error fetching data for package ${packageName}: ${response.statusText}`);
//     }

//     const data = await response.json() as { downloads: { downloads: number }[] };
//     const totalDownloads = data.downloads.reduce((acc, day) => acc + day.downloads, 0);

//    console.log(`Number of downloads from ${startDate} to ${endDate}: ${totalDownloads}`)
//     // .catch(error => console.error(`Failed to get package popularity: ${error.message}`));

//     return totalDownloads;
//   } catch (error) {
//     console.error(error);
//     return 0;
//   }
// }

// const packageName = 'react';
// const startDate = '2020-01-01';
// const endDate = '2024-01-01';

// getNpmPackagePopularity(packageName, startDate, endDate)
//   .then(downloads => console.log(`Number of downloads from ${startDate} to ${endDate}: ${downloads}`))
//   .catch(error => console.error(`Failed to get package popularity: ${error.message}`));

import axios from 'axios';

interface NpmDownloads {
  downloads: { downloads: number }[];
  start: string;
  end: string;
  package: string;
}

async function getNpmPackagePopularity(packageName: string, startDate: string, endDate: string): Promise<any> {
  const url = `https://api.npmjs.org/downloads/point/${startDate}:${endDate}/${packageName}`;
  console.log(`Fetching URL: ${url}`);  // Log the URL for debugging


  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`Error fetching data for package ${packageName}: ${response.statusText}`);
    }

    const data: NpmDownloads = response.data;
    // const totalDownloads = data.downloads.reduce((acc, day) => acc + day.downloads, 0);
    const totalDownloads = data.downloads;
    console.log(`Number of downloads from ${startDate} to ${endDate}: ${totalDownloads}`)
    return totalDownloads;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// const packageName = 'react';
// const startDate = '2020-01-01';
// const endDate = '2024-01-01';

// getNpmPackagePopularity(packageName, startDate, endDate)
//   .then(downloads => console.log(`Number of downloads from ${startDate} to ${endDate}: ${downloads}`))
//   .catch(error => console.error(`Failed to get package popularity: ${error.message}`));




export {
  getNpmPackagePopularity
}
