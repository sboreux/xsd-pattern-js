export declare class XsdPattern {
    readonly pattern: string;
    constructor(pattern: string);
    isValid(): true | {
        result: boolean;
        reason: string;
    };
}
