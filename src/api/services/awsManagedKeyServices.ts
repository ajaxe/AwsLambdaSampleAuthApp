import { ManagedKeyServices } from './serviceInterfaces';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { KMS, AWSError } from 'aws-sdk'
import { AuthTokenRepository, UserRepository } from '../repository/repositoryInterfaces';
const njwt = require('njwt');
import crypto = require('crypto');
import uuidv4 = require('uuid/v4');
import { HashResult } from '../types/hashResult';
import { User } from '../types/user';
import { AuthToken } from '../types/authToken';
import { CommonConfig } from '../common/config';


const kmsClient = new KMS({ apiVersion: 'latest' });
const encryptedDataKey: string = process.env.dataKeyEnvVar;
const iv = new Buffer('76967d9d77f14dfa');
const algorithm = 'aes-256-ctr';
let decryptedDataKey: Buffer = null;

const encrypt = function (plaintText: string, dataKey: Buffer): string {
    let cipher = crypto.createCipheriv(algorithm, dataKey, iv);
    let crypted = cipher.update(plaintText, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
};
const decrypt = function (cipherText: string, dataKey: Buffer) {
    let decipher = crypto.createDecipheriv(algorithm, dataKey, iv);
    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
const getRandomToken = function (): string {
    return crypto.randomBytes(CommonConfig.csrfTokenLength).toString('hex');
}

export type TokenParts = { prefix: string, salt: string, token: string };

export class CsrfTokenGenerator {
    readonly algorithm = 'aes-256-ctr';
    readonly prefix: string = 'SampleApp';
    readonly dataKey: Buffer;
    private csrfTokenPair: CsrfTokenPair;

    constructor(dataKey: Buffer, csrfTokenPair?: CsrfTokenPair) {
        this.dataKey = dataKey;
        this.csrfTokenPair = csrfTokenPair;
    }
    private parseToken(csrfToken: string): string {
        let decrypted = decrypt(csrfToken, this.dataKey);
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

    decryptCsrfTokens(): CsrfTokenPair {
        return {
            formToken: this.parseToken(this.csrfTokenPair.formToken),
            cookieToken: this.parseToken(this.csrfTokenPair.cookieToken)
        };
    }

    generateCsrfTokens(): CsrfTokenPair {
        let token = getRandomToken();
        return {
            cookieToken: encrypt(this.formatToken(uuidv4(), token), this.dataKey),
            formToken: encrypt(this.formatToken(uuidv4(), token), this.dataKey)
        };
    }
}
export class AwsManagedKeyServices implements ManagedKeyServices {

    constructor(public authTokenRepo: AuthTokenRepository,
    public userRepo: UserRepository) { }

    getDataKey(): Promise<Buffer> {
        if (!!decryptedDataKey) {
            console.log('getDataKey(): Returning cached key');
            return Promise.resolve(decryptedDataKey);
        }
        return new Promise<Buffer>(function (resolve, reject) {
            kmsClient.decrypt({
                CiphertextBlob: Buffer.from(encryptedDataKey, 'base64')
            }, (err: AWSError, response: KMS.Types.GenerateRandomResponse) => {
                let isbuffer = !!response ? Buffer.isBuffer(response.Plaintext) : false;
                if (err || !isbuffer) {
                    decryptedDataKey = null;
                    let errString = !!err ? JSON.stringify(err) : 'Invalid plaintext type. Expect Buffer';
                    throw new Error('Error getDataKey(): ' + errString);
                }
                else {
                    let plainTextBuffer = <Buffer>response.Plaintext;
                    decryptedDataKey = plainTextBuffer
                    console.log('getDataKey() completed. key length: ' + decryptedDataKey.length);
                    resolve(decryptedDataKey);
                }
            });
        });
    }

    createHash(plainText: string, salt: string) {
        const hash = crypto.createHash('sha256');
        hash.update(`${plainText}${salt}`);
        let digest = hash.digest('base64');
        return digest;
    }

    async validateCsrfTokens(tokenPair: CsrfTokenPair): Promise<boolean> {
        let key = await this.getDataKey();
        let tokenGenerator = new CsrfTokenGenerator(key, tokenPair);
        let decryptedTokens = tokenGenerator.decryptCsrfTokens();
        return decryptedTokens.formToken === decryptedTokens.cookieToken;
    }

    async getCsrfToken(): Promise<CsrfTokenPair> {
        let key = await this.getDataKey();
        let tokenGenerator = new CsrfTokenGenerator(key);
        return tokenGenerator.generateCsrfTokens();
    }

    hashPassword(password: string): HashResult {
        let result = new HashResult();
        result.salt = getRandomToken();
        result.hashedValue = this.createHash(password, result.salt);
        return result;
    }

    /**
     * Verifies the plaint text password against perviously hashed string.
     *
     * @param plaintTextPassword {string} Plain text password to verify
     * @param hashedPassword {string} Hashed password check against
     */
    verifyPassword(plaintTextPassword: string, hashedPassword: string): boolean {
        console.log('Verifying password');
        let storeHash = HashResult.parse(hashedPassword);
        let currentHash: string = this.createHash(plaintTextPassword, storeHash.salt);
        let match = currentHash === storeHash.hashedValue;
        console.log('Verifying password: calculated & stored hash match? ' + match);
        return match;
    }

    async createAuthToken(user: User): Promise<AuthToken> {
        let expireDt = new Date();
        let newAuthToken = new AuthToken();
        let claims = {
            sub: user.userId,
            iss: CommonConfig.appUrl,
            username: user.username
        }
        console.log('setting jwt claims: ' + JSON.stringify(claims));
        let jwt = njwt.create(claims, await this.getDataKey());
        expireDt.setDate(expireDt.getDate() + CommonConfig.tokenExpireDays);
        jwt.setExpiration(expireDt.getTime());
        jwt.setNotBefore(new Date().getTime());
        console.log('jwt body: ' + JSON.stringify(jwt.body));
        newAuthToken.tokenId = jwt.body.jti;
        newAuthToken.tokenValue = jwt.compact();
        newAuthToken.expire = expireDt;
        let savedToken = await this.authTokenRepo.addAuthToken(newAuthToken);
        console.log('saved token id: ' + savedToken.tokenId);
        return savedToken;
    }

    async verifyJwt(token: string): Promise<any> {
        let dataKey = await this.getDataKey();
        return new Promise(function (resolve, reject) {
            njwt.verify(token, dataKey, function (err: any, verifiedJwt: any) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(verifiedJwt);
                }
            });
        });
    }

    async verifyAuthToken(token: string): Promise<boolean> {
        let self = this;
        return new Promise<boolean>(function (resolve, reject) {
            let p1 = self.verifyJwt(token);
            let p2 = p1.then(function (jwt) {
                let userId = jwt.body.sub;
                return self.userRepo.getUserById(userId);
            })
            let p3 = p1.then(function(jwt){
                return self.authTokenRepo.getAuthToken(jwt.body.jti)
            });
            Promise.all([p2, p3])
            .then(function(value: [User, AuthToken]) {
                // check user is active
                let user: User = value[0];
                let authToken = value[1];
                resolve(user.active && !!authToken && !authToken.isExpired());
            })
            .catch(function (err) {
                reject(err);
            });
        });
    }
}