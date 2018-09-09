import { User } from '../types/user';
import { Config } from '../types/config';
import { AuthToken } from '../types/authToken';

export interface UserRepository {

    getUsers(page: number, pageSize: number): Promise<Array<User>>;

    addUser(user: User): Promise<User>;

    getUserById(userId: string): Promise<User>;

    getUserByUsername(username: string): Promise<User | null>;

    updateUser(user: User): Promise<User>;
}

export interface ConfigRepository {

    getConfiguration(name: string): Promise<Config>;

    setConfiguration(config: Config): Promise<Config>;

    addConfiguration(config: Config): Promise<Config>;
}

export interface AuthTokenRepository {

    addAuthToken(userId: string, authToken: AuthToken): Promise<AuthToken>;

    getAuthToken(userId: string, authTokenId: string): Promise<AuthToken>;

    deleteAuthToken(userId: string, authTokenId: string): Promise<AuthToken>;
}