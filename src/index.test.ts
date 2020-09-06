import { SingleChar, Regexp, Quantifier, Branch, WildChar, MultiChar, Category, Complement } from "./components";
import { XsdPattern } from ".";



test("empty", () => {
    var pattern = new XsdPattern("");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(0);
    expect(pattern.match('')).toBeTruthy();
    expect(pattern.match('A')).toBeFalsy();
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
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('')).toBeFalsy();
    expect(pattern.match('B')).toBeFalsy();
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
    expect(pattern.match('ABC')).toBeTruthy();
    expect(pattern.match('')).toBeFalsy();
    expect(pattern.match('AB')).toBeFalsy();
    expect(pattern.match('BC')).toBeFalsy();
    expect(pattern.match('AABC')).toBeFalsy();

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
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('B')).toBeTruthy();
    expect(pattern.match('AB')).toBeFalsy();
    expect(pattern.match('AA')).toBeFalsy();
    expect(pattern.match('BB')).toBeFalsy();

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
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('B')).toBeTruthy();
    expect(pattern.match('C')).toBeTruthy();
    expect(pattern.match('AB')).toBeFalsy();
    expect(pattern.match('ABC')).toBeFalsy();
    expect(pattern.match('BC')).toBeFalsy();
})

test("test simple quantifiers", () => {
    var pattern = new XsdPattern("A+B*C?");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(3);
    expect(branches[0].pieces[0].quantifier.min).toBe(1);
    expect(1/branches[0].pieces[0].quantifier.max).toBe(0); //check infinity trick
    expect(branches[0].pieces[1].quantifier.min).toBe(0);
    expect(1/branches[0].pieces[1].quantifier.max).toBe(0); //check infinity trick
    expect(branches[0].pieces[2].quantifier.min).toBe(0);
    expect(branches[0].pieces[2].quantifier.max).toBe(1);
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('AB')).toBeTruthy();
    expect(pattern.match('ABC')).toBeTruthy();
    expect(pattern.match('AC')).toBeTruthy();
    expect(pattern.match('ABBBBBBC')).toBeTruthy();
    expect(pattern.match('AAAAAABBBBBBC')).toBeTruthy();
    expect(pattern.match('BC')).toBeFalsy();
    expect(pattern.match('ABCC')).toBeFalsy();
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
    expect(1/branches[0].pieces[1].quantifier.max).toBe(0); //check infinity trick
    expect(branches[0].pieces[2].quantifier.min).toBe(4);
    expect(branches[0].pieces[2].quantifier.max).toBe(4);
    expect(pattern.match('AABBCCCC')).toBeTruthy();
    expect(pattern.match('AAAABBCCCC')).toBeTruthy();
    expect(pattern.match('AABBBBBBBBBBCCCC')).toBeTruthy();
    expect(pattern.match('AAABBBBBBCCCC')).toBeTruthy();
    expect(pattern.match('ABBCCCC')).toBeFalsy();
    expect(pattern.match('AABCCCC')).toBeFalsy();
    expect(pattern.match('AABBCCC')).toBeFalsy();
    expect(pattern.match('AAAAABBCCCC')).toBeFalsy();
    expect(pattern.match('AABBCCCCC')).toBeFalsy();
})

test("test Error on Quantifier", () => {
    var pattern = new XsdPattern("A{2,4B{2,}C{4}");
    expect(pattern.isValid().result).toBeFalsy();
    expect(pattern.isValid().reason).toBe("Missing } to close quantifier");
})

test("inner expression branches", () => {
    var pattern = new XsdPattern("A|(AB|CD)");
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
        expect(innerBranches[0].pieces).toHaveLength(2);
        expect(innerBranches[0].pieces[0].atom).toBeInstanceOf(SingleChar);
        expect(innerBranches[0].pieces[0].atom).toStrictEqual(new SingleChar("A"));
        expect(innerBranches[0].pieces[1].atom).toStrictEqual(new SingleChar("B"));
        expect(innerBranches[1].pieces).toHaveLength(2);
        expect(innerBranches[1].pieces[0].atom).toBeInstanceOf(SingleChar);
        expect(innerBranches[1].pieces[0].atom).toStrictEqual(new SingleChar("C"));
        expect(innerBranches[1].pieces[1].atom).toStrictEqual(new SingleChar("D"));
    }
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('AB')).toBeTruthy();
    expect(pattern.match('CD')).toBeTruthy();
    expect(pattern.match('B')).toBeFalsy();
    expect(pattern.match('AAB')).toBeFalsy();
    expect(pattern.match('ACD')).toBeFalsy();
    expect(pattern.match('BC')).toBeFalsy();
})

test("advanced quantifiers", () => {
    var pattern = new XsdPattern("A+|(B?|C)*");
    var regexp: Regexp = {
        branches: [
            {
                pieces: [
                    {
                        atom: { char: "A" },
                        quantifier: { min: 1, max: Infinity }
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
                        quantifier: { min: 0, max: Infinity }
                    }
                ]
            }
        ]
    }

    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp).toEqual(regexp);
    expect(pattern.match('A')).toBeTruthy();
    expect(pattern.match('AAAAAA')).toBeTruthy();
    expect(pattern.match('')).toBeTruthy();
    expect(pattern.match('BBBB')).toBeTruthy();
    expect(pattern.match('BCCCBCBBCC')).toBeTruthy();
    expect(pattern.match('ABC')).toBeFalsy();
    expect(pattern.match('AC')).toBeFalsy();
    expect(pattern.match('AB')).toBeFalsy();
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
    expect(pattern.match('..')).toBeTruthy();
    expect(pattern.match('.A')).toBeFalsy();
    expect(pattern.match('.$')).toBeFalsy();
    expect(pattern.match('A.')).toBeFalsy();
})

test("Wild Char", () => {
    var pattern = new XsdPattern(".*");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toBeInstanceOf(WildChar);
    expect(pattern.match('')).toBeTruthy();
    expect(pattern.match('basically anything 😀')).toBeTruthy();
    expect(pattern.match('basically anything\r\n but not crlf')).toBeFalsy();

})

test("MultiChar space ", () => {
    var pattern = new XsdPattern("\\s+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new MultiChar("s"));
    expect(pattern.match(' ')).toBeTruthy();
    expect(pattern.match('  ')).toBeTruthy();
    expect(pattern.match('\t\n\r')).toBeTruthy();
    expect(pattern.match('a')).toBeFalsy();
    
    var pattern = new XsdPattern("\\S+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new MultiChar("S"));
    expect(pattern.match(' ')).not.toBeTruthy();
    expect(pattern.match('  ')).not.toBeTruthy();
    expect(pattern.match('\t\n\r')).not.toBeTruthy();
    expect(pattern.match('a')).not.toBeFalsy();

})

test("MultiChar namecharstart (\\i) ", () => {
    var pattern = new XsdPattern("\\i+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new MultiChar("i"));
    expect(pattern.match('Document')).toBeTruthy();
    expect(pattern.match('_doc')).toBeTruthy();
    expect(pattern.match('教育')).toBeTruthy();
    expect(pattern.match('evensmiley😀')).toBeTruthy();
    expect(pattern.match('-')).toBeFalsy();
    expect(pattern.match('0')).toBeFalsy();
    expect(pattern.match(' ')).toBeFalsy();
    expect(pattern.match('  ')).toBeFalsy();
    expect(pattern.match('\t\n\r')).toBeFalsy();
    
    
    var pattern = new XsdPattern("\\I+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new MultiChar("I"));
    expect(pattern.match('Document')).not.toBeTruthy();
    expect(pattern.match('_doc')).not.toBeTruthy();
    expect(pattern.match('教育')).not.toBeTruthy();
    expect(pattern.match('evensmiley😀')).not.toBeTruthy();
    expect(pattern.match('-')).not.toBeFalsy();
    expect(pattern.match('0')).not.toBeFalsy();
    expect(pattern.match(' ')).not.toBeFalsy();
    expect(pattern.match('  ')).not.toBeFalsy();
    expect(pattern.match('\t\n\r')).not.toBeFalsy();
    

})

test("MultiChar namechar (\\c) ", () => {
    var pattern = new XsdPattern("[\\c]+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.match('Document')).toBeTruthy();
    expect(pattern.match('_doc')).toBeTruthy();
    expect(pattern.match('教育')).toBeTruthy();
    expect(pattern.match('evensmiley😀')).toBeTruthy();
    expect(pattern.match('-')).toBeTruthy();
    expect(pattern.match('0')).toBeTruthy();
    expect(pattern.match(' ')).toBeFalsy();
    expect(pattern.match('  ')).toBeFalsy();
    expect(pattern.match('\t\n\r')).toBeFalsy();
    
    
    var pattern = new XsdPattern("[\\C]+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.match('Document')).not.toBeTruthy();
    expect(pattern.match('_doc')).not.toBeTruthy();
    expect(pattern.match('教育')).not.toBeTruthy();
    expect(pattern.match('evensmiley😀')).not.toBeTruthy();
    expect(pattern.match('-')).not.toBeTruthy();
    expect(pattern.match('0')).not.toBeTruthy();
    expect(pattern.match(' ')).not.toBeFalsy();
    expect(pattern.match('  ')).not.toBeFalsy();
    expect(pattern.match('\t\n\r')).not.toBeFalsy();
    

})

test("Category", () => {
    var pattern = new XsdPattern("\\p{Lu}+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new Category("Lu",false));
    expect(pattern.match('AAA')).toBeTruthy();
    expect(pattern.match('aaa')).toBeFalsy();
    
})

test("Complement", () => {
    var pattern = new XsdPattern("\\P{Lu}+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new Complement("Lu",false));
    expect(pattern.match('AAA')).not.toBeTruthy();
    expect(pattern.match('aaa')).not.toBeFalsy();
    
})

test("Category Script", () => {
    var pattern = new XsdPattern("\\p{IsKatakana}+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new Category("Katakana",true));
    expect(pattern.match('トウキョウ')).toBeTruthy();
    expect(pattern.match('大阪')).toBeFalsy();
})

test("Complement Script", () => {
    var pattern = new XsdPattern("\\P{IsKatakana}+");
    expect(pattern.isValid().result).toBeTruthy();
    expect(pattern.regexp.branches[0].pieces[0].atom).toStrictEqual(new Complement("Katakana",true));
    expect(pattern.match('トウキョウ')).not.toBeTruthy();
    expect(pattern.match('大阪')).not.toBeFalsy(); 
})


