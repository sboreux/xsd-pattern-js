import { Regexp, Branch, Piece, Quantifier, SingleChar, MultiChar, WildChar, CharGroup, CharRange, Category, Complement } from "./components";
import { printAny } from "./print";


interface ValidationResult {
    result: boolean;
    reason?: string;
}



export class XsdPattern {
    readonly pattern: string;
    readonly validationResult: ValidationResult = { result: true };
    regexp!: Regexp;

    constructor(pattern: string) {
        this.pattern = pattern;
        try {
            var leftover: string = '';
            [this.regexp, leftover] = parseRegexp(pattern);
            if (leftover.length > 0) {
                throw new ParseException("Unexpected end of expression");
            }
        }
        catch (e) {
            this.validationResult.result = false;
            if (e instanceof ParseException) {
                this.validationResult.reason = e.error;
            }
            else {
                this.validationResult.reason = "Unexpected parsing issue. We are sorry !"
            }
        }

    }


    isValid(): ValidationResult {
        return this.validationResult;
    }

    toString(): string {
        if (!this.validationResult.result) {
            return `Invalid regexp [${this.validationResult.reason}]`;
        }
        else {
            return printAny(this.regexp);
        }
    }
}

var parseRegexp = (input: string): [Regexp, string] => {

    var regexp = new Regexp();
    var [branch, leftover] = parseBranch(input);
    regexp.branches.push(branch);

    while (leftover.length > 0 && leftover[0] == '|') {
        var [branch, leftover] = parseBranch(leftover.substr(1));
        regexp.branches.push(branch);
    }
    return [regexp, leftover];
}

var parseBranch = (input: string): [Branch, string] => {
    var branch = new Branch();
    var leftover = input;
    while (leftover.length > 0 && leftover[0] != '|' && leftover[0] != ')') {
        var [piece, leftover] = parsePiece(leftover);
        branch.pieces.push(piece);
    }
    return [branch, leftover];
}

var parsePiece = (input: string): [Piece, string] => {
    var piece = new Piece();
    var leftover: string;
    [piece.atom, leftover] = parseAtom(input);
    [piece.quantifier, leftover] = parseQuantifier(leftover);
    return [piece, leftover];
}

var parseAtom = (input: string): [SingleChar | RegExp | MultiChar | WildChar | CharGroup, string] => {
    var firstChar = input.substr(0, 1);
    if (firstChar.match(/[^.\\?*+{}()|\[\]]/)) {
        return [new SingleChar(input[0]), input.substr(1)];
    }
    else if (firstChar == '.') {
        return [new WildChar(), input.substr(1)];
    }
    else if (firstChar == '(') {
        var [regexp, leftover] = parseRegexp(input.substr(1));
        if (leftover[0] != ')') {
            throw new ParseException("Missing ) to close expression");
        }
        return [regexp, leftover.substr(1)];
    }
    else if (firstChar == '\\') {
        return parseCharEscape(input);
    }
    else if (firstChar == '[') {
        var [chargroup, leftover] = parseCharGroup(input.substr(1));
        if (leftover[0] != ']') {
            throw new ParseException("Missing ] to close expression");
        }
        return [chargroup, leftover.substr(1)];
    }
    throw new ParseException(`Unexpected character ${firstChar}`);
}

var parseCharEscape = (input: string): [SingleChar | MultiChar | WildChar | Category | Complement, string] => {
    if (input[1].match(/[nrt\\|.?*+(){}\-\[\]\^]/)) {
        return [new SingleChar(input[1]), input.substr(2)];
    }
    else if (input[1].match(/[sSiIcCdDwW]/)) {
        return [new MultiChar(input[1]), input.substr(2)];
    }
    else if (input[1].match(/[sSiIcCdDwW]/)) {
        return [new WildChar(), input.substr(2)];
    }
    else if (input[1].match(/[pP]/)) {
        var match = input.substr(2).match(/^\{([0-9a-zA-Z\-]+)\}/)
        if (match) {
            var name = match[1];
            var leftover = input.substr(match[0].length + 2);
            if (input[1] == 'p') {
                return [new Category(name), leftover];
            }
            return [new Complement(name), leftover];
        }
        else {
            throw new ParseException(`category or complement not correctly formated`);
        }
    }
    else {
        throw new ParseException(`Character ${input[1]} cannot be escaped`);
    }
}

var parseCharGroup = (input: string): [CharGroup, string] => {
    var leftover = input;
    var char_group = new CharGroup();
    if (leftover[0] == '^') {
        char_group.negative = true;
        leftover = leftover.substr(1);
    }
    var [part, leftover] = parseCharGroupPart(leftover);
    char_group.parts.push(part);
    while (leftover[0] != ']') {
        var [part, leftover] = parseCharGroupPart(leftover);
        char_group.parts.push(part);
    }
    return [char_group, leftover];
}

var parseCharGroupPart = (input: string): [SingleChar | MultiChar | CharRange, string] => {
    var char: SingleChar | MultiChar | WildChar;
    var leftover = input;
    if (input[0] == '\\') {
        [char, leftover] = parseCharEscape(leftover);
    }
    else if (input[0] == ']') {
        throw new ParseException(`Unexpected closing ]`);
    }
    else if (input[0] == '[') {
        throw new ParseException(`[ must be escape in CharGroup`);
    }
    else {
        char = new SingleChar(input[0]);
        leftover = input.substr(1);
    }

    if (char instanceof WildChar) {
        throw new ParseException(`Wild char cannot be used in CharGroup`);
    }

    if (leftover[0] == '-') {
        var end_char: SingleChar | MultiChar | WildChar;
        if (char instanceof MultiChar) {
            throw new ParseException(`Multi char cannot be used in CharRange`);
        }
        [end_char, leftover] = parseCharEscape(leftover.substr(1));
        if (end_char instanceof WildChar) {
            throw new ParseException(`Wild char cannot be used in CharRange`);
        }
        if (end_char instanceof MultiChar) {
            throw new ParseException(`Multi char cannot be used in CharRange`);
        }
        return [new CharRange(char, end_char), leftover]
    }
    else {
        return [char, leftover];
    }

}

var parseQuantifier = (input: string): [Quantifier, string] => {
    if (input[0] == '+') {
        return [new Quantifier(1, NaN), input.substr(1)];
    }
    if (input[0] == '*') {
        return [new Quantifier(0,NaN), input.substr(1)];
    }
    if (input[0] == '?') {
        return [new Quantifier(0,1), input.substr(1)];
    }
    if (input[0] == '{') {
        var match = input.match(/\{([0-9]+)(,)?([0-9]+)?\}/);
        if (match == undefined || match.index == undefined || match.index > 0) {
            throw new ParseException("Missing } to close quantifier");
        }
        var min: number = Number.parseInt(match[1]);
        var max: number = min;
        if (match[3]) {
            max = Number.parseInt(match[3]);
        }
        else if (match[2]) {
            max = NaN;
        }
        return [new Quantifier(min,max), input.substr(match[0].length)];

    }
    //no quantifier == default quantifier
    return [new Quantifier(1,1), input];
}



class ParseException {
    readonly error: string;
    constructor(text: string) {
        this.error = text;
    }
}