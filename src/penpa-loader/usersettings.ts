
class UserSettings {
    static loadFromCookies() {};
    static tab_settings = [];
    static gridtype = '';
    static displaysize = 38;
    static custom_colors_on = 0;
}

export default new Proxy(UserSettings, {
    get(target, prop, receiver) {
        if (!(prop in target || prop === 'toJSON')) {
            console.warn('UserSettings: Unknown property get', prop);
        };
        return Reflect.get(target, prop, receiver);
    },
    set(obj, prop, value) {
        if (!(prop in obj)) {
            console.warn('UserSettings: Unknown property set', prop);
        }
        return Reflect.set(obj, prop, value);
    },
});
