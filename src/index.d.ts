import { Regexp } from "./components";
interface ValidationResult {
    result: boolean;
    reason?: string;
}
export declare class XsdPattern {
    readonly pattern: string;
    readonly validationResult: ValidationResult;
    readonly regexp: Regexp;
    readonly jsRegexp: RegExp;
    constructor(pattern: string);
    isValid(): ValidationResult;
    match(input: string): boolean;
    toString(): string;
}
export {};
