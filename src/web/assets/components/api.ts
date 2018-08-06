import { UserRegistration } from '../../../api/types/userRegistration';
import $ from 'jquery';

const registerUrl = 'user/register';
const sessionUrl = 'user/session';

export class Api {

    registerUser(registerData: UserRegistration): Promise<void> {
        let r = registerData.validate();
        if (!r.isValid()) {
            return Promise.reject();
        }
        else {
            return new Promise(function (resolve, reject) {
                $.post({
                    url: registerUrl,
                    data: JSON.stringify(registerData),
                    contentType: 'application/json',
                    statusCode: {
                        200: function () {
                            resolve();
                        },
                        201: function () {
                            resolve();
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
}