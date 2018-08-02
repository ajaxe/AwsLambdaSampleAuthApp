
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    Context,
    APIGatewayProxyCallback
} from 'aws-lambda';
import { ServiceFactory } from './services/serviceInterfaces';
import { Cookie } from './types/cookies';
import { CsrfTokenPair } from './types/csrfTokenPair';

const domain='apps.apogee-dev.com', tokenExpireDays=10;

const indexGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        console.log('event: ' + JSON.stringify(event));
        let response = await ServiceFactory.getFileServices().getIndexHtml(),
            cookies = new Cookie();
        cookies.setCookie(CsrfTokenPair.CsrfTokenCookieName,
                response.csrfTokens.cookieToken,
                tokenExpireDays,
                domain);
        let result: APIGatewayProxyResult = {
                statusCode: 200,
                headers: Object.assign({}, response.headers, cookies.getHeader()),
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