import { S3, AWSError } from 'aws-sdk'
import { FileServices } from './serviceInterfaces'
import { ManagedKeyServices } from './serviceInterfaces';
import { AssetResponse } from '../types/assetResponse';
import { CsrfTokenPair } from '../types/csrfTokenPair';


const s3Client = new S3({
        apiVersion: 'latest'
    }),
    appBucketName = 'aws-lambda-sample-auth-app',
    indexFilename = 'index.html',
    csrfPlaceholderToken = "{{X-CSRF-TOKEN}}";

export class HostFileServices implements FileServices {

    constructor(public keyServices: ManagedKeyServices) { }

    private async getObject(request: S3.Types.GetObjectRequest, processor?: (data: string) => string): Promise<AssetResponse> {
        return new Promise<AssetResponse>(function (resolve, reject) {
            s3Client.getObject(request, (err: AWSError, data: S3.GetObjectOutput) => {
                if (err) {
                    reject(err);
                }
                else {
                    let buf: Buffer = <Buffer>data.Body;
                    if (buf) {
                        console.log('object content-type: ' + data.ContentType);
                        let encoding = 'base64',
                            isBase64Encoded = true,
                            ctype = data.ContentType;
                        if((/(json|javascript|css|html)/gi).test(data.ContentType)) {
                            encoding = 'utf8';
                            isBase64Encoded = false;
                            ctype = `${data.ContentType}; charset=UTF-8`;
                        }
                        let dataString: string = buf.toString(encoding),
                            response = new AssetResponse();
                        if(processor) {
                            response.body = processor(dataString);
                        }
                        else {
                            response.body = dataString;
                        }
                        response.isBase64Encoded = isBase64Encoded;
                        response.headers = {
                            "Content-Type": ctype
                        };
                        resolve(response);
                    }
                    else {
                        reject('Incorrect data format');
                    }
                }

            });
        });
    }

    async getIndexHtml(): Promise<AssetResponse> {
        let request: S3.Types.GetObjectRequest = {
            Bucket: appBucketName,
            Key: indexFilename
        };
        let token: CsrfTokenPair = await this.keyServices.getCsrfToken();
        let asset = await this.getObject(request, (d: string) =>{
            let regex: RegExp = new RegExp(csrfPlaceholderToken, 'g');
            return d.replace(regex, token.formToken);
        });
        asset.csrfTokens = token;
        return asset;
    }

    async getAsset(fileKey: string): Promise<AssetResponse> {
        if(fileKey && fileKey.endsWith('.map')) {
            let parts = fileKey.split('/');
            parts.shift();
            fileKey = parts.join('/');
        }
        let request: S3.Types.GetObjectRequest = {
            Bucket: appBucketName,
            Key: `assets/${fileKey}`
        };
        let asset = await this.getObject(request);
        return asset;
    }
}