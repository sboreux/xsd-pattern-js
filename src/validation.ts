import { Branch, Piece, Regexp, SingleChar, MultiChar, WildChar, CharGroup, Quantifier, CharRange } from "./components";

export var regexpToJS = (input: Regexp): RegExp => {
    var branchesJS = input.branches.map(branchToJSre);
    return new RegExp("^(" + branchesJS.join('|') + ")$","u");
}

var regexpToJSre = (input: Regexp): string => {
    var branchesJS = input.branches.map(branchToJSre);
    return branchesJS.join('|');
}

var branchToJSre = (branch: Branch): string => {
    return branch.pieces.map(pieceToJSre).join('');
}

var pieceToJSre = (piece: Piece): string => {
    return atomtoJSre(piece.atom) + quantifiertoJsre(piece.quantifier);
}

var atomtoJSre = (atom: Regexp | SingleChar | MultiChar | WildChar | CharGroup): string => {
    if (atom instanceof Regexp) {
        return `(${regexpToJSre(atom)})`;
    }
    else if (atom instanceof SingleChar) {
        return singleChartoJSre(atom)
    }
    else if (atom instanceof MultiChar) {
        if (['s', 'S', 'd', 'D', 'w', 'W'].includes(atom.code))
            return "\\" + atom.code;
        else
            return `[${multiCharToRange(atom)}]`
    }
    else if (atom instanceof WildChar) {
        return ".";
    }
    else if (atom instanceof CharGroup) {
        return charGrouptoJsre(atom)
    }
    throw new Error("Unexpected");
}

var multiCharToRange = (input: MultiChar): string => {
    var nameStartChar = ":A-Z_a-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}";
    if (input.code == 'i') {
        return nameStartChar;
    }
    else if (input.code == 'I') {
        return "^" + nameStartChar;
    }
    throw new Error("Unexpected");
}

var singleChartoJSre = (input: SingleChar): string => {
    if (['^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'].includes(input.char)) {
        return `\\${input.char}`
    }
    return input.char;
}

var charGrouptoJsre = (input: CharGroup): string => {
    return `[${input.negative ? "^" : ""}${input.parts.map(partstoJSre).join('')}]`;
}

var partstoJSre = (input: SingleChar | MultiChar | CharRange): string => {
    if (input instanceof SingleChar) {
        return singleChartoJSre(input)
    }
    else if (input instanceof MultiChar) {
        return "TODO";
    }
    else if (input instanceof CharRange) {
        return `${singleChartoJSre(input.begin)}-${singleChartoJSre(input.end)}`
    }
    throw new Error("Unexpected");
}


var quantifiertoJsre = (q: Quantifier): string => {
    if (q.min == 1 && q.max == 1) {
        return "";
    }
    else if (q.min == 1 && !Number.isFinite(q.max)) {
        return "+"
    }
    else if (q.min == 0 && !Number.isFinite(q.max)) {
        return "*"
    }
    else if (q.min == 0 && q.max == 1) {
        return "?"
    }
    else if (q.min == q.max) {
        return `{${q.min}}`
    }
    else if (!Number.isFinite(q.max)) {
        return `{${q.min},}`
    }
    else {
        return `{${q.min},${q.max}}`
    }
}
