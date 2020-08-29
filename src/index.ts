import { Regexp, Branch, Piece, Quantifier, Atom, NormalChar } from "./components";


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
            var leftover:string ='';
            [this.regexp,leftover] = parseRegexp(pattern);
            if (leftover.length > 0){
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

var parseAtom = (input: string): [Atom, string] => {
    var firstChar = input.substr(0, 1);
    if (firstChar.match(/[^.\?*+{}()|\[\]]/)) {
        return [new NormalChar(input[0]), input.substr(1)];
    }
    else if (firstChar == '(') {
        var [regexp, leftover] = parseRegexp(input.substr(1));
        if (leftover[0] != ')') {
            throw new ParseException("Missing ) to close expression");
        }
        return [regexp, leftover.substr(1)];
    }
    throw new ParseException("not yet implemented");
}

var parseQuantifier = (input: string): [Quantifier, string] => {
    if (input[0] == '+') {
        return [{ min: 1, max: NaN }, input.substr(1)];
    }
    if (input[0] == '*') {
        return [{ min: 0, max: NaN }, input.substr(1)];
    }
    if (input[0] == '?') {
        return [{ min: 0, max: 1 }, input.substr(1)];
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
        return [{ min: min, max: max }, input.substr(match[0].length)];

    }
    //no quantifier == default quantifier
    return [new Quantifier(), input];
}



class ParseException {
    readonly error: string;
    constructor(text: string) {
        this.error = text;
    }
}