import { AssetResponse } from '../types/assetResponse';
import { CsrfTokenPair } from '../types/csrfTokenPair';

export interface FileServices {
    getIndexHtml(): Promise<AssetResponse>;

    getAsset(fileKey: string): Promise<AssetResponse>;
}

export interface ManagedKeyServices {
    getCsrfToken(): Promise<CsrfTokenPair>;
}