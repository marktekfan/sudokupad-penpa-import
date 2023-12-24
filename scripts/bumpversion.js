//const path = require('path');
import fs from 'fs'
const fsp = fs.promises;

const DEBUG = false;

const getArg = (key, re = '.*') => ((` ${process.argv.join(' ')} `).match(new RegExp(` -(?:${Array.isArray(key) ? key.join('|') : key})\s*=?\s*(${re}) `)) || [])[1];
const loadArgs = argDefs => Object.fromEntries(Object.entries(argDefs).map(([arg, {key, re, map = a=>a, default: def}]) => [arg, map(getArg(key, re)) ?? def]));

const updateData = (data, updates) => {
	updates.forEach(([pattern, replace]) => {
		if(pattern instanceof RegExp) {
			data = data.replace(pattern, replace);
		}
		else {
			data = data.replaceAll(pattern, replace);
		}
	});
	return data;
};

const reVersion = /(\d+)\.(\d+)\.(\d+)/;
const bumpVersion = (bump) => (_match, ver, idx, str) => {
	const next = (ver.match(reVersion) || []).slice(1).map(v => parseInt(v));
	bump = bump.map(v => parseInt(v));
	if(bump[2] > 0) next[2] += bump[2];
	if(bump[1] > 0) {
		next[1] += bump[1];
		next[2] = 0;
	}
	if(bump[0] > 0) {
		next[0] += bump[0];
		next[1] = next[2] = 0;
	}
	if(DEBUG) {
		let start = str.lastIndexOf('\n', idx), end = str.indexOf('\n', idx);
		start = Math.max(start === -1 ? 0 : start, idx - 20);
		end = Math.min(end === -1 ? str.length - 1 : end, idx + ver.length + 20);
		let line = str.slice(start, end).trim();
		console.log('  %s -> %s in "%s"', ver, next.join('.'), line);
	}
	return next.join('.');
};

const bumpFiles = async (updatePatterns, bump) => {
	for(const {filename, pattern} of updatePatterns) {
		if(DEBUG) console.log('Bumping "%s" by %s with "%s"', filename, bump.join('.'), pattern.toString());
		let text = await fsp.readFile(filename, 'utf8');
		text = text.replace(pattern, bumpVersion(bump));
		await fsp.writeFile(filename, text, 'utf8');
	}
};

(async () => {
	let args = 	loadArgs({
		major: {key: 'a|major', re: '[0-9]+', default: 0},
		minor: {key: 'i|minor', re: '[0-9]+', default: 0},
		patch: {key: 'p|patch', re: '[0-9]+', default: 0},
	});

	let updatePatterns = [
		{filename: './src/appversion.ts', pattern: /(?<=version = ['"])(\d+\.\d+.\d+)/},
		//{filename: './public/staging/script.js', pattern: /(?<=App.VERSION = ')(\d+\.\d+.\d+)/g},
	    //{filename: './package.json', pattern: /(?<="version": ")(\d+\.\d+.\d+)/},
        //{filename: './public/staging/sudoku.html', pattern: /(?<=<title>.*?)(\d+\.\d+.\d+)/g},
		//{filename: './public/staging/sudoku.html', pattern: /(?<=\.(?:js|css)\?v=)(\d+\.\d+.\d+)/g},
	];
	await bumpFiles(updatePatterns, [args.major, args.minor, args.patch]);
	console.log('done');
})().catch(err => console.error('Error:', err));