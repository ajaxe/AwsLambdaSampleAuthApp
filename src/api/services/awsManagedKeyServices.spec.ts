import { expect, assert, should } from 'chai';
import 'mocha';
import { TokenParts, AwsManagedKeyServices, CsrfTokenGenerator } from './awsManagedKeyServices';
import { CsrfTokenPair } from '../types/csrfTokenPair';

const dummyDataKey = new Buffer('2948404D635166546A576E5A7234753778217A25432A462D4A614E645267556B', 'hex').toString('base64');

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
});