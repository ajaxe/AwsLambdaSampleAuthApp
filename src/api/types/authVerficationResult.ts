import { User } from "./user";
import { AuthToken } from "./authToken";

export class AuthVerificationResult {
    tokenValid: boolean;
    user?: User;
    authToken?: AuthToken;

    getContextData(): AuthResultData {
        return {
            tokenValid: this.tokenValid,
            username: this.user ? this.user.username: null,
            userId:  this.user ? this.user.userId: null,
            authTokenId: this.authToken ? this.authToken.tokenId : null
        };
    }
}
export class AuthResultData {
    tokenValid: boolean;
    username: string;
    userId: string;
    authTokenId: string;
}