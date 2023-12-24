export class ConverterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConverterError';
	}
}
