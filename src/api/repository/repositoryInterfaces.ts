import { User } from '../types/user';
import { Config } from '../types/config';

export interface UserRepository {

    getUsers(page: number, pageSize: number): Promise<Array<User>>;

    addUser(user: User): Promise<User>;

    getUserById(userId: string): Promise<User>;
}

export interface ConfigRepository {

    getConfiguration(name: string): Promise<Config>;

    setConfiguration(config: Config): Promise<Config>;

    addConfiguration(config: Config): Promise<Config>;
}