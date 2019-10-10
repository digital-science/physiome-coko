class EnumDefinition {

    constructor(definition) {
        this.name = definition.name;
        this.values = definition.values;

        if(this.values) {
            const inv = {};

            Object.keys(this.values).forEach(key => {
                const v = this.values[key];
                inv[v] = key;
            });

            this.inverseValues = inv;
        }
    }

    resolve(reference) {
        const [name, key] = reference.split(".");
        if(name !== this.name) {
            return null;
        }
        return this.values[key];
    }

    lookup(key) {
        return this.values[key] || null;
    }

    inverse(value) {
        return this.inverseValues[value];
    }
}

module.exports = EnumDefinition;