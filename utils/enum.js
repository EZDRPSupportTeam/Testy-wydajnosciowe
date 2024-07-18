export default class Enum {

    constructor(name) {
        this.name = name;
    }

    static get values() {
        return Object.values(this);
    }

    static forName(name) {
        for (var enumValue of this.values) {
            if (enumValue.name === name) {
                return enumValue;
            }
        }
        throw new Error('Unknown value "' + name + '"');
    }

    toString() {
        return this.name;
    }
}