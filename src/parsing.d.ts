import { Regexp } from "./components";
export declare var parseRegexp: (input: string) => [Regexp, string];
export declare class ParseException {
    readonly error: string;
    constructor(text: string);
}
