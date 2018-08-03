import { ManagedKeyServices } from './serviceInterfaces';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { KMS, AWSError } from 'aws-sdk'
import { ConfigRepository } from '../repository/repositoryInterfaces';
import { GenerateRandomResponse } from '../../../node_modules/aws-sdk/clients/kms';
import crypto = require('crypto');
import uuidv4 = require('uuid/v4');


const kmsClient = new KMS({ apiVersion: 'latest' });
const encryptedDataKey: string = process.env.dataKeyEnvVar;
const csrfTokenLength = 32;
const iv = new Buffer('76967d9d77f14dfa');
let decryptedDataKey: string = '';

export type TokenParts = { prefix: string, salt: string, token: string };

export class CsrfTokenGenerator {
    readonly algorithm = 'aes-256-ctr';
    readonly prefix: string = 'SampleApp';
    readonly dataKey: Buffer;
    private csrfTokenPair: CsrfTokenPair;

    constructor(dataKey: string, csrfTokenPair?: CsrfTokenPair) {
        this.dataKey = Buffer.from(dataKey, 'base64');
        this.csrfTokenPair = csrfTokenPair;
    }
    private parseToken(csrfToken: string): string {
        let decrypted = this.decrypt(csrfToken);
        let tokenParts = this.deformatToken(decrypted);
        this.validatedToken(tokenParts);
        return tokenParts.token;
    }
    private validatedToken(tokenParts: TokenParts): void {
        if (tokenParts.salt && tokenParts.token && tokenParts.prefix === this.prefix) {
            return;
        }
        throw new Error('Invalid csrf token');
    }
    private deformatToken(token: string): TokenParts {
        let parts = token.split(';');
        return {
            token: parts.pop(),
            salt: parts.pop(),
            prefix: parts.pop()
        };
    }
    private formatToken(salt: string, token: string): string {
        return `${this.prefix};${salt};${token}`;
    }
    private getRandomToken(): string {
        return crypto.randomBytes(csrfTokenLength).toString('base64');
    }
    private encrypt(plaintText: string): string {
        let cipher = crypto.createCipheriv(this.algorithm, this.dataKey, iv);
        let crypted = cipher.update(plaintText, 'utf8', 'base64');
        crypted += cipher.final('base64');
        return crypted;
    }
    private decrypt(cipherText: string) {
        let decipher = crypto.createDecipheriv(this.algorithm, this.dataKey, iv);
        let decrypted = decipher.update(cipherText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    decryptCsrfTokens(): CsrfTokenPair {
        return {
            formToken: this.parseToken(this.csrfTokenPair.formToken),
            cookieToken: this.parseToken(this.csrfTokenPair.cookieToken)
        };
    }

    generateCsrfTokens(): CsrfTokenPair {
        let token = this.getRandomToken();
        return {
            cookieToken: this.encrypt(this.formatToken(uuidv4(), token)),
            formToken: this.encrypt(this.formatToken(uuidv4(), token))
        };
    }
}
export class AwsManagedKeyServices implements ManagedKeyServices {

    constructor(public configRepo: ConfigRepository) { }

    private getDataKey(): Promise<string> {
        if (!!decryptedDataKey) {
            console.log('getDataKey(): Returning cached key');
            return Promise.resolve(decryptedDataKey);
        }
        return new Promise<string>(function (reject, resolve) {
            kmsClient.decrypt({
                CiphertextBlob: Buffer.from(encryptedDataKey, 'base64')
            }, (err: AWSError, response: GenerateRandomResponse) => {
                let isbuffer = !!response ? Buffer.isBuffer(response.Plaintext) : false;
                if (err || !isbuffer) {
                    decryptedDataKey = null;
                    let errString = !!err ? JSON.stringify(err) : 'Invalid plaintext type. Expect Buffer';
                    console.error('Error getDataKey(): ' + errString);
                    reject(errString);
                }
                else {
                    let plainTextBuffer = <Buffer>response.Plaintext;
                    decryptedDataKey = plainTextBuffer.toString('base64');
                    console.log('getDataKey() completed. key length: ' + decryptedDataKey.length);
                    resolve(decryptedDataKey);
                }
            });
        });
    }

    async validateCsrfTokens(tokenPair: CsrfTokenPair): Promise<boolean> {
        let tokenGenerator = new CsrfTokenGenerator(await this.getDataKey(), tokenPair);
        let decryptedTokens = tokenGenerator.decryptCsrfTokens();
        return decryptedTokens.formToken === decryptedTokens.cookieToken;
    }

    async getCsrfToken(): Promise<CsrfTokenPair> {
        let key = await this.getDataKey();
        let tokenGenerator = new CsrfTokenGenerator(key);
        return tokenGenerator.generateCsrfTokens();
    }
}