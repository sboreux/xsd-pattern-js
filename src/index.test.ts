import { SingleChar, Regexp, Quantifier, Branch, WildChar, MultiChar, Category, Complement } from "./components";
import { XsdPattern } from ".";



test("empty", () => {
    var pattern = new XsdPattern("");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(0);
})


test("one literal only", () => {
    var pattern = new XsdPattern("A");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
    expect(branches[0].pieces[0].quantifier.min).toBe(1);
    expect(branches[0].pieces[0].quantifier.max).toBe(1);
})

test("literals only", () => {
    var pattern = new XsdPattern("ABC");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(3);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
    expect(branches[0].pieces[1].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[1].atom).toStrictEqual(new SingleChar("B"));
    expect(branches[0].pieces[2].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[2].atom).toStrictEqual(new SingleChar("C"));
})

test("2 branches", () => {
    var pattern = new XsdPattern("A|B");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(2);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[1].pieces[0].atom).toStrictEqual(new SingleChar("B"));

})

test("3 branches", () => {
    var pattern = new XsdPattern("A|B|C");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(3);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[1].pieces[0].atom).toStrictEqual(new SingleChar("B"));
    expect(branches[2].pieces).toHaveLength(1);
    expect(branches[2].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[2].pieces[0].atom).toStrictEqual(new SingleChar("C"));

})

test("test simple quantifiers", () => {
    var pattern = new XsdPattern("A+B*C?");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(3);
    expect(branches[0].pieces[0].quantifier.min).toBe(1);
    expect(branches[0].pieces[0].quantifier.max).toBeNaN();
    expect(branches[0].pieces[1].quantifier.min).toBe(0);
    expect(branches[0].pieces[1].quantifier.max).toBeNaN();
    expect(branches[0].pieces[2].quantifier.min).toBe(0);
    expect(branches[0].pieces[2].quantifier.max).toBe(1);
})

test("test quantity quantifiers", () => {
    var pattern = new XsdPattern("A{2,4}B{2,}C{4}");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(3);
    expect(branches[0].pieces[0].quantifier.min).toBe(2);
    expect(branches[0].pieces[0].quantifier.max).toBe(4);
    expect(branches[0].pieces[1].quantifier.min).toBe(2);
    expect(branches[0].pieces[1].quantifier.max).toBeNaN();
    expect(branches[0].pieces[2].quantifier.min).toBe(4);
    expect(branches[0].pieces[2].quantifier.max).toBe(4);
})

test("test Error on Quantifier", () => {
    var pattern = new XsdPattern("A{2,4B{2,}C{4}");
    expect(pattern.isValid().result).toBeFalsy();
    expect(pattern.isValid().reason).toBe("Missing } to close quantifier");
})

test("inner expression branches", () => {
    var pattern = new XsdPattern("A|(B|C)");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(2);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
    expect(branches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(Regexp);
    if (branches[1].pieces[0].atom instanceof Regexp) {
        var innerBranches = branches[1].pieces[0].atom.branches;
        expect(innerBranches[0].pieces).toHaveLength(1);
        expect(innerBranches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
        expect(innerBranches[0].pieces[0].atom).toStrictEqual(new SingleChar("B"));
        expect(innerBranches[1].pieces).toHaveLength(1);
        expect(innerBranches[1].pieces[0].atom).toBeInstanceOf(SingleChar);
        expect(innerBranches[1].pieces[0].atom).toStrictEqual(new SingleChar("C"));
    }

})

test("advanced quantifiers", () => {
    var pattern = new XsdPattern("A+|(B?|C)*");
    var regexp: Regexp = {
        branches: [
            {
                pieces: [
                    {
                        atom: { char: "A" },
                        quantifier: { min: 1, max: NaN }
                    }
                ]
            },
            {
                pieces: [
                    {
                        atom: {
                            branches: [{
                                pieces: [
                                    {
                                        atom: { char: "B" },
                                        quantifier: { min: 0, max: 1 }
                                    }
                                ]
                            },
                            {
                                pieces: [
                                    {
                                        atom: { char: "C" },
                                        quantifier: { min: 1, max: 1 }
                                    }
                                ]
                            },]
                        },
                        quantifier: { min: 0, max: NaN }
                    }
                ]
            }
        ]
    }

    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp).toEqual(regexp);
})

test("escaping wildchar", () => {
    // escape is not mandatory but is allowed inside char group 
    var pattern = new XsdPattern("\\.[\\..]");
    var regexp: Regexp = {
        branches: [
            {
                pieces: [
                    {
                        atom: { char: "." },
                        quantifier: { min: 1, max: 1 }
                    }
                    ,
                    {
                        atom: { negative: false, parts: [{ char: "." }, { char: "." }] },
                        quantifier: { min: 1, max: 1 }
                    }
                ]
            }
        ]
    }

    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp).toEqual(regexp);
})

test("Wild Char", () => {
    var pattern = new XsdPattern(".*");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toBeInstanceOf(WildChar);

})

test("MultiChar", () => {
    var pattern = new XsdPattern("\\s+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new MultiChar("s"));

})

test("Category and Complement", () => {
    var pattern = new XsdPattern("\\p{Lu}*\\P{BasicLatin-1}*");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new Category("Lu"));
    expect(pattern.regexp.branches[0].pieces[1].atom).toStrictEqual(new Complement("BasicLatin-1"));

})
