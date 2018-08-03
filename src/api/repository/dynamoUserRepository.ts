
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { User } from '../types/user';
import { UserRepository } from './repositoryInterfaces';

const username_idx = "username";

export class DynamoUserRepository implements UserRepository {

    private readonly mapper: DataMapper;

    constructor(mapper: DataMapper) {
        this.mapper = mapper;
    }

    private async ensureUserTable(): Promise<void> {
        return this.mapper.ensureTableExists(User, {
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
    }

    private async getUserByUsername(username: string): Promise<User | null> {
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
        let existing = await this.getUserByUsername(user.username);
        if(existing) {
            throw new Error(`[Duplicate] Username: ${user.username} already exists`);
        }
        let temp = Object.assign({}, user);
        delete temp.userId;
        temp.created = new Date();
        let toSave = Object.assign(new User, temp);
        return await this.mapper.put(toSave);
    }

    async getUserById(userId: string): Promise<User> {
        await this.ensureUserTable();
        return await this.mapper.get(Object.assign(new User, { userId: userId }));
    }
}