const AWS = require('aws-sdk');
const fs = require('fs');

const kmsMasterKeyId = 'arn:aws:kms:us-east-1:257953708933:key/b9cb1425-986a-4aec-9a83-72cdc6dba044';
const kmsClient = new AWS.KMS({
    apiVersion: 'latest',
    region: 'us-east-1'
    //credentialProvider: new AWS.SharedIniFileCredentials()
});
const dataKeyFilename = 'dataKey.yml';
if (fs.existsSync(dataKeyFilename)) {
    console.log('Data Key has been generated, do not run this script if the data key is alrady in use.');
    process.exit(1);
}
const writeDataKey = async function (cipherTextBlob) {
    return new Promise(function (resolve, reject) {
        let writeStream = fs.createWriteStream(dataKeyFilename,{ encoding: 'utf8', autoClose: true });
        writeStream.on('error', (err) => {
            console.log(`Error writing to file ${dataKeyFilename}`);
            console.log(JSON.stringify(err));
            reject(err);
        });
        writeStream.on('finish', () => {
            console.log('All writes are now complete.');
            resolve();
        });
        writeStream.write(`dataKey: ${cipherTextBlob.toString('base64')}\n`);
        writeStream.end();
    });
};
const generateDataKeyWithoutPlaintext = async function () {
    return new Promise(function (resolve, reject) {
        try {
            kmsClient.generateDataKeyWithoutPlaintext({
                KeyId: kmsMasterKeyId,
                NumberOfBytes: 32
            },
            (err, response) => {
                if (err) {
                    reject(new Error(JSON.stringify(err)));
                }
                else {
                    resolve(response.CiphertextBlob);
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
};

try {
    (async function () {
        let blob = await generateDataKeyWithoutPlaintext();
        await writeDataKey(blob);
    })();
}
catch (err) {
    console.error(err.stack);
}