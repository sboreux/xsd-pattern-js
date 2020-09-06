

export class SingleChar {
    char: string;

    constructor(value: string) {
        this.char = value;
    }
}

export class MultiChar {
    code: string;

    constructor(value: string) {
        this.code = value;
    }



}

export class Category {
    name: string;
    script: boolean = false;

    constructor(value: string, script: boolean) {
        this.name = value;
        this.script = script;
    }

}

export class Complement {
    name: string;
    script: boolean = false;

    constructor(value: string, script: boolean) {
        this.name = value;
        this.script = script;
    }

}

export class WildChar {

}


export class CharGroup {
    negative: boolean = false;
    parts: Array<SingleChar | MultiChar | CharRange | Category | Complement> = [];
}

export class CharRange {
    begin: SingleChar;
    end: SingleChar;
    constructor(begin: SingleChar, end: SingleChar) {
        this.begin = begin;
        this.end = end;
    }
}

export class Regexp {

    branches: Array<Branch> = [];
}

export class Quantifier {
    min: number;
    max: number;

    constructor(min:number,max:number){
        this.min= min;
        this.max=max;
    }
}

export class Piece {
    atom!: SingleChar | RegExp | MultiChar | WildChar | CharGroup | Category | Complement;
    quantifier: Quantifier = new Quantifier(1,1);
}

export class Branch {
    pieces: Array<Piece> = []
}

