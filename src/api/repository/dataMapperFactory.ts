import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB = require('aws-sdk/clients/dynamodb');

export default function dataMapperFactory(endpointUrl?: string) {
    let clientConfig: DynamoDB.Types.ClientConfiguration = {  region: 'us-east-1', apiVersion: 'latest' };
    if(endpointUrl) {
        clientConfig.endpoint = endpointUrl;
    }
    return new DataMapper({
        client: new DynamoDB(clientConfig)
    });
}