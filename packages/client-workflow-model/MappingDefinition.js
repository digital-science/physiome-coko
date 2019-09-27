class MappingDefinition {

    constructor(definition, enums) {
        this.name = definition.name;
        this.values = {};
        this.rawValues = {};

        const enumDef = enums[definition.enum];
        if(!enumDef) {
            console.error(`Unable to find enum (${definition.enum}) for mapping (${definition.name}).`);
            return;
        }

        if(definition.mappings && definition.mappings instanceof Array) {

            definition.mappings.forEach(v => {

                if(enumDef.values.hasOwnProperty(v.enumValue)) {
                    this.values[v.enumValue] = v.value;
                    this.rawValues[enumDef.values[v.enumValue]] = v.value;
                }
            });
        }
    }

    get mapping() {
        return this.values;
    }


    get internalValueMapping() {
        return this.rawValues;
    }

}

module.exports = MappingDefinition;