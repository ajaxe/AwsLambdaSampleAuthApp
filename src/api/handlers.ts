
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

const domain = 'apps.apogee-dev.com';
const tokenExpireDays = 10;
/**
 * Common exception handler to log and return default 500 status, if needed.
 *
 * @param error {any} Error object passed to catch block
 * @param event {APIGatewayProxyEvent} API gaeway proxy request object.
 * @param responseProvider {Function} [Optional] Callback that returns customized APIGatewayProxyResult object for the error.
 * @return APIGatewayProxyResult
 */
const exceptionHandler = function (error: any, event: APIGatewayProxyEvent, responseProvider?: () => APIGatewayProxyResult): APIGatewayProxyResult {
    let result: APIGatewayProxyResult = !!responseProvider ? responseProvider() : {
        statusCode: 500,
        body: "Internal Server Error"
    };
    console.log(JSON.stringify({
        'Global_handler_error_stack': error.stack || "[NONE]",
        'response': result,
        'api_gateway_event': event
    }));
    return result;
};
const getBodyMessage = function (message: string): string {
    return JSON.stringify({ message });
}
const validateCsrfTokens = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let forbiddenResp: APIGatewayProxyResult = {
        statusCode: 403,
        body: ''
    };
    let success: APIGatewayProxyResult = {
        statusCode: 200,
        body: ''
    };
    let cookiesHeaderValue = event.headers['cookie'];
    let cookies: { [key: string]: string } = {};

    return new Promise<APIGatewayProxyResult>(function (resolve, reject) {
        if (!cookiesHeaderValue) {
            forbiddenResp.body = getBodyMessage('Invalid cookie header.');
            reject(forbiddenResp);
            return;
        }

        cookiesHeaderValue.replace(
            new RegExp("([^?=;]+)(=([^;]*))?", "g"),
            function ($0: string, $1: string, $2: string, $3: string) {
                if ($1) {
                    cookies[$1.trim()] = $3 ? $3.trim() : $3;
                }
                return '';
            }
        );
        if (!cookies[CsrfTokenPair.CsrfTokenCookieName]) {
            forbiddenResp.body = getBodyMessage(`Missing ${CsrfTokenPair.CsrfTokenCookieName} cookie.`);
            reject(forbiddenResp);
            return;
        }
        let tokenCookieValue = cookies[CsrfTokenPair.CsrfTokenCookieName];
        let tokenHeaderValue = event.headers[CsrfTokenPair.CsrfTokenHeader];
        if (!tokenHeaderValue) {
            forbiddenResp.body = getBodyMessage(`Missing header: ${CsrfTokenPair.CsrfTokenHeader}`);
            reject(forbiddenResp);
            return;
        }
        ObjectFactory.getManagedKeyServices().validateCsrfTokens({
            formToken: tokenHeaderValue,
            cookieToken: tokenCookieValue
        })
        .then(function (result) {
            if (result) {
                resolve(success);
            }
            else {
                forbiddenResp.body = getBodyMessage('Invalid token');
                reject(forbiddenResp);
            }
        })
        .catch(function(err){
            console.log('catch for validateCsrfTokens');
            reject(err);
        });
    });
};
/**
 * Validates the input model and throws exception if invalid.
 *
 * @type ValidatableObject
 * @param event {APIGatewayProxyEvent} API gaeway event object with request data.
 * @param ctor Constructor function that extends type ValidatableObject
 */
const validateModel = function <T extends ValidatableObject>(event: APIGatewayProxyEvent, ctor: new () => T): Promise<T | APIGatewayProxyResult> {
    return new Promise<T | APIGatewayProxyResult>(function (resolve, reject) {
        let model = new ctor();
        let badResp: APIGatewayProxyResult = {
            statusCode: 400,
            body: ''
        };
        let jsonContentType = 'application/json';
        let isJsonContentType = event.headers['content-type'] === jsonContentType;
        if (!isJsonContentType) {
            badResp.body = getBodyMessage('Invalid content-type header. Expect: ' + jsonContentType);
            reject(badResp);
            return;
        }
        Object.assign(model, JSON.parse(event.body));
        let validationResult = model.validate();
        if (!validationResult.isValid) {
            badResp.body = JSON.stringify(validationResult);
            reject(badResp);
            return;
        }
        console.log(`model valid. types: ${typeof model}`);
        resolve(model);
    });
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
    let badCsrfResult: APIGatewayProxyResult = {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid CSRF token' })
    };
    /*
    Never reject in this promise, as we are handling unhanlded exceptions by returning status 500
    */
    return new Promise<APIGatewayProxyResult>(function (resolve, reject) {
        // vlaidate csrf
        validateCsrfTokens(event)
            .then(function () {
                //validate model
                return validateModel(event, UserRegistration);
            })
            .then(function (data) {
                //register user
                let model = <UserRegistration>data;
                return ObjectFactory.getApplicationServices().registerUser(model);
            })
            .then(function (newUser) {
                // send success response
                resolve({
                    statusCode: 201,
                    body: JSON.stringify(newUser)
                });
            })
            .catch(function (err) {
                let hasStack = !!err['stack'];
                let fn = () => err;
                // catch any above errors and handle it
                if (hasStack && err.stack.indexOf('[Duplicate]') !== -1) {
                    resolve({
                        statusCode: 409,
                        body: JSON.stringify({ message: "Duplicate user." })
                    });
                }
                if(hasStack) {
                    fn = null;
                }
                resolve(exceptionHandler(err, event, fn));
            });
    });
}

export { indexGet, assetGet, registerUser }