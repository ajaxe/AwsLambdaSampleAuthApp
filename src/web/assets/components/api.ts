import { UserRegistration } from '../../../api/types/userRegistration';
import $ from 'jquery';

const registerUrl = 'user/register';
const sessionUrl = 'user/session';

export class Api {

    registerUser(registerData: UserRegistration): Promise<void> {
        if (!registerData.validate()) {
            return Promise.reject();
        }
        else {
            return new Promise(function(resolve, reject){
                $.post({
                    url: registerUrl,
                    data: JSON.stringify(registerData),
                    contentType: 'application/json'
                })
                .then(function(){
                    resolve();
                })
                .catch(function(){
                    console.log('Post error: registerUser:');
                    console.log(arguments);
                    reject();
                });
            });
        }
    }

    checkUserSession(): Promise<boolean> {
        return new Promise<boolean>(function(resolve, reject){
            $.get({
                url: sessionUrl
            })
            .then(function(){
                return resolve();
            })
            .catch(function(){
                console.log(arguments);
                return reject();
            });
        })
    }
}