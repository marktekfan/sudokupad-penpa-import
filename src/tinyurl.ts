const tinyurlUrls = [/tinyurl.com\/(.+)/, /f-puzzles.com\/\?id=(.+)/];
const tinypuzUrls = [/tinypuz.com\/(.+)/];

export const expandTinyUrlAsync = async function (url: string) {
	try {
		let tinyurl = tinyurlUrls.map(re => url.match(re)).find(m => m);
		if (tinyurl) {
			//fetch('http://localhost:3000/tinyurl/' + short[1])
			//fetch('https://marktekfan-api.azurewebsites.net/tinypuz/' + short[1])
			let res = await fetch('https://marktekfan-api.azurewebsites.net/tinyurl/' + tinyurl[1]);
			let text = await res.text();
			console.log('json response:', text);
			let result = JSON.parse(text);
			return result.success ? (result.longurl as string) : url;
		}

		let tinypuz = tinypuzUrls.map(re => url.match(re)).find(m => m);
		if (tinypuz) {
			//fetch('http://localhost:3000/tinyurl/' + short[1])
			let res = await fetch('https://marktekfan-api.azurewebsites.net/tinypuz/' + tinypuz[1]);
			let text = await res.text();
			console.log('json response:', text);
			let result = JSON.parse(text);
			return result.success ? (result.longurl as string) : url;
		}

		return url;
	} catch (ex) {
		console.error('Error in expandTinyUrl: ', ex);
		return undefined;
	}
};
