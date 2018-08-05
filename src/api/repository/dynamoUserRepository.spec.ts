import { expect, assert } from 'chai';
import 'mocha';
import { DynamoUserRepository } from './dynamoUserRepository';
import { User } from '../types/user';
import dataMapperFactory from './dataMapperFactory'

const mapper = dataMapperFactory('http://localhost:8000'),
    getUserRepo = function(): DynamoUserRepository {
        return new DynamoUserRepository(mapper);
    };

describe('UserRepository', function () {
    describe('getUsers()', function () {
        it('it should return empty array', async function () {
            let repo = getUserRepo();
            let result = await repo.getUsers(0, 0)
            expect(result.length).to.be.not.equal(0);
        });
    });

    describe('addUser()', function () {
        it('it should return saved user', async function () {
            let repo = getUserRepo();
            let user = new User();
            user.userId = 'foo';
            user.username = 'addUser-foo.test-' + new Date();
            user.active = true;
            let result = await repo.addUser(user);
            expect(result.userId).not.equal(user.userId);
        });

        it('it should return duplicate error', async function () {
            let repo = getUserRepo();
            let user = new User();
            user.userId = 'foo';
            user.username = 'addUser-duplicate-foo.test';
            user.active = true;
            try{
                await repo.addUser(user);
                await repo.addUser(user);
                assert.fail();
            }
            catch(err) {
                expect(err.stack.indexOf('[Duplicate]')).to.not.equal(-1);
            }

        });
    });

    describe('getUserById()', function () {
        it('it should return user by id', async function () {
            let repo = getUserRepo();
            let user = new User();
            user.userId = 'foo';
            user.username = 'getUserById-foo-test-' + new Date();
            user.active = true;
            let result = await repo.addUser(user);
            expect(result.userId).not.equal(user.userId);

            let retrieved = await repo.getUserById(result.userId);
            expect(retrieved.userId).to.be.equal(result.userId);
        });
    });
});