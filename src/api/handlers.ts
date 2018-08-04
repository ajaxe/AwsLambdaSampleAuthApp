
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    Context,
    APIGatewayProxyCallback
} from 'aws-lambda';
import { CsrfTokenPair } from './types/csrfTokenPair';
import { ObjectFactory } from './common/objectFactory';
import { Cookie } from './types/cookies';

const domain='apps.apogee-dev.com', tokenExpireDays=10,
    exceptionHandler = function(error: any, event: APIGatewayProxyEvent): APIGatewayProxyResult {
        console.log('api gateway event: ' + JSON.stringify(event));
        console.log('Global handler: ' + error.stack);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    },
    validateCsrfTokens = function(event: APIGatewayProxyEvent): void {
        
    };

const indexGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        let response = await ObjectFactory.getFileServices().getIndexHtml(),
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
        return exceptionHandler(err, event);
    }
};

const assetGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        let proxyParam = event.pathParameters['proxy'],
            response = await ObjectFactory.getFileServices().getAsset(proxyParam),
            result: APIGatewayProxyResult = {
                statusCode: 200,
                headers: response.headers,
                body: response.body,
                isBase64Encoded: response.isBase64Encoded
            };
        return result;
    }
    catch (err) {
        return exceptionHandler(err, event);
    }
}

export { indexGet, assetGet }