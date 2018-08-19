import { UserRegistration } from '../../../api/types/userRegistration';
import { LoginData } from '../../../api/types/loginData';
import $ from 'jquery';
import cookie from 'cookie';

const registerUrl = 'user/register';
const sessionUrl = 'user/session';
const loginUrl = 'user/login';
const logoutUrl = 'user/logout';
const tokenHeaderName = "X-CSRF-TOKEN";
const authTokenName = 'auth_token';
let requestToken: string = '';
export class Api {

    private getRequestHeaderToken(): string {
        if (!requestToken) {
            requestToken = <string>$('#__RequestToken').val();
        }
        return requestToken;
    }

    private getAuthTokenFromCookie(): string {
        let ck = document.cookie;
        let ckJar: { [key: string]: string } ={};
        ck.replace(
            new RegExp("([^?=;]+)(=([^;]*))?", "g"),
            function($0: string, $1: string, $2: string, $3: string) {
                ckJar[$1.trim()] = $3 ? $3.trim(): $3;
                return '';
            }
        );
        let token = ckJar[authTokenName];
        if(!token) {
            console.log(`${authTokenName} not available`);
        }
        else {
            console.log(`${authTokenName} available`);
        }
        return token;
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
        let self = this;
        return new Promise<boolean>(function (resolve/*, reject*/) {
            resolve(true); return;
            let headers: { [key: string]: string } = {}, authToken = self.getAuthTokenFromCookie();
            if(authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            else {
                resolve(false);
                return;
            }
            $.get({
                url: sessionUrl,
                headers: headers
            })
            .then(function () {
                resolve(true);
            })
            .catch(function () {
                console.log(arguments);
                resolve(false);
            });
        });
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
                            resolve();
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

    logout(): Promise<any> {
        let self = this;
        return new Promise<any>(function(resolve/*, reject*/){
            let headers: { [key: string]: string } = {},
                authToken = self.getAuthTokenFromCookie();
            if(authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            };
            headers[tokenHeaderName] = self.getRequestHeaderToken();
            $.post({
                url: logoutUrl,
                headers: headers
            })
            .then(function(){
                resolve();
            })
            .catch(function(){
                console.log(arguments);
                resolve();
            })
        });
    }

    getCurrentSessionId(): string {
        let token = this.getAuthTokenFromCookie();
        if(!token) {
            return '';
        }
        let payload = JSON.parse(atob(token.split('.')[1]));
        return payload.jti;
    }
}