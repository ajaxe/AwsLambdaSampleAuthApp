
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
import { ValidatableObject } from './types/validateableObject';
import { UserRegistration } from './types/userRegistration';

const domain = 'apps.apogee-dev.com', tokenExpireDays = 10,
    exceptionHandler = function (error: any, event: APIGatewayProxyEvent, responseProvider?: () => APIGatewayProxyResult): APIGatewayProxyResult {
        let result: APIGatewayProxyResult = !!responseProvider ? responseProvider() : {
            statusCode: 500,
            body: "Internal Server Error"
        };
        console.log('api gateway event: ' + JSON.stringify(event));
        console.log('Global handler: ' + error.stack);
        return result;
    },
    validateCsrfTokens = function (event: APIGatewayProxyEvent): void {

    },
    validateModel = function <T extends ValidatableObject>(event: APIGatewayProxyEvent, ctor: new () => T): T {
        let model = new ctor();
        let jsonContentType = 'application/json';
        let isJsonContentType = event.headers['content-type'] === jsonContentType;
        if (!isJsonContentType) {
            throw new Error('Invalid content-type header. Expect: ' + jsonContentType);
        }
        Object.assign(model, JSON.parse(event.body));
        let validationResult = model.validate();
        if (!validationResult.isValid) {
            throw new Error(JSON.stringify(validationResult));
        }
        console.log(`model valid. types: ${typeof model}`);
        return model;
    };

const indexGet: APIGatewayProxyHandler = async function (event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
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

const assetGet: APIGatewayProxyHandler = async function (event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
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
};

const registerUser: APIGatewayProxyHandler = async function (event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    let model: UserRegistration;
    try {
        model = validateModel(event, UserRegistration);
    }
    catch (err) {
        return exceptionHandler(err, event, () => {
            return {
                statusCode: 400,
                body: err.message
            };
        });
    }
    try {
        let newUser = await ObjectFactory.getApplicationServices().registerUser(model);
        return {
            statusCode: 201,
            body: JSON.stringify(newUser)
        };
    }
    catch (err) {
        let respPrv = null;
        if (err.stack.indexOf('[Duplicate]') !== -1) {
            respPrv = () => {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: "Duplicate user." })
                };
            }
        }
        return exceptionHandler(err, event, respPrv);
    }
}

export { indexGet, assetGet, registerUser }