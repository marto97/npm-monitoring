import axios from 'axios';
import { writeFileSync, appendFileSync } from 'fs';
import fetch from 'npm-registry-fetch';
import { createWriteStream, WriteStream } from 'fs';

// const url = 'https://replicate.npmjs.com/_all_docs';
const url = 'https://replicate.npmjs.com/_all_docs?include_docs=true';
const limit = 5;  // Number of documents per request
let step = 0;

async function fetchAndSaveNpmDocsOld() {
    try {
        // Fetch all documents from the npm registry
        const response = await axios.get(url);
        const data = response.data;

        // Save the data to a file
        writeFileSync('npm_all_docs.json', JSON.stringify(data, null, 2));

        console.log("All documents have been saved to npm_all_docs.json");
    } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
    }
}

async function fetchAndSaveNpmDocsOld2() {
    let hasMore = true;
    let lastDocId = '';
    const fileName = 'npm_all_docs2.json';
    writeFileSync(fileName, '[\n');  // Start the JSON array

    while (hasMore) {
        try {
            // Fetch a chunk of documents
            const response = await axios.get(url, {
                params: {
                    include_docs: true,
                    limit: limit,
                    startkey: JSON.stringify(lastDocId)
                }
            });
            const data = response.data;

            /*
            When fetching data in chunks, we use a limit parameter to specify the maximum number of documents to retrieve in one request.
            If the API returns exactly this number of documents, it likely means there are more documents to fetch.
            If fewer documents are returned, it means we've reached the end of the available data.
            */
            // Check if there are more documents
            hasMore = data.rows.length === limit;

            // Process and save the data
            const docs = data.rows.map((row: any) => row.doc);
            if (docs.length > 0) {
                appendFileSync(fileName, JSON.stringify(docs, null, 2).slice(1, -1) + ',\n');
                // Update the last document ID
                lastDocId = docs[docs.length - 1]._id;
            }

            step = step + 1;

            console.log(`Fetched and saved ${docs.length} documents. Step: ${step}`);
        } catch (error) {
            console.error(`Failed to fetch data: ${error}`);
            hasMore = false;
        }
    }

    // Close the JSON array properly
    appendFileSync(fileName, '{}]\n');  // Add an empty object to handle the trailing comma
    console.log("All documents have been saved to npm_all_docs.json");
}

// Worked but stopped at 8GB  without error and there are dublications
async function fetchAndSaveNpmDocsOld3() {
    let hasMore = true;
    let lastDocId = '';
    const fileName = 'npm_all_docs5.json';
    writeFileSync(fileName, '[\n');  // Start the JSON array

    console.time("Total time");

    while (hasMore) {
        console.time(`Step ${step + 1} time`);
        try {
            console.log(`limit: ${limit} startkey: ${lastDocId}`);
            // Fetch a chunk of documents
            const response = await axios.get(url, {
                params: {
                    include_docs: true,
                    limit: limit,
                    startkey: JSON.stringify(lastDocId)
                }
            });
            const data = response.data;

            // Check if there are more documents
            hasMore = data.rows.length === limit;

            // Process and save the data
            const docs = data.rows.map((row: any) => row.doc);
            if (docs.length > 0) {
                docs.forEach((doc: any, index: any) => {
                    const jsonString = JSON.stringify(doc, null, 2);
                    appendFileSync(fileName, jsonString + (hasMore || index < docs.length - 1 ? ',\n' : '\n'));
                });
                // Update the last document ID
                lastDocId = docs[docs.length - 1]._id;
            }

            step = step + 1;

            console.timeEnd(`Step ${step} time`);
            console.log(`Fetched and saved ${docs.length} documents. Step: ${step}`);
        } catch (error) {
            console.error(`Failed to fetch data: ${error}`);
            hasMore = false;
        }
    }

    // Close the JSON array properly
    appendFileSync(fileName, '{}]\n');  // Add an empty object to handle the trailing comma
    console.timeEnd("Total time");
    console.log("All documents have been saved to npm_all_docs.json");
}

const baseUrl = 'https://replicate.npmjs.com/_all_docs';
const outputFile = 'npm_packages_metadata_6.json';
const pageSize = 1000;

let hasMore = true;
let lastDocId = '';

async function fetchPage(startkey: string | null, outputFile: string) {
    console.time(`Step ${step + 1} time`);
    const queryParams = new URLSearchParams({
        include_docs: 'true',
        limit: pageSize.toString(),
    });
    if (startkey) {
        queryParams.set('startkey', JSON.stringify(startkey));
        queryParams.set('skip', '1'); // Skip the first item to avoid duplication
    }

    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log(`[${new Date().toISOString()}] Fetching: ${url}`);

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.rows.length === pageSize) {
        hasMore = true;
    } else {
        hasMore = false;
    }

    console.log(`[${new Date().toISOString()}] Fetched ${data.rows.length} rows. HasMore: ${hasMore}`);

    // Process and save the data
    const docs = data.rows.map((row: any) => row.doc);
    if (docs.length > 0) {
        docs.forEach((doc: any, index: any) => {
            const jsonString = JSON.stringify(doc, null, 2);
            appendFileSync(outputFile, jsonString + (hasMore || index < docs.length - 1 ? ',\n' : '\n'));
        });
        // Update the last document ID
        lastDocId = docs[docs.length - 1]._id;
    }

    step = step + 1;
    console.timeEnd(`Step ${step} time`);

    // Check if there's more data to fetch
    if (hasMore) {
        lastDocId = data.rows[data.rows.length - 1].id;
        console.log(`[${new Date().toISOString()}] Last key: ${lastDocId}`);

        await fetchPage(lastDocId, outputFile);
    }
}

async function fetchAndSaveNpmDocs() {
    console.time("Total time");
    // const writeStream: WriteStream = createWriteStream(outputFile, { flags: 'w' });
    // writeStream.write('');  // Start of the JSON array
    writeFileSync(outputFile, '[\n');  // Start the JSON array
    try {
        await fetchPage(null, outputFile);
    } catch (error) {
        console.error('An error occurred while fetching the data:', error);
    } finally {
        // writeStream.write('{}]');  // End of the JSON array (empty object as a hack to fix the trailing comma)
        // writeStream.end();
        appendFileSync(outputFile, '{}]\n');  // Add an empty object to handle the trailing comma
        console.log('All package metadata has been saved to', outputFile);
        console.timeEnd("Total time");
    }
}

export {
    fetchAndSaveNpmDocs
}

