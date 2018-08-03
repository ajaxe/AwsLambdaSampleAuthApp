
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    Context,
    APIGatewayProxyCallback
} from 'aws-lambda';
import { Cookie } from './types/cookies';
import { CsrfTokenPair } from './types/csrfTokenPair';
import { ObjectFactory } from './common/objectFactory';

const domain='apps.apogee-dev.com', tokenExpireDays=10,
    exceptionHandler = function(error: any): APIGatewayProxyResult {
        console.log('Global handler: ' + error.stack);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    };

const indexGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        console.log('event: ' + JSON.stringify(event));
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
        return exceptionHandler(err);
    }
};

const assetGet: APIGatewayProxyHandler = async function(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    try {
        console.log('event: ' + JSON.stringify(event));
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
        return exceptionHandler(err);
    }
}

export { indexGet, assetGet }