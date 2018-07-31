import { ManagedKeyServices } from './serviceInterfaces';
import { CsrfTokenPair } from '../types/csrfTokenPair';

export class AwsManagedKeyServices implements ManagedKeyServices {
    getCsrfToken(): Promise<CsrfTokenPair> {
        return Promise.resolve({
            cookieToken: '1234567890==',
            formToken: '1234567890=='
        });
    }
}