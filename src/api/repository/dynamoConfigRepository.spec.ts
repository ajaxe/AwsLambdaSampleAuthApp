import { expect, assert, should } from 'chai';
import 'mocha';
import { DynamoConfigRepository } from './dynamoConfigRepository';
import { Config } from '../types/config';
import dataMapperFactory from './dataMapperFactory'

const mapper = dataMapperFactory('http://localhost:8000'),
    getConfigRepo = function(): DynamoConfigRepository {
        return new DynamoConfigRepository(mapper);
    };

describe('DynamoConfigRepository', function () {
    describe('getConfiguration()', function () {
        it('it should return null configuration', async function () {
            let repo = getConfigRepo();
            let cfg: Config = {
                configName: "encryption.foo",
                configValue: "foo-encrypted",
                created: new Date()
            }
            let result = await repo.getConfiguration(cfg.configName);
            if(!!result) {
                assert.fail('result must be null');
            }
        });
    });

    describe('setConfiguration()', function () {
        it('it should return null configuration', async function () {
            let repo = getConfigRepo();
            let cfg: Config = {
                configName: "encryption.foo",
                configValue: "foo-encrypted",
                created: new Date()
            }
            let result = await repo.setConfiguration(cfg);
            if(!!result) {
                assert.fail('result must be null');
            }
        });
    });

    describe('addConfiguration()', function () {
        it('it should return saved user', async function () {
            let repo = getConfigRepo();
            let cfg: Config = {
                configName: "encryption.foo" + new Date(),
                configValue: "foo-encrypted",
                created: new Date()
            }
            let result = await repo.addConfiguration(cfg);

            should().exist(result, 'result must be null')
            should().not.exist(result.modified);
        });
    });
});