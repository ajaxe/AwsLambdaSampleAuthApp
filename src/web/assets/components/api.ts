import { UserRegistration } from '../../../api/types/userRegistration';
import { LoginData } from '../../../api/types/loginData';
import { User } from '../../../api/types/user';
import $ from 'jquery';

type AjaxHeaders = { [key: string]: string };
type HeaderOptions = { includeAuth?: boolean, includeCsrf?: boolean };

const registerUrl = 'account/register';
const sessionUrl = 'account/session';
const loginUrl = 'account/login';
const logoutUrl = 'account/logout';
const getUsers = 'users';
const tokenHeaderName = "X-CSRF-TOKEN";
const AuthorizationHeader = 'Authorization';
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

    private getAuthHeader(): string {
        let authToken = this.getAuthTokenFromCookie();
        if(authToken) {
            return `Bearer ${authToken}`;
        }
        return '';
    }

    private getXhrHeaders(options: HeaderOptions): AjaxHeaders {
        let headers: AjaxHeaders = {
            'accept': 'application/json'
        };
        if(options.includeCsrf) {
            headers[tokenHeaderName] = this.getRequestHeaderToken();
        }
        if(options.includeAuth) {
            headers[AuthorizationHeader] = this.getAuthHeader();
        }
        return headers;
    }

    registerUser(registerData: UserRegistration): Promise<string | null> {
        let r = registerData.validate(),
            self = this;
        if (!r.isValid()) {
            return Promise.reject();
        }
        else {
            return new Promise(function (resolve, reject) {
                let headers: AjaxHeaders = self.getXhrHeaders({
                    includeCsrf: true
                });
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
            //resolve(true); return;
            let headers: AjaxHeaders = self.getXhrHeaders({
                includeAuth: true
            });
            if(!headers[AuthorizationHeader]) {
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
                let headers: AjaxHeaders = self.getXhrHeaders({
                    includeCsrf: true
                });
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
            let headers: AjaxHeaders = self.getXhrHeaders({
                includeAuth: true,
                includeCsrf: true
            });
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

    getUsers(): Promise<User[]> {
        let self = this;
        return new Promise<any>(function(resolve, reject){
            let headers: AjaxHeaders = self.getXhrHeaders({
                includeAuth: true
            });
            $.get({
                url: getUsers,
                headers: headers
            })
            .then(function(data){
                resolve(data);
            })
            .catch(function(){
                console.log(arguments);
                reject('Error getting user list');
            })
        });
    }
}