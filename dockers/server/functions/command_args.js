// Durchgehen der Paramater

function format(param)
{
//    param += "=sad";
    console.log("param: >"+param+"<");
    var tiles = param.match(/\-([a-zA-Z]+)\=([a-zA-Z0-9\ \_]+)$/);
    if (tiles !== null)
    {
        return([tiles[1], tiles[2]]);
    }
    else
        return false;
}

var args = { 
    params: [],
    init: function (arguments) {
        arguments.forEach(function (val, index) {
            if (index > 1)
            {
                var param = format(val);
                
                if (param !== false)
                {
//                    console.log(param);
                    args.params.push(param);
                }
            }
        });
        
        args.requiredParamsAvailable();
        
        args.makeObject();
    },
    requiredParamsAvailable: function () {
        var required = ["name", "method", "duration", "uri"];
        
        var available = true;
        
        required.forEach(function (param, index) {
            var found = false;
            
            args.params.forEach(function (item) {
                if (item[0] == param)
                    found = true;
            });
            
            if (!found)
                available = false;
        })
        
        if (!available)
        {
            console.log("Nicht alle Pflichtparameter angegeben!");
            console.log(required);
            console.log("Angegeben:");
            console.log(args.params);
            process.exit(-1);
        }
    },
    makeObject: function () {
        var params = args.params;
        args.params = {};
        
        params.forEach(function (item) {
            args.params[item[0]] = item[1];
        })
    },
    setConfigs: function (config) {
        
        config.productName = args.params.name;
        config.duration = args.params.duration;
        config.applicationUri = 'urn:'+args.params.uri;
        config.productUri = args.params.uri;
        config.methods[0].name = args.params.method;
        
        if (args.params.port !== null)
            config.port = args.params.port;
        
        return config;
    }
};

module.exports = args;