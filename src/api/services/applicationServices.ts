import { UserRegistration } from "../types/userRegistration";
import { UserRepository } from "../repository/repositoryInterfaces";
import { User } from "../types/user";
import { ManagedKeyServices } from "./serviceInterfaces";

export class ApplicationServices {

    constructor(public userRepo: UserRepository,
        public keyServices: ManagedKeyServices) { }

    async registerUser(registration: UserRegistration): Promise<void> {
        console.log(`registerUser: username = ${registration.username}`);
        let newUser = new User();
        let hash = this.keyServices.hashPassword(registration.password);
        Object.assign(newUser, {
            username: registration.username,
            password: hash.getForStore(),
            active: true
        });
        await this.userRepo.addUser(newUser);
    }
}