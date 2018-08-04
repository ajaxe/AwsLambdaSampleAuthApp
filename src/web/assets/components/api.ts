
const registerUrl = '/user/register';
const sessionUrl = '/user/session';

export class Api {

    registerUser(registerData: UserRegister): Promise<void> {
        return null;    
    }

    checkUserSession(): Promise<boolean> {
        return null;
    }
}

export class UserRegister {
    username: string;
    password: string;
    confirmPassword: string;
}