type Elem = {
    id: string
    value: any
    style: any
    classList: {
        classes: Dictionary
        add: (c: string) => void
        remove: (c: string) => void
        contains: (c: string) => any
    }
    getElementsByClassName: (c: string) => Elem[]
    addEventListener: (e: any) => void
    checked: boolean | undefined
}

export class FakeDoc {
    private _elem: Dictionary<Elem>;

    constructor() { 
        this._elem = {};
    }

    getElementById(id: string) {
        let elem = this._elem[id];
        if (!elem) {
            elem = {
                id: id,
                value: '',
                style: {},
                classList: {
                    classes: {},
                    add: (c: string) => { elem.classList.classes[c] = 1; },
                    remove: (c: string) => { delete elem.classList.classes[c]; },
                    contains: (c: string) => elem.classList.classes[c],
                },
                getElementsByClassName: (c: string) => Object.keys(this._elem).filter(id => Object.keys(this._elem[id].classList.classes).includes(c)).map(id => this._elem[id]),
                addEventListener: (_e: any) => {},
                checked: undefined
            }
            this._elem[id] = elem;
        }
        if (typeof elem.value !== 'string') {
            elem.value = elem.value.toString();
        }
        return elem;
    }

    querySelectorAll(_selector: string) {
        return [];
    }

    querySelector(_selector: string) {
        return undefined;
    }

    getValues() {
        let doc: Dictionary = {};
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