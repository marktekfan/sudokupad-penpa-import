
const PuzzleLoader = (() => {
	// Cache
		const cache = {};
		const updateCache = (puzzleId, data) => (cache[puzzleId] = data, data);
		const clearCache = puzzleId => puzzleId
			? delete cache[puzzleId]
			: Object.keys(cache).forEach(key => delete cache[key]);
		const cacheRaw = {};
		const updateCacheRaw = (puzzleId, data) => cacheRaw[puzzleId] = data;
		const clearCacheRaw = puzzleId => puzzleId
			? delete cacheRaw[puzzleId]
			: Object.keys(cacheRaw).forEach(key => delete cacheRaw[key]);
		const getPuzzleRaw = puzzleId => cacheRaw[puzzleId];
	// URLs
		const apiEncodePuzzleId = puzzleId => puzzleId.split('/').map(encodeURIComponent).join('/');
		const apiPuzzleUrlLocal = puzzleId => `/api/puzzle/${apiEncodePuzzleId(puzzleId)}`;
		const apiPuzzleUrlLegacyProxy = puzzleId => `https://sudokupad.svencodes.com/ctclegacy/${encodeURIComponent(puzzleId)}`;
		const apiPuzzleUrlLegacy = puzzleId => `https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/${encodeURIComponent(puzzleId)}?alt=media`;
		const apiPuzzleUrls = puzzleId => [apiPuzzleUrlLocal(puzzleId), apiPuzzleUrlLegacyProxy(puzzleId), apiPuzzleUrlLegacy(puzzleId)];
	// Puzzle Format
		const saveDecompress = data => {
			let res = loadFPuzzle.decompressPuzzle(data);
			if(res === null || res.length < data.length) return data; // Not valid compressed data
			return res;
		};
		const saveJsonUnzip = data => {
			if(typeof data === 'object') return data;
			try {
				return JSON.parse(data);
			}
			catch(err) {
				try {
					return JSON.parse(PuzzleZipper.unzip(data));
				}
				catch(err) {
					console.error('saveJsonUnzip:', err);
					return data;
				}
			}
		};
		const reFormatPrefix = /(^scl|ctc|fpuz|scf|)(?:zles)?(.*)/;
		const getPuzzleFormat = puzzleId => puzzleId.replace(reFormatPrefix, '$1').replace(/^ctc$/, 'scl');
		const stripPuzzleFormat = puzzleId => puzzleId.replace(reFormatPrefix, '$2');
		const isRemotePuzzleId = puzzleId => getPuzzleFormat(puzzleId) === '';
		const decompressPuzzleId = puzzleId => {
			const {saveDecodeURIComponent, fixFPuzzleSlashes} = loadFPuzzle;
			let puzzle;
			puzzle = stripPuzzleFormat(puzzleId);
			puzzle = saveDecodeURIComponent(puzzle);
			puzzle = fixFPuzzleSlashes(puzzle) || puzzle;
			puzzle = saveDecompress(puzzle);
			return puzzle;
		};
		const parsePuzzleData = puzzleId => {
			let format, puzzle;
			try {
				format = getPuzzleFormat(puzzleId);
				puzzle = decompressPuzzleId(puzzleId);
				switch(format) {
					case 'scl': break;
					case 'fpuz': puzzle = loadFPuzzle.parseFPuzzle(JSON.parse(puzzle)); break;
					case 'scf': puzzle = PuzzleTools.decodeSCF(puzzle); break;
				}
				puzzle = saveJsonUnzip(puzzle);
			}
			catch(err) {
				console.error('parsePuzzleData:', err);
			}
			return puzzle;
		};
		const resolvePuzzleId = async puzzleId => isRemotePuzzleId(puzzleId) ? await fetchPuzzle(puzzleId) : puzzleId;
		const resolvePuzzleData = async puzzleId => parsePuzzleData(await resolvePuzzleId(puzzleId));
	// Fetch
		const fetchPuzzle = async (puzzleId, opts = {timeout: 10000}) => {
			if(!isRemotePuzzleId(puzzleId)) return puzzleId;
			if(cache[puzzleId] !== undefined) return cache[puzzleId];
			let lastError;
			console.time('fetchPuzzle');
			let tryPuzzleUrls = apiPuzzleUrls(puzzleId);
			for(let i = 0; i < tryPuzzleUrls.length; i++) {
				let url = tryPuzzleUrls[i];
				try {
					let puzzle = await (await fetchWithTimeout(url, opts)).text();
					if(url.includes('firebasestorage')) puzzle = PuzzleZipper.zip(puzzle);
					puzzle = isRemotePuzzleId(puzzle) ? `scl${loadFPuzzle.compressPuzzle(puzzle)}` : puzzle;
					puzzle = updateCache(puzzleId, puzzle);
					if(puzzle.id === undefined) puzzle.id = puzzleId;
					console.timeEnd('fetchPuzzle');
					return puzzle;
				}
				catch(err) {
					console.info('Partial error in fetchPuzzle:', err.message);
					lastError = err;
				}
			}
			console.timeEnd('fetchPuzzle');
			throw lastError;
		};
	
	return {
		apiPuzzleUrlLocal, apiPuzzleUrlLegacyProxy, apiPuzzleUrlLegacy,
		cache, clearCache, updateCache, cacheRaw, updateCacheRaw, clearCacheRaw, getPuzzleRaw,
		getPuzzleFormat, stripPuzzleFormat, isRemotePuzzleId,
		saveJsonUnzip, decompressPuzzleId,
		parsePuzzleData, resolvePuzzleId, resolvePuzzleData,
		fetchPuzzle,
	};
})();