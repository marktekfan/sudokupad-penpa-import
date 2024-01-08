import type { PenpaPuzzle } from './penpa-puzzle';
import type { FakeDoc } from './fakedoc';
import type { UserSettings } from './usersettings';

export function PenpaGeneral(fakedoc: FakeDoc, UserSettings: UserSettings): {
	decode_puzzlink: (...args: any[]) => PenpaPuzzle;
	load: (...args: any[]) => PenpaPuzzle;
	create: (...args: any[]) => PenpaPuzzle;
};
