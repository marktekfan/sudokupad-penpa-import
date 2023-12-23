export type Flags = Record<string, boolean>;
export type FlagName = keyof typeof ConverterSettings.settings;

export interface Setting {
	readonly defaultValue: boolean;
	readonly title: string;
	readonly hidden?: boolean;
}

export class ConverterSettings {
	static {
		for (let name in ConverterSettings.settings) {
			let setting = ConverterSettings.settings[name as FlagName];
			ConverterSettings.setFlag(name, setting.defaultValue);
		}
	}

	static setFlags(flags: Flags) {
		for (let name in flags) {
			ConverterSettings.setFlag(name, flags[name]);
		}
	}

	static getFlag(flag: string): boolean | undefined {
		return (ConverterSettings.flags as any)[flag];
	}
	static setFlag(flag: string, value: boolean | string) {
		(ConverterSettings.flags as any)[flag] = !!value;
	}

	static getSettings() {
		return ConverterSettings.settings as Record<FlagName, Setting>; 
	}

	static settings = {
		thickLines: { defaultValue: true, title: 'Thicker Penpa lines to match SudokuPad feature lines' },
		fadeLines: { defaultValue: true, title: 'Fade colors on Penpa feature lines' },
		removeFrame: { defaultValue: true, title: 'Remove extra Penpa Frame lines on regions' },
		doubleLayer: { defaultValue: true, title: 'Doubling of Penpa Surface colors to make them less transparent' },
		answerGen: { defaultValue: true, title: 'Generate answer check from Penpa Solution mode digits' },
		expandGrid: { defaultValue: false, title: 'Always expand Penpa grid to force editable outside clues' },
		useClipPath: { defaultValue: false, title: 'Use clip-path for Penpa shapes', hidden: true },
		fpuzzles2scl: { defaultValue: false, title: 'Convert f-puzzles to SCL format' },
		debug: { defaultValue: false, title: 'Add Penpa debug info to puzzle' },
	} as const;

	// TODO: make strongly typed dictionary by infering from settings.keys
	static flags = {} as Record<FlagName, boolean>; // Will be initalized with PenpaConverter.settings values

	static ParseUrlSettings() {
		[...new URLSearchParams(document.location.search)].forEach(([key, val]) => {
			let settingName = key.replace(/^setting-/, '');
			// Make case insentitive
			settingName = Object.keys(ConverterSettings.flags).reduce((prev, cur) => (prev.toLowerCase() === cur.toLowerCase() ? cur : prev), settingName);
			const settingValueTrue = ['true', 't', '1', ''].includes(val.toLowerCase());
			const settingValueFalse = ['false', 'f', '0'].includes(val.toLowerCase());
			const settingValue = settingValueTrue ? true : settingValueFalse ? false : val;
			if (ConverterSettings.getFlag(settingName) === undefined) {
				console.info(`Extra URL option: ${settingName}=${settingValue}`);
			} else {
				console.info(`Extra URL setting: ${settingName}=${settingValue}`);
			}
			ConverterSettings.setFlag(settingName, settingValue);
		});
	}
}

export const instance = new ConverterSettings();

