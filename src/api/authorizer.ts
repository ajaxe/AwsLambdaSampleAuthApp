import {
    CustomAuthorizerHandler,
    Callback,
    Context,
    Statement,
    CustomAuthorizerResult,
    CustomAuthorizerEvent
} from 'aws-lambda';
import { } from 'aws-sdk';
import { ObjectFactory } from './common/objectFactory';
import { User } from './types/user';
import { AuthVerificationResult } from './types/authVerficationResult';

const handler: CustomAuthorizerHandler = function (event: CustomAuthorizerEvent, context: Context, callback: Callback<CustomAuthorizerResult>) {
    if (event) {
        console.log(`authorizer event: ${JSON.stringify(event)}`);
    }
    let authorizationToken = event.authorizationToken;
    if (!authorizationToken) {
        callback("Invalid authorization token");
        return;
    }
    if (authorizationToken.indexOf("Bearer ") !== 0) {
        callback("Authorization header format. Expect 'Bearer xxxx...'");
        return;
    }
    let authTokenValue = authorizationToken.split(' ').pop();
    if (!authTokenValue) {
        callback("Missing auth token value");
        return;
    }
    ObjectFactory.getManagedKeyServices().verifyAuthToken(authTokenValue)
        .then(function (result) {
            callback(null, getAuthPolicy(result, event.methodArn));
        })
        .catch(function (err) {
            if(!err['stack']) {
                let errString = JSON.stringify(err);
                console.log('Error verifying auth token: ' +  errString);
                err = new Error(errString);
            }
            callback(err);
        });
}

const getAuthPolicy = function (result:AuthVerificationResult, methodArn: string): CustomAuthorizerResult {
    console.log('Creating policy document');
    let methodPrefix = methodArn.split('/').shift(),
    resources: string[] = [
        `${methodPrefix}/*/GET/account/session`,
        `${methodPrefix}/*/POST/account/logout`
    ],
    allow = result.tokenValid,
    user = result.user,
    effect = allow ? "Allow" : "Deny",
    statements: Statement[] = [],
    contextData = result.getContextData();

    for (let i = 0; i < resources.length; i++) {
        statements.push({
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resources[i]
        });
    }

    let doc = {
        principalId: !!user ? user.userId : null,
        policyDocument: {
            Version: "2012-10-17",
            Statement: statements
        },
        context: contextData
    };
    console.log('Policy document: ' + JSON.stringify(doc));
    return doc;
}

export { handler }