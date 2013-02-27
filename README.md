schema.org-type-ancestry
========================

Schema.org type ancestry

## Installation ##

If you're using node.js, install it via npm thusly:

    $ npm install schema.org-type-ancestry
    
## Example Usage ##

    var schematype = require('schema.org-type-ancestry).schema;
    
    // What are the ancestors of WPFooter?
    
    console.log(schematype['http://schema.org/WPFooter'].superClassSet);
    
    // Is Hospital a type of LocalBusiness?
    
    if (schematype['http://schema.org/Hospital].superClassSet['http://schema.org/LocalBusiness']) {
        console.log('Yes');
    } else {
        console.log('No'):
    }