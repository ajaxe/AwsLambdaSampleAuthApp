import $ from "jquery"

class Test {
    constructor() {
        $(() => {
            $('#dyn-text').text("Dynamic : " + new Date());
            console.log('ctor 1');
        });
    }
}

var test = new Test();
