const version = '0.34.9';

export class AppVersion {
	static version = version;
	static name = 'SudokuPad Penpa+ Importer';
	static getAppTitle() {
		return `${AppVersion.name} v${AppVersion.version}`;
	}
}
