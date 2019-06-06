const AclSet = require('./acl-set');
const description = require('./../../app/config/description.json');

const testTask = description.tasks.Submission;
const enumSet = description.enums;

const aclSet = new AclSet(testTask.acl, enumSet);

console.dir(aclSet);




let r;


/*
r = aclSet.applyRules(["owner"], "access", {});

console.log("---- owner - access ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["administrator"], "access", {});

console.log("---- administrator - access ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["owner"], "write", {});

console.log("---- owner - write ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["administrator"], "write", {});

console.log("---- administrator - write ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["administrator"], "task", {});

console.log("---- administrator - task ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["owner"], "task", {});

console.log("---- owner - task ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



r = aclSet.applyRules(["owner"], "read", {});

console.log("---- owner - read ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();
*/


r = aclSet.applyRules(["owner"], "write", {phase:"pending"});

console.log("---- owner - write (phase: pending) ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();


r = aclSet.applyRules(["owner"], "write", {phase:"published"});

console.log("---- owner - write (phase: published) ----");
console.log(JSON.stringify(r, null, 4));
console.log();
console.log();



