import { AssetResponse } from '../types/assetResponse';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { HashResult } from '../types/hashResult';
import { AuthToken } from '../types/authToken';
import { User } from '../types/user';

export interface FileServices {
    getIndexHtml(): Promise<AssetResponse>;

    getAsset(fileKey: string): Promise<AssetResponse>;
}

export interface ManagedKeyServices {
    getCsrfToken(): Promise<CsrfTokenPair>;
    validateCsrfTokens(tokenPair: CsrfTokenPair): Promise<boolean>;
    hashPassword(password: string): HashResult;
    /**
     * Verifies the plaint text password against perviously hashed string.
     *
     * @param plaintTextPassword {string} Plain text password to verify
     * @param hashedPassword {string} Hashed password, with salt, to check against
     *
     * @returns {boolean} Returns true if the passwords match
     */
    verifyPassword(plaintTextPassword: string, hashedPassword: string): boolean;

    createAuthToken(user: User): Promise<AuthToken>;

    verifyAuthToken(toke: string): Promise<boolean>;
}