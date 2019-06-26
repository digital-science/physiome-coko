const tt = function() {

    return new Promise((resolve, reject) => {
        return resolve("tt resolved");
    });
};

const tr = function() {

    return new Promise((resolve, reject) => {
        return reject("tr reject");
    });
};

tt().catch(err => {

    console.log("catch ->" + err);
    return Promise.reject(err);

}).then(result => {

    console.log("then ->" + result);

    return tr();

}).then(result => {

    console.log("then ->" + result);
    return 100;

}).catch(err => {

    console.log("catch ->" + err);
    return Promise.reject("==> catch and return reject " + err);

});
