import { expect, assert } from 'chai';
import 'mocha';
import { FileServices, ManagedKeyServices } from './serviceInterfaces';
import { HostFileServices } from './hostedFileService';

describe('HostFileServices', function () {
    describe('getIndexHtml()', function () {
        it('it should return index.html with csrf token', async function () {
            let token = '1234567890',
            keyService: ManagedKeyServices = {
                getCsrfToken: function(){
                    return Promise.resolve({
                        cookieToken: token,
                        formToken: token
                    });
                }
            }
            let fileService: FileServices = new HostFileServices(keyService);
            let htmlAsset = await fileService.getIndexHtml();
            expect(htmlAsset.body).contains(token);
        });
    });
});