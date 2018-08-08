import { AuthTokenRepository } from "./repositoryInterfaces";
import { AuthToken } from "../types/authToken";
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { CommonConfig } from '../common/config';

export class DynamoAuthTokenRepository implements AuthTokenRepository {

    private readonly mapper: DataMapper;

    constructor(mapper: DataMapper) {
        this.mapper = mapper;
    }

    private async ensureAuthTokenTable(): Promise<void> {
        console.log('ensureUserTable: authToken');
        return this.mapper.ensureTableExists(AuthToken, {
            readCapacityUnits: 3,
            writeCapacityUnits: 2
        });
    }
    async addAuthToken(authToken: AuthToken): Promise<AuthToken> {
        await this.ensureAuthTokenTable();
        console.log(`addAuthToken: token id: ${authToken.tokenId}`);
        let toSave: AuthToken = Object.assign(new AuthToken, authToken);
        let dt = new Date();
        dt.setDate(dt.getDate() + CommonConfig.tokenExpireDays);
        toSave.expire = dt;
        let saved = await this.mapper.put(toSave);
        console.log(`addAuthToken: completed. token id: ${saved.tokenId}`);
        return saved;
    }

    async getAuthToken(authTokenId: string): Promise<AuthToken> {
        await this.ensureAuthTokenTable();
        return Promise.resolve(null);
    }
}