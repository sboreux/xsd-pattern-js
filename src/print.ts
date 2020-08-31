export let printAny = (input: any): string => {
    if (input instanceof Array) {
        var result = `[`;
        input.forEach((key) => { result += printAny(key); });
        result += ']';
        return result;
    }
    if (input instanceof Object) {
        var result = `${input.constructor.name} { `;
        for (var prop in input) {
            result += `${prop} : ${printAny(input[prop])}`;
        }
        result += ' }';
        return result;
    }

    return input;
};
