import { UserRegistration } from '../../../api/types/userRegistration';
import { LoginData } from '../../../api/types/loginData';
import $ from 'jquery';

const registerUrl = 'user/register';
const sessionUrl = 'user/session';
const loginUrl = 'user/login';
const tokenHeaderName = "X-CSRF-TOKEN";
let requestToken: string = '';
export class Api {

    private getRequestHeaderToken(): string {
        if (!requestToken) {
            requestToken = <string>$('#__RequestToken').val();
        }
        return requestToken;
    }

    registerUser(registerData: UserRegistration): Promise<string | null> {
        let r = registerData.validate(),
            self = this;
        if (!r.isValid()) {
            return Promise.reject();
        }
        else {
            return new Promise(function (resolve, reject) {
                let headers: { [key: string]: string } = {};
                headers[tokenHeaderName] = self.getRequestHeaderToken();
                $.post({
                    url: registerUrl,
                    data: JSON.stringify(registerData),
                    contentType: 'application/json',
                    headers: headers,
                    statusCode: {
                        200: function () {
                            resolve();
                        },
                        201: function () {
                            resolve();
                        },
                        403: function(){
                            reject('Reload page and try registering again');
                        },
                        409: function () {
                            reject(`Username: ${registerData.username} already exists.`);
                        }
                    }
                })
                .then(function () {
                    resolve();
                })
                .catch(function () {
                    console.log('Post error: registerUser:');
                    console.log(arguments);
                    reject();
                });
            });
        }
    }

    checkUserSession(): Promise<boolean> {
        return new Promise<boolean>(function (resolve, reject) {
            $.get({
                url: sessionUrl
            })
                .then(function () {
                    return resolve();
                })
                .catch(function () {
                    console.log(arguments);
                    return reject();
                });
        })
    }

    login(loginData: LoginData): Promise<string | null> {
        let r = loginData.validate(),
            self = this;
        if (!r.isValid()) {
            return Promise.reject();
        }
        else {
            return new Promise(function (resolve, reject) {
                let headers: { [key: string]: string } = {};
                headers[tokenHeaderName] = self.getRequestHeaderToken();
                $.post({
                    url: loginUrl,
                    data: JSON.stringify(loginData),
                    contentType: 'application/json',
                    headers: headers,
                    statusCode: {
                        200: function () {
                            resolve('Login successfull');
                        },
                        401: function(){
                            reject('Incorrect username or password.');
                        },
                        403: function(){
                            reject('Reload page and try login again');
                        }
                    }
                })
                .then(function () {
                    resolve();
                })
                .catch(function () {
                    console.log('Post error: login:');
                    console.log(arguments);
                    reject();
                });
            });
        }
    }
}