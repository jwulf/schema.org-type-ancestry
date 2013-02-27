/* 

    Author: jwulf@redhat.com
    (with thanks to codemiller)
    
    Generates a JSON object containing the schema.org types with their superclasses.
    That file is useful for validating expected types.
    
    This generator requires the schema.org schema loaded into a StarDog database.
    You can get the schema.org schema in RDF format from: http://schema.rdfs.org/
    The StarDog database is available from: stardog.com
    
    This code wouldn't be so brute force, except I couldn't get RDFS inferencing to work
    using the javascript module. See:
    https://groups.google.com/a/clarkparsia.com/forum/?fromgroups=#!topic/stardog/mBuoPP57ZOA
    
    The jobTotal cosmological constant is a bit kludgy (hey - it works!). 
    Seems like overkill to add eventing.
    
*/

var stardog = require("stardog");
 
var conn = new stardog.Connection();

var jsonSchema = {},
    queryResult,
    jobCount,
    jobTotal;

conn.setEndpoint("http://127.0.0.1:5822/");
conn.setCredentials("admin", "admin");
 
var query = "select ?s ?o { ?s rdfs:subClassOf ?o }";
console.log(query);
conn.query("schema", query,
    null, null, 0, function(data) {
    var thisResult,
    thisClass,
    superClass;

    queryResult = data.results.bindings;
    // To  get the jobTotal cosmological constant, run the program once, and note the last number in the output
    jobTotal = 553; //queryResult.length; // Can't use queryResult.length because of multiple class inheritance 
    jobCount = 1;
    for ( thisResult = 0; thisResult < data.results.bindings.length; thisResult ++ )
    {
        if (data.results.bindings[thisResult].s) {
            thisClass = data.results.bindings[thisResult].s.value;
            superClass = data.results.bindings[thisResult].o.value;
            
            jsonSchema[thisClass] = ((jsonSchema[thisClass]) ? jsonSchema[thisClass] : { }); 
            jsonSchema[thisClass].superClassSet = ((jsonSchema[thisClass].superClassSet) ? jsonSchema[thisClass].superClassSet : { }); 
            
            recursivelyAddSuperClass (superClass, thisClass);
        }
    }    
});

function recursivelyAddSuperClass (superClass, thisClass) {
    if (jsonSchema[thisClass].superClassSet[superClass])  // loop detected or already parsed this tree
        return checkDone();
        
    jsonSchema[thisClass].superClassSet[superClass] = true;
    
    if (superClass == 'http://schema.org/Thing') 
        return checkDone();
    
    // Now find the superclass entry for the superclass

    for (var result = 0; result < queryResult.length; result ++) {
        if (queryResult[result].s.value == superClass) {
            var mySuperClass = queryResult[result].o.value;
            recursivelyAddSuperClass(mySuperClass, thisClass);
        }
    }
}

function checkDone (){
    jobCount ++;
    console.log(jobCount + ' of ' + queryResult.length);
    if (jobCount == jobTotal)
    {
        //console.log(jsonSchema);
        var fs = require('fs');
        fs.writeFile("schema-classes.json", JSON.stringify(jsonSchema), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        }); 
    }
}
