import { AuthTokenRepository, UserRepository } from "./repositoryInterfaces";
import { AuthToken } from "../types/authToken";
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { CommonConfig } from '../common/config';
import { DynamoUserRepository } from "./dynamoUserRepository";
import { User } from "../types/user";

export class DynamoAuthTokenRepository implements AuthTokenRepository {

    private readonly userRepo: UserRepository;

    constructor(userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    async addAuthToken(userId: string, authToken: AuthToken): Promise<AuthToken> {
        console.log(`addAuthToken: token id: ${authToken.tokenId}`);
        let user = await this.userRepo.getUserById(userId);
        if (!user) {
            User.DoesNotExist(user.userId);
        }
        let toSave: AuthToken = Object.assign(new AuthToken, authToken);
        let dt = new Date();
        dt.setDate(dt.getDate() + CommonConfig.tokenExpireDays);
        toSave.expire = dt;

        if (!user.tokens) {
            user.tokens = [];
        }
        user.tokens.push(toSave);
        user = await this.userRepo.updateUser(user);
        console.log(`addAuthToken: completed. token id: ${toSave.tokenId}`);
        return toSave;
    }

    async getAuthToken(userId: string, authTokenId: string): Promise<AuthToken> {
        let user = await this.userRepo.getUserById(userId);
        if (!user) {
            console.warn(`User id: ${userId} does not exist`);
            return null;
        }
        let tokens: AuthToken[] = [];
        if (user.tokens) {
            tokens = user.tokens.filter(function (t: AuthToken) {
                return t.tokenId === authTokenId;
            });
        }
        console.log('getAuthToken: number of tokens found: ' + tokens.length);
        return tokens.length === 1 ? tokens[0] : null;
    }

    async deleteAuthToken(userId: string, authTokenId: string): Promise<AuthToken> {
        let user = await this.userRepo.getUserById(userId);
        let tokens: AuthToken[] = [], matchedTokens: AuthToken[] = [];
        if (!user) {
            console.warn(`User id: ${userId} does not exist`);
            return null;
        }
        if (user.tokens) {
            tokens = user.tokens.filter(function (t: AuthToken) {
                return t.tokenId !== authTokenId;
            });
            matchedTokens = user.tokens.filter(function (t: AuthToken) {
                return t.tokenId === authTokenId;
            });
            console.log(`deleteAuthToken: existing token count: ${user.tokens.length}, tokens after delete: ${tokens.length}`);
            if (tokens.length < user.tokens.length) {
                user.tokens = tokens;
                await this.userRepo.updateUser(user);
            }
        }

        return matchedTokens.length === 0 ? null : matchedTokens[0];
    }
}