
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { User } from '../types/user';
import { UserRepository } from './repositoryInterfaces';

const username_idx = "username";

export class DynamoUserRepository implements UserRepository {

    private readonly mapper: DataMapper;
    private static tableCreated: Promise<void>;

    constructor(mapper: DataMapper) {
        this.mapper = mapper;
    }

    private async ensureUserTable(): Promise<void> {
        if(DynamoUserRepository.tableCreated) {
            return DynamoUserRepository.tableCreated;
        }
        console.log('ensureUserTable: user');
        DynamoUserRepository.tableCreated = this.mapper.ensureTableExists(User, {
            readCapacityUnits: 5,
            writeCapacityUnits: 4,
            indexOptions: {
                "username": {
                    type: 'global',
                    projection: 'all',
                    readCapacityUnits: 3,
                    writeCapacityUnits: 1
                }
            }
        });
        return DynamoUserRepository.tableCreated;
    }

    async getUserByUsername(username: string): Promise<User | null> {
        let users: User[] = [];
        for await(const f of this.mapper.query(User, { username: username }, {
            indexName: username_idx,
        })) {
            users.push(f);
        }
        if(users.length > 1) {
            throw new Error('More than one users with same username');
        }
        else if(users.length === 0) {
            return null;
        }
        return users[0];
    }

    async getUsers(page: number, pageSize: number): Promise<Array<User>> {
        let users: Array<User> = [];
        await this.ensureUserTable();
        for await (const foo of this.mapper.scan(User, {
            limit: 10,
            indexName: username_idx
        })) {
            users.push(foo);
        }
        return users;
    }

    async addUser(user: User): Promise<User> {
        await this.ensureUserTable();
        console.log(`addUser: username = ${user.username}`);
        let existing = await this.getUserByUsername(user.username);
        if(existing) {
            throw new Error(`[Duplicate] Username: ${user.username} already exists`);
        }
        let temp = Object.assign({}, user);
        delete temp.userId;
        temp.created = new Date();
        let toSave = Object.assign(new User, temp);
        let saved = await this.mapper.put(toSave);
        console.log(`addUser: completed. user id: ${saved.userId}`);
        return saved;
    }

    async updateUser(user: User): Promise<User> {
        await this.ensureUserTable();
        console.log(`updateUser: username = ${user.username}`);
        let existing = await this.getUserById(user.userId);
        if(!existing) {
            User.DoesNotExist(user.userId);
        }
        let toSave = Object.assign(new User, user);
        let saved = await this.mapper.update(toSave);
        console.log(`updateUser: completed. user id: ${saved.userId}`);
        return saved;
    }

    async getUserById(userId: string): Promise<User> {
        await this.ensureUserTable();
        return await this.mapper.get(Object.assign(new User, { userId: userId }));
    }
}