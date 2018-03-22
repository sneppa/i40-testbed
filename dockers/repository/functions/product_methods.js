var opcua = require("node-opcua");
var mUtil = require("../functions/db_connector.js");

var product_methods = [{description: {
            browseName: "setStatus",
            inputArguments: [
                {
                    name: "step",
                    description: {text: "Name der Produktionsstufe"},
                    dataType: opcua.DataType.String
                }, {
                    name: "status",
                    description: {text: "Mögliche Status: WAIT, PRODUCE, FINISHED, FAILURE"},
                    dataType: opcua.DataType.String
                }
            ],
            outputArguments: [{
                    name: "success",
                    description: {text: "Status konnte gesetzt werden"},
                    dataType: opcua.DataType.Boolean,
                    valueRank: 1
                }]
        }, call: async function (inputArguments, context, callback) {

            var step = inputArguments[0].value;
            var stepIndex = null;
            var status = inputArguments[1].value.toUpperCase();
            var allowedStatus = ["WAIT", "PRODUCE", "FINISHED", "FAILURE"];
            
            var returnValue = [false];
            
//            console.log(inputArguments);
            var idproduct = context.server.serverInfo.productUri;
            console.log("Status change: "+idproduct+" ("+step+": "+status+")");
            
            var product = await mUtil.getProduct(idproduct);
            
            // Index der Produktionsstufe auslesen
            product.step.forEach(function (astep) {
                if (astep.name.toUpperCase() == step.toUpperCase())
                    stepIndex = astep.index;
            });
            
//            console.log((product.status != "FAILURE")+" && "+inArray(status, allowedStatus)+" && "+(stepIndex != null) + " step: "+stepIndex);
            // Änderungen nur wenn Produkt und Status und Produktionsstufe i.O.
            if (product.status != "FAILURE" && inArray(status, allowedStatus) && stepIndex != null) 
            {
                if (stepIndex == product.currentStep)
                {
                    product.status = status;
                    product.currentStep = stepIndex;
                    
                    if (status == "PRODUCE")
                        product.location = step;
                    else if (status == "FINISHED")
                        product.location = "Lager";
                    
                    mUtil.updateProduct(product);
                    returnValue = [true];
                }
                else if(stepIndex == product.currentStep+1 && product.status == "FINISHED") // Nächster Produktionsschritt
                {
                    product.status = "WAIT";
                    product.location = "Lager";
                    product.currentStep = stepIndex;
                    mUtil.updateProduct(product);
                    returnValue = [true];
                }
            }
        
//            console.log(stepIndex);
            //product.currentStep;

            var callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                        dataType: opcua.DataType.Boolean,
                        arrayType: opcua.VariantArrayType.Array,
                        value: returnValue
                    }]
            };
            callback(null, callMethodResult);
        }}];

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

module.exports = product_methods;