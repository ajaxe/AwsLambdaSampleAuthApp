import { AuthToken } from './authToken'

export class User {
    userId: string;
    created: Date;
    username: string;
    password: string;
    active: boolean;
    tokens?: Array<AuthToken>;

    static DoesNotExist(userId?: string): void {
        let errMesg = '[Does not Exist] User does not exist.' + (userId ? ' UserId: ' + userId : '');
        throw new Error(errMesg);
    }
}