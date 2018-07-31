import { AssetResponse } from '../types/assetResponse';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { AwsManagedKeyServices } from './awsManagedKeyServices';
import { HostFileServices } from './hostedFileService';

export class ServiceFactory {

    static getManagedKeyServices(): ManagedKeyServices {
        return new AwsManagedKeyServices();
    }

    static getFileServices(): FileServices {
        return new HostFileServices(this.getManagedKeyServices());
    }
}

export interface FileServices {
    getIndexHtml(): Promise<AssetResponse>;

    getAsset(fileKey: string): Promise<AssetResponse>;
}

export interface ManagedKeyServices {
    getCsrfToken(): Promise<CsrfTokenPair>;
}