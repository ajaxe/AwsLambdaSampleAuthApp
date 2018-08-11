import { UserRegistration } from "../types/userRegistration";
import { UserRepository, AuthTokenRepository } from "../repository/repositoryInterfaces";
import { User } from "../types/user";
import { ManagedKeyServices } from "./serviceInterfaces";
import { LoginData } from "../types/loginData";
import { LoginResult } from "../types/loginResult";
import { AuthResultData } from "../types/authVerficationResult";

export class ApplicationServices {

    constructor(public userRepo: UserRepository,
        public keyServices: ManagedKeyServices,
        public authRepo: AuthTokenRepository
    ) { }

    async registerUser(registration: UserRegistration): Promise<User> {
        console.log(`registerUser: username = ${registration.username}`);
        let newUser = new User();
        let hash = this.keyServices.hashPassword(registration.password);
        Object.assign(newUser, {
            username: registration.username,
            password: hash.getForStore(),
            active: true
        });
        return await this.userRepo.addUser(newUser);
    }

    async loginUser(loginData: LoginData): Promise<LoginResult> {
        let user = await this.userRepo.getUserByUsername(loginData.username);
        let result = new LoginResult();
        console.log(`Looking for username: ${loginData.username}, found? ${!!user}`);
        if(!user) {
            result.isLoggedIn = false;
            return result;
        }
        let verified =  this.keyServices.verifyPassword(loginData.password, user.password);
        result.isLoggedIn = verified;
        if(verified) {
            let authToken = await this.keyServices.createAuthToken(user);
            result.jwtToken = authToken.tokenValue;
        }
        return result;
    }

    logoutUser(authResultData: AuthResultData): Promise<boolean> {
        return this.authRepo.deleteAuthToken(authResultData.userId, authResultData.authTokenId)
        .then(function() {
            return Promise.resolve(true);
        });
    }
}