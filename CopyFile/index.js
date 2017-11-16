const fs = require('fs');

function isExist(path) {
	try {
		fs.accessSync(path);
		return true;
	} catch(e) {
		return false;
	}
}

function mkdir(path) {
	fs.mkdirSync(path);
}

function copyFile(src, dst) {
	fs.copyFileSync(src, dst);
}

const directoryName = process.argv[3];
const sourceFilePath = './coverage/summary.json';
const targetDirectoryPath = `D:\\code-coverage\\${directoryName}`;

if (isExist(sourceFilePath)) {
	if (!isExist(targetDirectoryPath)) {
		mkdir(targetDirectoryPath);
	}
	
	copyFile(sourceFilePath, targetDirectoryPath);
}