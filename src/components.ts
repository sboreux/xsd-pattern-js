

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
    code: string;

    constructor(value: string) {
        this.code = value;
    }

}

export class Complement {
    code: string;

    constructor(value: string) {
        this.code = value;
    }

}

export class WildChar {

}


export class CharGroup {
    negative: boolean = false;
    parts: Array<SingleChar | MultiChar | CharRange > = [];
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
    atom!: SingleChar | RegExp | MultiChar | WildChar | CharGroup;
    quantifier: Quantifier = new Quantifier(1,1);
}

export class Branch {
    pieces: Array<Piece> = []
}

