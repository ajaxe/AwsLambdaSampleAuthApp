import { ValidatableObject } from "./validateableObject";
import { ValidationResult } from "./validationResult";

export class LoginData implements ValidatableObject {
    username: string;
    password: string;

    validate(): ValidationResult {
        let result = new ValidationResult();
        if (!this.username) {
            result.errors.push({
                property: 'username',
                message: 'Required username'
            });
        }
        if (!this.password) {
            result.errors.push({
                property: 'password',
                message: 'Required password'
            });
        }
        return result;
    }
}