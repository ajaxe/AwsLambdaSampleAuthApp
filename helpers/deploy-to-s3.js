const Bundler = require('parcel-bundler');
const AWS = require("aws-sdk"); // imports AWS SDK
const mime = require('mime-types') // mime type resolver
const fs = require("fs"); // utility from node.js to interact with the file system
const path = require("path"); // utility from node.js to manage file/folder paths

const file = path.join(__dirname, '../src/web/index.html');
const deployPath = "dist/s3-deploy"
const assetFolderName = "assets";

// Bundler options: https://parceljs.org/api.html
const options = {
    outDir: './' + deployPath, // The out directory to put the build files in, defaults to dist
    outFile: 'index.html', // The name of the outputFile
    publicUrl: './' + assetFolderName, // The url to server on, defaults to dist
    watch: false, // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    cache: false, // Enabled or disables caching, defaults to true
    cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
    contentHash: false, // Disable content hash from being included on the filename
    minify: true, // Minify files, enabled if process.env.NODE_ENV === 'production'
    target: 'browser', // browser/node/electron, defaults to browser
    https: true, // Serve files over https or http, defaults to false
    logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
    hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: true, // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
    hmrHostname: '', // A hostname for hot module reload, default to ''
    detailedReport: true, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    production: true
};

// configuration necessary for this script to run
const config = {
    s3BucketName: 'aws-lambda-sample-auth-app',
    folderPath: '../' + deployPath // path relative script's location
},
    // initialise S3 client
    s3 = new AWS.S3({
        signatureVersion: 'v4'
    }),
    // resolve full folder path
    distFolderPath = path.join(__dirname, config.folderPath);

async function runBundle() {
    // Initializes a bundler using the entrypoint location and options provided
    const bundler = new Bundler(file, options);

    let result = new Promise(function(resolve, reject) {
        let buildSuccess = true;
        bundler.on('bundled', (bundle) => {
            console.log('bundled');
        })
        .on('buildError', function(error){
            buildSuccess = false;
            console.log('Error: ' + JSON.stringify(error));
        })
        .on('buildEnd', () =>{
            console.log('buildEnd');
            if(buildSuccess) {
                resolve();
            }
            else {
                reject();
            }
        });
    });
    // Run the bundler, this returns the main bundle
    // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
    const bundle = await bundler.bundle();

    return result;
}

// Normalize \\ paths to / paths.
function unixifyPath(filepath) {
    return process.platform === 'win32' ? filepath.replace(/\\/g, '/') : filepath;
};

// Recurse into a directory, executing callback for each file.
function walk(rootdir, callback, subdir) {
    // is sub-directory
    const isSubdir = subdir ? true : false;
    // absolute path
    const abspath = subdir ? path.join(rootdir, subdir) : rootdir;

    // read all files in the current directory
    let files = fs.readdirSync(abspath);

    files.forEach((filename) => {
        let isAsset = filename !== options.outFile;
        // full file path
        const filepath = path.join(abspath, filename);
        // check if current path is a directory
        if (fs.statSync(filepath).isDirectory()) {
            walk(rootdir, callback, unixifyPath(path.join(subdir || '', filename || '')))
        } else {
            fs.readFile(filepath, (error, fileContent) => {
                // if unable to read file contents, throw exception
                if (error) {
                    throw error;
                }

                // map the current file with the respective MIME type
                const mimeType = mime.lookup(filepath)
                let fileKey = isSubdir ? `${subdir}/${filename}` : filename;
                if (isAsset) {
                    fileKey = `${assetFolderName}/${fileKey}`;
                }
                // build S3 PUT object request
                const s3Obj = {
                    // set appropriate S3 Bucket path
                    Bucket: config.s3BucketName,
                    Key: fileKey,
                    Body: fileContent,
                    ContentType: mimeType
                }

                // upload file to S3
                s3.putObject(s3Obj, (err, res) => {
                    if(err) {
                        throw err;
                    }
                    console.log(`Successfully uploaded '${filepath}' with MIME type '${mimeType}'`)
                    callback();
                });
            });
        }
    });
    return files.length;
}

function deployToS3() {
    return new Promise(function (resolve, reject) {
        try {
            let counter = 0;
            console.log('start upload process');
            counter = walk(distFolderPath, (filepath, rootdir, subdir, filename) => {
                counter = counter - 1;
                if(counter <= 0) {
                    resolve();
                    console.log('start upload process: complete');
                }
            });
        }
        catch (err) {
            reject(err.stack);
        }
    });
}

(async function(){
    await runBundle();
    await deployToS3();
})();
