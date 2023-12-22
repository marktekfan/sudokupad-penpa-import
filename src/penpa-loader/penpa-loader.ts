import { FakeDoc } from './fakedoc';
import { PenpaGeneral } from './penpa-general';

const rePenpaUrl = /\/penpa-edit\//i;
const rePuzzlinkUrl = /\/puzz\.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/;

const puzzlinkNames: Dictionary<string> = {
	aho: 'Aho-ni-Narikire',
	amibo: 'Amibo',
	angleloop: 'Angle Loop',
	anglers: 'Anglers',
	antmill: 'Ant Mill',
	aqre: 'Aqre',
	aquarium: 'Aquarium',
	araf: 'Araf',
	armyants: 'Army Ants',
	arukone: 'Arukone',
	ayeheya: 'ekawayeh',
	balance: 'Balance Loop',
	cave: 'Cave',
	cbanana: 'Choco Banana',
	context: 'Context',
	crossstitch: 'Crossstitch',
	cts: 'Cross the Streams',
	barns: 'Barns',
	bdblock: 'Border Block',
	bdwalk: 'Building Walk',
	bonsan: 'Bonsan',
	bosanowa: 'Bosanowa',
	box: 'Box',
	skyscrapers: 'Skyscrapers',
	canal: 'Canal View',
	castle: 'Castle Wall',
	cbblock: 'Combi Block',
	chainedb: 'Chained Block',
	chocona: 'Chocona',
	coffeemilk: 'Coffee Milk',
	cojun: 'Cojun',
	compass: 'Compass',
	coral: 'Coral',
	country: 'Country Road',
	creek: 'Creek',
	curvedata: 'Curve Data',
	'curvedata-aux': 'Edit shape',
	dbchoco: 'Double Choco',
	detour: 'Detour',
	disloop: 'Disorderly Loop',
	dominion: 'Dominion',
	doppelblock: 'Doppelblock',
	dosufuwa: 'Dosun-Fuwari',
	dotchi: 'Dotchi-Loop',
	doubleback: 'Double Back',
	easyasabc: 'Easy as ABC',
	factors: 'Rooms of Factors',
	familyphoto: 'Family Photo',
	fillmat: 'Fillmat',
	fillomino: 'Fillomino',
	firefly: 'Hotaru Beam',
	fivecells: 'FiveCells',
	fourcells: 'FourCells',
	geradeweg: 'Geradeweg',
	goishi: 'Goishi',
	gokigen: 'Slant',
	haisu: 'Haisu',
	hakoiri: 'Hakoiri-masashi',
	hanare: 'Hanare-gumi',
	hashikake: 'Hashiwokakero',
	hebi: 'Hebi-Ichigo',
	herugolf: 'Herugolf',
	heteromino: 'Heteromino',
	heyablock: 'Heyablock',
	heyabon: 'Heya-Bon',
	heyawake: 'Heyawake',
	hinge: 'Hinge',
	hitori: 'Hitori',
	icebarn: 'Icebarn',
	icelom: 'Icelom',
	icelom2: 'Icelom 2',
	icewalk: 'Ice Walk',
	ichimaga: 'Ichimaga',
	ichimagam: 'Magnetic Ichimaga',
	ichimagax: 'Crossing Ichimaga',
	interbd: 'International Borders',
	juosan: 'Juosan',
	kaero: 'Return Home',
	kaidan: 'Stairwell',
	kakuro: 'Kakuro',
	kakuru: 'Kakuru',
	kazunori: 'Kazunori Room',
	kinkonkan: 'Kin-Kon-Kan',
	koburin: 'Koburin',
	kouchoku: 'Kouchoku',
	kramma: 'KaitoRamma',
	kramman: 'New KaitoRamma',
	kropki: 'Kropki',
	kurochute: 'Kurochute',
	kurodoko: 'Kurodoko',
	kurotto: 'Kurotto',
	kusabi: 'Kusabi',
	ladders: 'Ladders',
	lapaz: 'La Paz',
	lightshadow: 'Light and Shadow',
	lightup: 'Akari',
	lither: 'Litherslink',
	lits: 'LITS',
	lohkous: 'Lohkous',
	lollipops: 'Lollipops',
	lookair: 'Look-Air',
	loopsp: 'Loop Special',
	loute: 'L-route',
	makaro: 'Makaro',
	mashu: 'Masyu',
	maxi: 'Maxi Loop',
	meander: 'Meandering Numbers',
	mejilink: 'Mejilink',
	minarism: 'Minarism',
	mines: 'Minesweeper',
	midloop: 'Mid-loop',
	mirrorbk: 'Mirror Block',
	mochikoro: 'Mochikoro',
	mochinyoro: 'Mochinyoro',
	moonsun: 'Moon or Sun',
	nagare: 'Nagareru-Loop',
	nagenawa: 'Nagenawa',
	nanro: 'Nanro',
	nawabari: 'Territory',
	nikoji: 'NIKOJI',
	nondango: 'Nondango',
	nonogram: 'Nonogram',
	norinori: 'Norinori',
	nothree: 'No Three',
	numlin: 'Numberlink',
	numrope: 'Number Rope',
	nuribou: 'Nuribou',
	nurikabe: 'Nurikabe',
	nurimaze: 'Nuri-Maze',
	nurimisaki: 'Nurimisaki',
	nuriuzu: 'Nuri-uzu',
	ovotovata: 'Ovotovata',
	oneroom: 'One Room One Door',
	onsen: 'Onsen-meguri',
	paintarea: 'Paintarea',
	parquet: 'Parquet',
	pencils: 'Pencils',
	pentominous: 'Pentominous',
	pentopia: 'Pentopia',
	pipelink: 'Pipelink',
	pipelinkr: 'Pipelink Returns',
	putteria: 'Putteria',
	ququ: 'Ququ',
	railpool: 'Rail Pool',
	rassi: 'Rassi Silai',
	rectslider: 'Rectangle-Slider',
	reflect: 'Reflect Link',
	renban: 'Renban-Madoguchi',
	ringring: 'Ring-ring',
	ripple: 'Ripple Effect',
	roma: 'Roma',
	roundtrip: 'Round Trip',
	sashigane: 'Sashigane',
	satogaeri: 'Satogaeri',
	scrin: 'Scrin',
	shakashaka: 'Shakashaka',
	shikaku: 'Shikaku',
	shimaguni: 'Islands',
	shugaku: 'School Trip',
	shwolf: 'Goats and Wolves',
	simpleloop: 'Simple Loop',
	slalom: 'Slalom',
	slither: 'Slitherlink',
	snake: 'Snake',
	snakepit: 'Snake Pit',
	starbattle: 'Star Battle',
	squarejam: 'Square Jam',
	statuepark: 'Statue Park',
	'statuepark-aux': 'Edit shape',
	stostone: 'Stostone',
	sudoku: 'Sudoku',
	sukoro: 'Sukoro',
	sukororoom: 'Sukoro-room',
	symmarea: 'Symmetry Area',
	tajmahal: 'Taj Mahal',
	takoyaki: 'Takoyaki',
	tapa: 'Tapa',
	tapaloop: 'Tapa-Like Loop',
	tasquare: 'Tasquare',
	tatamibari: 'Tatamibari',
	tateyoko: 'Tatebo-Yokobo',
	tawa: 'Tawamurenga',
	tentaisho: 'Tentaisho',
	tents: 'Tents',
	tilepaint: 'Tilepaint',
	toichika: 'Toichika',
	toichika2: 'Toichika 2',
	tontti: 'Tonttiraja',
	tren: 'Tren',
	triplace: 'Tri-place',
	tslither: 'Touch Slitherlink',
	usotatami: 'Uso-tatami',
	usoone: 'Uso-one',
	view: 'View',
	voxas: 'Voxas',
	vslither: 'Vertex Slitherlink',
	wagiri: 'Wagiri',
	walllogic: 'Wall Logic',
	wblink: 'Shirokuro-link',
	yajikazu: 'Yajisan-Kazusan',
	yajilin: 'Yajilin',
	'yajilin-regions': 'Regional Yajilin',
	yajisoko: 'Yajisan-Sokoban',
	yajitatami: 'Yajitatami',
	yinyang: 'Yin-Yang',
	yosenabe: 'Yosenabe',
};

const parsePuzzLink = (url: string) => {
	let fakedoc = new FakeDoc();
	let penpaGeneral = PenpaGeneral(fakedoc);

	let pu = penpaGeneral.decode_puzzlink(url);
	if (!pu || (pu.user_tags.length === 0 && pu.mode.qa !== 'pu_a')) return null;

	let variant = false;
	let parts, urldata, type;
	parts = url.split('?');
	urldata = parts[1].split('/');
	if (urldata[1] === 'v:') {
		urldata.splice(1, 1); // Ignore variant rules
		variant = true;
	}
	type = urldata[0];

	let title = puzzlinkNames[type] || type;
	let rules = [`${title} rules apply.`];
	if (variant) {
		rules.push('This puzzle uses variant rules.');
	}

	pu._document = {
		saveinfotitle: title,
		saveinforules: rules.join('\n'),
		saveinfoauthor: `puzz.link`,
		sourcelink: url,
	};

	return pu;
};

const parsePenpaPuzzle = (urlstring: string) => {
	let paramMatch = urlstring.match(/[^?#]+[?#]([^#]+)/);
	if (!paramMatch) return null;

	let urlParam = paramMatch[1];

	// Capture global document state
	let doc = new FakeDoc();

	// Create elements to capture solution settings
	[
		'sol_surface',
		'sol_number',
		'sol_loopline',
		'sol_ignoreloopline',
		'sol_loopedge',
		'sol_ignoreborder',
		'sol_wall',
		'sol_square',
		'sol_circle',
		'sol_tri',
		'sol_arrow',
		'sol_math',
		'sol_battleship',
		'sol_tent',
		'sol_star',
		'sol_akari',
		'sol_mine',
	].forEach(id => doc.getElementById(id).classList.add('solcheck'));
	[
		'sol_or_surface',
		'sol_or_number',
		'sol_or_loopline',
		'sol_or_loopedge',
		'sol_or_wall',
		'sol_or_square',
		'sol_or_circle',
		'sol_or_tri',
		'sol_or_arrow',
		'sol_or_math',
		'sol_or_battleship',
		'sol_or_tent',
		'sol_or_star',
		'sol_or_akari',
		'sol_or_mine',
	].forEach(id => doc.getElementById(id).classList.add('solcheck_or'));

	let penpaGeneral = PenpaGeneral(doc);

	try {
		let pu = penpaGeneral.load(urlParam, 'local');
		pu._document = doc.getValues();
		return pu;
	} catch (err: any) {
		let gridtype = err.message.match(/Puzzle_(\w+) is not defined/);
		if (gridtype) {
			throw {
				penpa: `Penpa grid type '${gridtype[1]}' is not supported in SudokuPad`,
			};
		}
		throw err;
	}
};

export class PenpaLoader {
	static isPenpaUrl = (url: string) => url.match(rePenpaUrl) || url.match(rePuzzlinkUrl);

	static loadPenpaPuzzle = function (urlstring: string) {
		if (urlstring.match(rePenpaUrl)) {
			return parsePenpaPuzzle(urlstring);
		} else if (urlstring.match(rePuzzlinkUrl)) {
			return parsePuzzLink(urlstring);
		}
		return null;
	};
}
