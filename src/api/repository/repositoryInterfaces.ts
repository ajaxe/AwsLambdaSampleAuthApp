import { User } from '../types/user';
import { Config } from '../types/config';
import { AuthToken } from '../types/authToken';

export interface UserRepository {

    getUsers(page: number, pageSize: number): Promise<Array<User>>;

    addUser(user: User): Promise<User>;

    getUserById(userId: string): Promise<User>;

    getUserByUsername(username: string): Promise<User | null>;
}

export interface ConfigRepository {

    getConfiguration(name: string): Promise<Config>;

    setConfiguration(config: Config): Promise<Config>;

    addConfiguration(config: Config): Promise<Config>;
}

export interface AuthTokenRepository {

    addAuthToken(authToken: AuthToken): Promise<AuthToken>;

    getAuthToken(authTokenId: string): Promise<AuthToken>;

    deleteAuthToken(authTokenId: string): Promise<AuthToken>;
}