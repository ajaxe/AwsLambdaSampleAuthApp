import { expect, assert } from 'chai';
import 'mocha';
import { AwsManagedKeyServices, CsrfTokenGenerator } from './awsManagedKeyServices';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { ObjectFactory } from '../common/objectFactory';
import { AuthTokenRepository, UserRepository } from '../repository/repositoryInterfaces';
import { AuthToken } from '../types/authToken';
import { User } from '../types/user';

const dummyDataKey = new Buffer('2948404D635166546A576E5A7234753778217A25432A462D4A614E645267556B', 'hex');
const jwtToVerify = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hcHBzLmFwb2dlZS1kZXYuY29tL2F1dGgtYXBwLWxhbWJkYS8iLCJqdGkiOiIxZDA2NWRjOS01NjcyLTQxNWUtODMzYS05Njk3YmUzMjVkNWEiLCJpYXQiOjE1MzM2MTE1ODQsImV4cCI6MTUzNDQ3NTU4NCwibmJmIjoxNTMzNjExNTg0fQ.Y9Kzj1w6kCXhvneWD_oIY-25MOlxOlVgwiZ73Xechso";
const authTokeRepo: AuthTokenRepository = {

    addAuthToken(authToken: AuthToken): Promise<AuthToken> {
        authToken.created = new Date();
        return Promise.resolve(authToken);
    },

    getAuthToken(authTokenId: string): Promise<AuthToken> {
        let futureDt = new Date();
        futureDt.setDate(futureDt.getDate() + 10);
        return Promise.resolve({
            tokenId: authTokenId,
            tokenValue: 'foo',
            expire: futureDt,
            created: new Date(),
            isExpired: function(){ return false; }
        });
    }
};
let userRepo: UserRepository = null;
describe('CsrfTokenGenerator', function () {
    describe('generateCsrfTokens()', function () {
        it('should generate valid token', async function () {
            let gen = new CsrfTokenGenerator(dummyDataKey);
            let pair: CsrfTokenPair;
            try {
                pair = gen.generateCsrfTokens();
                expect(pair.cookieToken).not.to.be.empty;
                expect(pair.formToken).not.to.be.empty;
                expect(pair.cookieToken).is.not.equal(pair.formToken);
            }
            catch(err) {
                console.log(err.stack);
                assert.fail();
            }
        });
    });

    describe('decryptCsrfTokens()', function () {
        it('it should return null configuration', async function () {
            let gen = new CsrfTokenGenerator(dummyDataKey);
            let pair: CsrfTokenPair = gen.generateCsrfTokens();
            let gen2 = new CsrfTokenGenerator(dummyDataKey, pair);
            let decryptedPair = gen2.decryptCsrfTokens();
            expect(decryptedPair.cookieToken).not.to.be.empty;
            expect(decryptedPair.formToken).not.to.be.empty;
            expect(decryptedPair.cookieToken).to.be.equal(decryptedPair.formToken);
        });
    });

    describe('hashPassword()', function () {
        it('it should return hash result', async function () {
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            let plainText = "password";
            let hash1 = keyServices.hashPassword(plainText);
            console.log(`store value: ${hash1.getForStore()}`);
            expect(hash1.hashedValue).to.be.not.equal(plainText);
        });
        it('it should return different hash result for smae pasword', async function () {
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            let plainText = "password";
            let hash1 = keyServices.hashPassword(plainText);
            let hash2 = keyServices.hashPassword(plainText);
            console.log(`store value: ${hash1.getForStore()}`);
            expect(hash1.getForStore()).to.be.not.equal(hash2.getForStore());
            expect(hash1.hashedValue).to.be.not.equal(plainText);
        });
        //
        it('it should verify pervious hash to "pasword" ', async function () {
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            let plainText = "password";
            let hash1 = 'wu/8kBd4CRj0lk9AScC67Zk2wBmB5LESI4prDUEz+Bk=;;37581b54615c5a930d2833680887daafb03f9e10bb7d4ea1f5437f060cb2cc0d';
            assert.isTrue(keyServices.verifyPassword(plainText, hash1));
        });

    });
    describe('createAuthToken()', function () {

        it('it should return valid authToken ', async function () {
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            keyServices.getDataKey = function(): Promise<Buffer> {
                return Promise.resolve(dummyDataKey);
            };
            let token = await keyServices.createAuthToken({
                userId: '1',
                username: 'foo@foo.com',
                created: new Date(),
                active: true,
                password: 'foobaaz'
            });
            let parts = token.tokenValue.split('.');
            expect(parts.length).to.be.equal(3);

        });
    });
    describe('verifyAuthToken()', function () {

        it('it should verify the jwt token', async function() {
            let userRepo: UserRepository = ObjectFactory.getUserRespository();
            userRepo.getUserById = function(userId: string): Promise<User> {
                return Promise.resolve({
                    userId: '1',
                    username: 'foo@foo.com',
                    created: new Date(),
                    active: true,
                    password: 'foobaaz'
                });
            }
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            keyServices.getDataKey = function(): Promise<Buffer> {
                return Promise.resolve(dummyDataKey);
            };
            let result = await keyServices.verifyAuthToken(jwtToVerify);
            assert.isTrue(result);
        });

        it('it should fail jwt verification', async function() {
            let userRepo: UserRepository = ObjectFactory.getUserRespository();
            let badJwt  = 'bad' + jwtToVerify;
            userRepo.getUserById = function(userId: string): Promise<User> {
                return Promise.resolve({
                    userId: '1',
                    username: 'foo@foo.com',
                    created: new Date(),
                    active: true,
                    password: 'foobaaz'
                });
            }
            let keyServices = new AwsManagedKeyServices(authTokeRepo, userRepo);
            keyServices.getDataKey = function(): Promise<Buffer> {
                return Promise.resolve(dummyDataKey);
            };
            try{
                let result = await keyServices.verifyAuthToken(badJwt);
            }
            catch(err)
            {
                if(err.message !== 'Jwt cannot be parsed') {
                    assert.fail();
                }
            }
        })
    });
});