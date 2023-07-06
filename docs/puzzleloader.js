
const PuzzleLoader = (() => {
	// Cache
		const cache = {};
		const fetchFromCache = puzzleId => (cache[puzzleId] !== undefined)
			? Promise.resolve(JSON.parse(cache[puzzleId]))
			: Promise.reject(new Error('Puzzle "' + puzzleId + '" not found in cache'));
		const updateCache = (puzzleId, puzzleData) => {
			cache[puzzleId] = JSON.stringify(puzzleData);
			return puzzleData;
		};
		const clearCache = () => {
			Object.keys(cache).forEach(key => delete cache[key]);
		};
		
	// URLs
		// const apiPuzzleUrlLocal = puzzleId => `/api/puzzle/${encodeURIComponent(puzzleId)}`;
		const apiPuzzleUrlLegacyProxy = puzzleId => `https://sudokupad.svencodes.com/ctclegacy/${encodeURIComponent(puzzleId)}`;
		const apiPuzzleUrlLegacy = puzzleId => `https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/${encodeURIComponent(puzzleId)}?alt=media`;

	// Fetch 2
		const puzzleFromText = async res => JSON.parse(PuzzleZipper.unzip(await res.text()));
		const puzzleFromJson = async res => await res.json();
		const makeFetchPuzzle = (idToUrl, resToPuzzle) => async (puzzleId, opts) =>
			await resToPuzzle(await fetchWithTimeout(idToUrl(puzzleId), opts));
		const tryRemoteFetch = [
			// makeFetchPuzzle(apiPuzzleUrlLocal, puzzleFromText),
			makeFetchPuzzle(apiPuzzleUrlLegacyProxy, puzzleFromText),
			makeFetchPuzzle(apiPuzzleUrlLegacy, puzzleFromJson),
		];
		const fetchPuzzle = async (puzzleId, opts = {timeout: 10000}) => {
			if(cache[puzzleId] !== undefined) return JSON.parse(cache[puzzleId]);
			let lastError;
			console.time('fetchPuzzle');
			for(let i = 0; i < tryRemoteFetch.length; i++) {
				try {
					let puzzle = updateCache(puzzleId, await tryRemoteFetch[i](puzzleId, opts));
					if(puzzle.id === undefined) puzzle.id = puzzleId;
					console.timeEnd('fetchPuzzle');
					return puzzle;
				}
				catch(err) {
					//console.info('Partial error in fetchPuzzle:', err.message);
					lastError = err;
				}
			}
			console.timeEnd('fetchPuzzle');
			throw lastError;
		};
	
	return {
		//apiPuzzleUrlLocal, apiPuzzleUrlLegacyProxy, apiPuzzleUrlLegacy,
		cache, clearCache, updateCache,
		fetchPuzzle,
	};
})();