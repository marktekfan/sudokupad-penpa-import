const flagDescriptions = {
	thickLines: { defaultValue: true, title: 'Thicker Penpa lines to match SudokuPad feature lines' },
	fadeLines: { defaultValue: true, title: 'Fade colors on Penpa feature lines' },
	removeFrame: { defaultValue: true, title: 'Remove extra Penpa Frame lines on regions' },
	doubleLayer: { defaultValue: true, title: 'Doubling of Penpa Surface colors to make them less transparent' },
	answerGen: { defaultValue: true, title: 'Generate answer check from Penpa Solution mode digits' },
	expandGrid: { defaultValue: false, title: 'Always expand Penpa grid to force editable outside clues' },
	useClipPath: { defaultValue: false, title: 'Use clip-path for Penpa shapes', hidden: true },
	debug: { defaultValue: false, title: 'Add Penpa debug info to puzzle' },
	fpuzzles2scl: { defaultValue: false, title: 'Convert f-puzzles to SCL format' },
	remotefog: { defaultValue: false, title: 'Convert Remote-Fog cages', persist: true },
} as const;

export type FlagName = keyof typeof flagDescriptions;

type FlagsRecord = Record<FlagName, boolean>;

export type FlagValues = Readonly<FlagsRecord>;

export interface FlagDescription {
	readonly defaultValue: boolean;
	readonly title: string;
	readonly hidden?: boolean;
	readonly persist?: boolean;
}

export class ConverterFlags {
	private flagValues: FlagsRecord; // Will be initalized with PenpaConverter.settings values

	constructor() {
		this.flagValues = {} as FlagsRecord; // Will be initalized with PenpaConverter.settings values
		for (let name in flagDescriptions) {
			let setting = flagDescriptions[name as FlagName];
			this.setValue(name, setting.defaultValue);
		}
	}

	static FlagDescriptions() {
		//return flagDescriptions as Record<FlagName, FlagDescription>;
		return Object.keys(flagDescriptions).map(key => {
			const flag = ConverterFlags.getDescription(key);
			return { key, ...flag, hidden: !!flag.hidden };
		});
	}

	static getDescription(flag: string): FlagDescription {
		return flagDescriptions[flag as FlagName];
	}

	getDescription(flag: string): FlagDescription {
		return ConverterFlags.getDescription(flag);
	}

	setFlagValues(flags: FlagValues | FlagName[]) {
		if (Array.isArray(flags)) {
			for (let flagName in flagDescriptions) {
				const description = ConverterFlags.getDescription(flagName);
				if (!description.hidden) {
					this.setValue(flagName, flags.includes(flagName as FlagName));
				}
			}
		} else {
			for (let name in flags) {
				this.setValue(name, flags[name as FlagName]);
			}
		}
	}

	getFlagValues() {
		return this.flagValues as FlagValues;
	}

	getFlagValuesUnsafe() {
		return this.flagValues as FlagsRecord;
	}

	getValue(flag: string): boolean {
		return this.flagValues[flag as FlagName] ?? false;
	}

	setValue(flag: string, value: boolean | string) {
		this.flagValues[flag as FlagName] = !!value;
	}

	persist() {
		let state = {
			remotefog: this.getValue('remotefog')
		}
		localStorage.setItem('flags', JSON.stringify(state));	
	}

	obtain() {
		try {
			let state = JSON.parse(localStorage.getItem('flags') || '') || {};
			if (state.remotefog) {
				this.setValue('remotefog', true);
			}
		}
		catch (err) {
			console.log(err);
		}		
	}

}
