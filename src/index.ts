import { Regexp, Branch, Piece, Quantifier, SingleChar, MultiChar, WildChar, CharGroup, CharRange, Category, Complement } from "./components";
import { printAny } from "./print";
import { ParseException, parseRegexp } from "./parsing";
import { regexpToJS } from "./validation";


interface ValidationResult {
    result: boolean;
    reason?: string;
}



export class XsdPattern {
    readonly pattern: string;
    readonly validationResult: ValidationResult = { result: true };
    readonly regexp!: Regexp;
    readonly jsRegexp!: RegExp;

    constructor(pattern: string) {
        this.pattern = pattern;
        try {
            var leftover: string = '';
            [this.regexp, leftover] = parseRegexp(pattern);
            if (leftover.length > 0) {
                throw new ParseException("Unexpected end of expression");
            }
            this.jsRegexp = regexpToJS(this.regexp);
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

    match(input:string): boolean {
        return input.match(this.jsRegexp) != null;
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
