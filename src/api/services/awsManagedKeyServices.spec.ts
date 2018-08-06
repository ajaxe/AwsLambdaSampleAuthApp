import { expect, assert, should } from 'chai';
import 'mocha';
import { TokenParts, AwsManagedKeyServices, CsrfTokenGenerator } from './awsManagedKeyServices';
import { CsrfTokenPair } from '../types/csrfTokenPair';
import { ObjectFactory } from '../common/objectFactory';

const dummyDataKey = new Buffer('2948404D635166546A576E5A7234753778217A25432A462D4A614E645267556B', 'hex');

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
            let keyServices = new AwsManagedKeyServices(ObjectFactory.getConfigRepository());
            let plainText = "password";
            let hash1 = keyServices.hashPassword(plainText);
            console.log(`store value: ${hash1.getForStore()}`);
            expect(hash1.hashedValue).to.be.not.equal(plainText);
        });
        it('it should return different hash result for smae pasword', async function () {
            let keyServices = new AwsManagedKeyServices(ObjectFactory.getConfigRepository());
            let plainText = "password";
            let hash1 = keyServices.hashPassword(plainText);
            let hash2 = keyServices.hashPassword(plainText);
            console.log(`store value: ${hash1.getForStore()}`);
            expect(hash1.getForStore()).to.be.not.equal(hash2.getForStore());
            expect(hash1.hashedValue).to.be.not.equal(plainText);
        });
        //
        it('it should verify pervious hash to "pasword" ', async function () {
            let keyServices = new AwsManagedKeyServices(ObjectFactory.getConfigRepository());
            let plainText = "password";
            let hash1 = 'wu/8kBd4CRj0lk9AScC67Zk2wBmB5LESI4prDUEz+Bk=;;37581b54615c5a930d2833680887daafb03f9e10bb7d4ea1f5437f060cb2cc0d';
            assert.isTrue(keyServices.verifyPassword(plainText, hash1));
        });
    });
});