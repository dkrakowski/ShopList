var fs = require('fs');

var logFilePath = './log.txt';
var logLevel;
var consolePrint;

var readConfig = function () {
    var confgFile = fs.readFileSync('./logConfig.json');
    var config = JSON.parse(confgFile);
    consolePrint = config.consolePrint;
    logLevel = config.logLevel;
}

var checkExistingLogFile = function (logFilePath) {
    if (fs.existsSync(logFilePath)) {
        return
    } else {
        var dateNow = new Date;
        dateNow = dateNow.toUTCString();

        var message = dateNow + '| Create log file in path: ' + logFilePath;

       fs.appendFile(logFilePath,message ,function (err) {
           if (err){
               console.log('Error during try to generate file');
               console.log(err);
           }else {
               console.log('Create log file');
           }
       });
    }
};

readConfig();

exports.createLog = function (message, level) {
    checkExistingLogFile(logFilePath);
    var dateNow = new Date;
    dateNow = dateNow.toUTCString();
    message = dateNow + ' | Level: ' + level + ' | ' + message;

    if(level === logLevel){
        var newLog = fs.createWriteStream(logFilePath,{
            flags: 'a'
        })
        newLog.write(`
${message}`);
        newLog.end();
    }else if(level == "error" && logLevel == "warrning"){
        var newLog = fs.createWriteStream(logFilePath,{
            flags: 'a'
        })
        newLog.write(`
${message}`);
        newLog.end();
    }else if(logLevel === "all"){
        var newLog = fs.createWriteStream(logFilePath,{
            flags: 'a'
        })
        newLog.write(`
${message}`);
        newLog.end();
    }

    if(consolePrint === "true"){
        console.log(message);
    }
}