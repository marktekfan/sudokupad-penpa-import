
const PuzzleLoader = (() => {
	const apiPuzzleUrlLocal = puzzleId => `/api/puzzle/${encodeURIComponent(puzzleId)}`;
	const apiPuzzleUrlLegacy = puzzleId => `https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/${encodeURIComponent(puzzleId)}?alt=media`;
	const apiPuzzleUrlLegacyProxy = puzzleId => `https://sudokupad.svencodes.com/ctclegacy/${encodeURIComponent(puzzleId)}`;
	const cache = {};
	const fetchFromCache = puzzleId => (cache[puzzleId] !== undefined)
		? Promise.resolve(cache[puzzleId])
		: Promise.reject(new Error('Puzzle "' + puzzleId + '" not found in cache'));
	const updateCache = puzzleId => puzzleData => cache[puzzleId] = puzzleData;
	const fetchFromUrl = url => fetchWithTimeout(url, {timeout: 3000})
		.then(res => res.status === 404
			? Promise.reject(new Error('Puzzle "' + url + '" not found'))
			: res
		);
	const fetchFromLocal = puzzleId => fetchFromUrl(apiPuzzleUrlLocal(puzzleId))
		.then(res => res.text())
		.then(res => JSON.parse(PuzzleZipper.unzip(res)));
	const fetchFromLegacy = puzzleId => fetchFromUrl(apiPuzzleUrlLegacy(puzzleId))
		.then(res => res.json());
	const fetchFromLegacyProxy = puzzleId => fetchFromUrl(apiPuzzleUrlLegacyProxy(puzzleId))
		.then(res => res.text())
		.then(res => JSON.parse(PuzzleZipper.unzip(res)));

	const fetchPuzzle = puzzleId => Promise.resolve()
		.then(() => console.time('fetchPuzzle'))
		.then(() => fetchFromCache(puzzleId))
		.catch(() => fetchFromLocal(puzzleId))
		.catch(() => fetchFromLegacyProxy(puzzleId))
		.catch(() => fetchFromLegacy(puzzleId))
		.catch(reportAndRethrow('Error in fetchPuzzle:'))
		.then(res => (console.timeEnd('fetchPuzzle'), res))
		.then(updateCache(puzzleId));
	return {
		apiPuzzleUrlLocal,
		apiPuzzleUrlLegacy,
		cache,
		fetchFromCache,
		fetchFromUrl,
		fetchFromLocal,
		fetchFromLegacy,
		fetchPuzzle
	};
})();