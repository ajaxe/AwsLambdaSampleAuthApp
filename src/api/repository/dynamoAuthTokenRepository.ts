import { AuthTokenRepository } from "./repositoryInterfaces";
import { AuthToken } from "../types/authToken";
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { CommonConfig } from '../common/config';

export class DynamoAuthTokenRepository implements AuthTokenRepository {

    private readonly mapper: DataMapper;
    private static tableCreated: Promise<void>;

    constructor(mapper: DataMapper) {
        this.mapper = mapper;
    }

    private async ensureAuthTokenTable(): Promise<void> {
        if(DynamoAuthTokenRepository.tableCreated) {
            await DynamoAuthTokenRepository.tableCreated;
            return;
        }
        console.log('ensureUserTable: authToken');
        DynamoAuthTokenRepository.tableCreated = this.mapper.ensureTableExists(AuthToken, {
            readCapacityUnits: 3,
            writeCapacityUnits: 2
        });
        await DynamoAuthTokenRepository.tableCreated;
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
        return await this.mapper.get(Object.assign(new AuthToken, { tokenId: authTokenId }));
    }

    async deleteAuthToken(authTokenId: string): Promise<AuthToken> {
        await this.ensureAuthTokenTable();
        let toDelete = Object.assign(new AuthToken, { tokenId: authTokenId });
        return await this.mapper.delete(toDelete);
    }
}