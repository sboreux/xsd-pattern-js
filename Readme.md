# XSD-Pattern-JS

This library parse a XSD (XML Schema) regular expression (as use in a pattern facet). It can output an equivalent javascript (ECMAScript) regexp. This allow to validate an XSD pattern directly in javascript.

## How to use it 

### Javascript

```javascript
var xpj = require("xsd-pattern-js")
var pattern = new xpj.XsdPattern("A+");
pattern.match("AA"); //return true
pattern.match("AB"); //return false

```