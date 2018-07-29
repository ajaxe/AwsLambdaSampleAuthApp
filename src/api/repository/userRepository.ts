import { User } from '../types/user';
export interface UserRepository {

    getUsers(page: number, pageSize: number): Promise<Array<User>>;

    addUser(user: User): Promise<User>;

    getUserById(userId: string): Promise<User>;
}