import { ValidationResult } from "./validationResult";
import { ValidatableObject } from "./validateableObject";

export class UserRegistration implements ValidatableObject {
    username: string;
    password: string;
    confirmPassword: string;

    static emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    validate(): ValidationResult {
        let result = new ValidationResult();
        if(!this.username || !UserRegistration.emailValidator.test(this.username)) {
            result.errors.push({
                property: 'username',
                message: 'Invalid email address'
            });
        }
        if(!this.password) {
            result.errors.push({
                property: 'password',
                message: 'Password is required'
            });
        }
        if(this.confirmPassword !== this.password) {
            result.errors.push({
                property: 'confirmPassword',
                message: 'Confirm password does not match.'
            });
        }
        return result;
    }
}