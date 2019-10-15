const wfd = require('./wfd-dsl');
const fs = require('fs');
const args = process.argv.slice(2);

const sourceFile = args[0];
const destFile = args[1];

const toParse = fs.readFileSync(sourceFile, 'utf8');

console.log(
    `Compile Workflow Form Description: ${sourceFile} to file ${destFile}`
);

let parsed;
try {
    parsed = wfd.parse(toParse);
} catch(err) {
    console.error(`Unable to parse workflow description due to :`);
    console.error(`${err.toString()}`);
    console.error(`\tfound: ${err.found}`);
    console.error(`\tlocation: ${err.location.start.line}:${err.location.start.column} => ${err.location.end.line}:${err.location.end.column}`);
}

if (!parsed) {
    console.error('Error parsing file.');
    return process.exit(-1);
}

if (destFile) {
    fs.writeFileSync(destFile, JSON.stringify(parsed, null, 4), 'utf8');
} else {
    console.log(JSON.stringify(parsed, null, 4));
}
