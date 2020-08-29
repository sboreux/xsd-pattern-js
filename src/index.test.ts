const { XsdPattern } = require(".");
const { NormalChar, Regexp } = require("./components");

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
    expect(branches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[0].atom.char).toBe("A");
    expect(branches[0].pieces[0].quantifier.min).toBe(1);
    expect(branches[0].pieces[0].quantifier.max).toBe(1);
})

test("literals only", () => {
    var pattern = new XsdPattern("ABC");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(1);
    expect(branches[0].pieces).toHaveLength(3);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[0].atom.char).toBe("A");
    expect(branches[0].pieces[1].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[1].atom.char).toBe("B");
    expect(branches[0].pieces[2].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[2].atom.char).toBe("C");
})

test("2 branches", () => {
    var pattern = new XsdPattern("A|B");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(2);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[0].atom.char).toBe("A");
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[1].pieces[0].atom.char).toBe("B");

})

test("3 branches", () => {
    var pattern = new XsdPattern("A|B|C");
    expect(pattern.isValid().result).toBeTruthy();
    var branches = pattern.regexp.branches;
    expect(branches).toHaveLength(3);
    expect(branches[0].pieces).toHaveLength(1);
    expect(branches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[0].atom.char).toBe("A");
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[1].pieces[0].atom.char).toBe("B");
    expect(branches[2].pieces).toHaveLength(1);
    expect(branches[2].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[2].pieces[0].atom.char).toBe("C");

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
    expect(branches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(branches[0].pieces[0].atom.char).toBe("A");
    expect(branches[1].pieces).toHaveLength(1);
    expect(branches[1].pieces[0].atom).toBeInstanceOf(Regexp);
    var innerBranches = branches[1].pieces[0].atom.branches;
    expect(innerBranches[0].pieces).toHaveLength(1);
    expect(innerBranches[0].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(innerBranches[0].pieces[0].atom.char).toBe("B");
    expect(innerBranches[1].pieces).toHaveLength(1);
    expect(innerBranches[1].pieces[0].atom).toBeInstanceOf(NormalChar);
    expect(innerBranches[1].pieces[0].atom.char).toBe("C");

})