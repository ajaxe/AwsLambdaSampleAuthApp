import { ObjectFactory } from '../src/api/common/objectFactory';

let ops: Promise<any>[] = [];

//ops.push(ObjectFactory.getConfigRepository().getConfiguration('foo'));
ops.push(ObjectFactory.getUserRespository().getUsers(0, 0));
ops.push(ObjectFactory.getAuthTokenRepository().getAuthToken('0'));

Promise.all(ops)
.catch(function() {
    console.log(arguments);
})
.then(function(){
    console.log('Schema deployed');
})