import { ManagedKeyServices } from './serviceInterfaces';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { KMS, AWSError } from 'aws-sdk'
import { ConfigRepository } from '../repository/repositoryInterfaces';

const kmsClient = new KMS({ apiVersion: 'latest' });
const dataKey: string = process.env.DATA_KEY;

export class AwsManagedKeyServices implements ManagedKeyServices {

    constructor(public configRepo: ConfigRepository) { }

    getCsrfToken(): Promise<CsrfTokenPair> {
        return Promise.resolve({
            cookieToken: '1234567890==',
            formToken: '1234567890=='
        });
    }
}