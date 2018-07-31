

export class AssetResponse {
    body: string;
    isBase64Encoded: boolean;
    headers?: {
        [header: string]: boolean | number | string;
    };
}