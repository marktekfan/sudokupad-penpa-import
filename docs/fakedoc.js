
class FakeDoc {
    constructor() { 
        this._elem = {};
    }
    getElementById(id) {
        let elem = this._elem[id];
        if (!elem) {
            elem = {
                id: id,
                value: '',
                style: {},
                classList: {
                    classes: {},
                    add: c => { elem.classList.classes[c] = 1; },
                    remove: c => { delete elem.classList.classes[c]; },
                    contains: c => elem.classList.classes[c],
                },
                getElementsByClassName: c => Object.keys(this._elem).filter(id => Object.keys(this._elem[id].classList.classes).includes(c)).map(id => this._elem[id]),
                addEventListener: e => {},
            }
            this._elem[id] = elem;
        }
        if (typeof elem.value !== 'string') {
            elem.value = elem.value.toString();
        }
        return elem;
    }
    querySelectorAll(selector) {
        return [];
    }
    querySelector(selector) {
        return undefined;
    }
    getValues() {
        let doc = {};
        Object.entries(this._elem).forEach(([id, elem]) => {
            if(elem.checked !== undefined) {
                doc[id] = elem.checked;
            }
            else if(elem.value !== undefined) {
                doc[id] = elem.value.toString();
            }
        });
        return doc;
    }
}