
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    Context,
    APIGatewayProxyCallback
} from 'aws-lambda';
import { ServiceFactory } from './services/serviceInterfaces';

const indexGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        let response = await ServiceFactory.getFileServices().getIndexHtml();
        let result: APIGatewayProxyResult = {
            statusCode: 200,
            headers: response.headers,
            body: response.body,
            isBase64Encoded: response.isBase64Encoded
        }
        return result;
    }
    catch (err) {
        console.log('Global handler: ' + err.stack);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
};

const assetGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        console.log('event: ' + JSON.stringify(event));
        let proxyParam = event.pathParameters['proxy'],
            response = await ServiceFactory.getFileServices().getAsset(proxyParam),
            result: APIGatewayProxyResult = {
                statusCode: 200,
                headers: response.headers,
                body: response.body,
                isBase64Encoded: response.isBase64Encoded
            };
        return result;
    }
    catch (err) {
        console.log('Global handler: ' + err.stack);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}

export { indexGet, assetGet }