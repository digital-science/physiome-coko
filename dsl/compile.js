const wfd = require('./wfd-dsl');
const fs = require('fs');
const args = process.argv.slice(2);

const sourceFile = args[0];
const destFile = args[1];

const toParse = fs.readFileSync(sourceFile, 'utf8');

console.log(
    `Compile Workflow Form Description: ${sourceFile} to file ${destFile}`
);

const parsed = wfd.parse(toParse);

if (!parsed) {
    console.error('Error parsing file.');
    return process.exit(-1);
}

if (destFile) {
    fs.writeFileSync(destFile, JSON.stringify(parsed, null, 4), 'utf8');
} else {
    console.log(JSON.stringify(parsed, null, 4));
}
