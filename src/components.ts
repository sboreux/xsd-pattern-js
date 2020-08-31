
export abstract class Atom {

}

export class NormalChar extends Atom {
    char: string;

    constructor(value: string) {
        super();
        this.char = value;
    }

}

export class MultiChar extends Atom {
    code: string;

    constructor(value: string) {
        super();
        this.code = value;
    }

}

export class WildChar extends Atom {

}

export class CharClass extends Atom {

}

export class CharGroup extends Atom{

}

export class Regexp extends Atom {

    branches: Array<Branch> = [];
}

export class Quantifier {
    min: number = 1;
    max: number = 1;
}

export class Piece {
    atom!: Atom;
    quantifier: Quantifier = new Quantifier();
}

export class Branch {
    pieces: Array<Piece> = []
}

