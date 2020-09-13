export declare class SingleChar {
    char: string;
    constructor(value: string);
}
export declare class MultiChar {
    code: string;
    constructor(value: string);
}
export declare class Category {
    name: string;
    script: boolean;
    constructor(value: string, script: boolean);
}
export declare class Complement {
    name: string;
    script: boolean;
    constructor(value: string, script: boolean);
}
export declare class WildChar {
}
export declare class CharGroup {
    negative: boolean;
    parts: Array<SingleChar | MultiChar | CharRange | Category | Complement>;
}
export declare class CharRange {
    begin: SingleChar;
    end: SingleChar;
    constructor(begin: SingleChar, end: SingleChar);
}
export declare class Regexp {
    branches: Array<Branch>;
}
export declare class Quantifier {
    min: number;
    max: number;
    constructor(min: number, max: number);
}
export declare class Piece {
    atom: SingleChar | RegExp | MultiChar | WildChar | CharGroup | Category | Complement;
    quantifier: Quantifier;
}
export declare class Branch {
    pieces: Array<Piece>;
}
