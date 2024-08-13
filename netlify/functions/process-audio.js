const { exec } = require('child_process');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const form = new formidable.IncomingForm();
    const uploadDir = '/tmp/';

    return new Promise((resolve, reject) => {
        form.uploadDir = uploadDir;
        form.keepExtensions = true;

        form.parse(event, (err, fields, files) => {
            if (err) {
                reject({
                    statusCode: 500,
                    body: 'Error parsing the files',
                });
                return;
            }

            const filePath = files.file.path;

            // Run Spleeter through a Python command
            exec(`spleeter separate -i ${filePath} -o ${uploadDir}`, (err, stdout, stderr) => {
                if (err) {
                    reject({
                        statusCode: 500,
                        body: 'Error processing the audio file: ' + stderr,
                    });
                    return;
                }

                const vocalsPath = path.join(uploadDir, 'vocals.wav');
                const accompanimentPath = path.join(uploadDir, 'accompaniment.wav');

                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        vocals: `/tmp/vocals.wav`,
                        accompaniment: `/tmp/accompaniment.wav`
                    }),
                });
            });
        });
    });
};
