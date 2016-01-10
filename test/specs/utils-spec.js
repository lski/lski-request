describe("utils", function () {

    var utils = lski.request.utils;
    
	it("isFunction works correctly", function () {

        expect(utils.isFunction(function() {})).toBe(true);
        expect(utils.isFunction(null)).toBe(false);
        expect(utils.isFunction({})).toBe(false);
        expect(utils.isFunction(1)).toBe(false);
        expect(utils.isFunction("")).toBe(false);
        expect(utils.isFunction(new Date())).toBe(false);
        expect(utils.isFunction([])).toBe(false);
	});
    
    it("isDate works correctly", function () {

        expect(utils.isDate(function() {})).toBe(false);
        expect(utils.isDate(null)).toBe(false);
        expect(utils.isDate({})).toBe(false);
        expect(utils.isDate(1)).toBe(false);
        expect(utils.isDate("")).toBe(false);
        expect(utils.isDate(new Date())).toBe(true);
        expect(utils.isDate([])).toBe(false);
	});

    it("isArray works correctly", function () {

        expect(utils.isArray(function() {})).toBe(false);
        expect(utils.isArray(null)).toBe(false);
        expect(utils.isArray({})).toBe(false);
        expect(utils.isArray(1)).toBe(false);
        expect(utils.isArray("")).toBe(false);
        expect(utils.isArray(new Date())).toBe(false);
        expect(utils.isArray([])).toBe(true);
	});
    
    it("basic merge", function() {
    
        var obj1 = {};
        var returned = utils.merge(obj1, { a: 1 });
        
        expect(obj1.a).toBe(1);
        // should have altered the returned object too
        expect(returned.a).toBe(1);
    });
    
    it("basic clone", function() {
    
        var obj = utils.merge({}, { a: 1 });
        
        expect(obj.a).toBe(1);
    });
    
    it("multiple args clone", function() {
    
        var obj1 = {a: 1, b: 2};
        var returned = utils.merge({}, obj1, { b: 3 });
        
        expect(returned.b).toBe(3);
        // should not have altered obj1
        expect(obj1.b).toBe(2);
    });
    
    it("clone with sub object", function() {
    
        var obj1 = { a: 1, b: { c: { d: 2, e: 3 } }};
        var obj2 = { b: { c: { d: 100 } } };
        var returned = utils.merge({}, obj1, obj2);
    
        expect(returned.b.c.d).toBe(100);
        // e should be unchanged
        expect(returned.b.c.e).toBe(3);
        // a should be unchanged
        expect(returned.a).toBe(1);
    });
    
    it("clone with null", function() {
    
        expect(utils.merge({ a: 1 }, null, { a: 2 }).a).toBe(2);
    });
    
    it("clone with date", function() {
    
        var now = new Date();
        
        expect(utils.merge({}, { a: now }).a).toBe(now);
    });
    
    it("clone with array", function() {
    
        expect(utils.merge({}, { a: ['1'] }).a.length).toBe(1);
    });
});