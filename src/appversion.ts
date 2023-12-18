export class AppVersion
{
    static version = '0.33.1';
    static name = 'SudokuPad Penpa+ Importer';
    static getAppTitle() {    
        return `${AppVersion.name} v${AppVersion.version}`;
    }
}
