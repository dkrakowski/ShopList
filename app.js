require ('dotenv').config({path: '.env'});

var port = process.env.Server_port;
var log = require('./loger');
var validate = require('./dataValidation');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: port});

var sqlite = require('sqlite3').verbose();

log.createLog("Server start up on port " + port.toString(), "info");

var db = new sqlite.Database('./db/db.sqlite', sqlite.OPEN_READWRITE, function (err) {
    if (err){
        log.createLog(err.message);
        log.createLog("Close server due to database connection error", "error");
        setTimeout(function () {
            process.exit();
        }, 1000);
    }else {
        log.createLog('Connected successful!', "info")
    }
});

wss.on('connection', function (ws, req) {
    log.createLog("New connection from ip: " + req.connection.remoteAddress, "info");
    db.all("SELECT id,product,quantity from productList", function (err, rows) {
        if(err){
            log.createLog("Connection select error: " + err, "error");

        }else {
            rows.forEach(function (row) {
                var productID = row.id;
                var product = row.product;
                var quantity = row.quantity;

                var message = JSON.stringify({
                    id: productID,
                    product: product,
                    quantity: quantity,
                    action: "added"
                });
                ws.send(message);
                log.createLog('Send message to client: ' + message, "info");
            })
        }
    })

    ws.on('message', function (message) {
        var  reciveDataObj = JSON.parse(message);
        var action = reciveDataObj.action;

        if (action === "added"){
            var product = reciveDataObj.product;
            var quantity = reciveDataObj.quantity;

            log.createLog("Get added request for product: " + product, "info");

            var validateResult = validate.validateInputData(product, quantity);

            if(validateResult){
                db.run('INSERT into productList(product,quantity) values("' + product +'",' + quantity +');', function (err) {
                    if (err){
                        log.createLog("Insert action error: " + err.message, "error");
                    }else {
                        var addedProductID =  this.lastID;

                        db.each('SELECT product, quantity from productList WHERE id=' + addedProductID +';', function (err, row) {
                            if (err) {
                                log.createLog("Select added action error: " + err.message, "error");
                            }else {
                                var product = row.product;
                                var quantity = row.quantity;

                                var message = JSON.stringify({
                                    id: addedProductID,
                                    product: product,
                                    quantity: quantity,
                                    action: "added"
                                });
                                wss.clients.forEach(function (client) {
                                    client.send(message);
                                    log.createLog('Send message to client: ' + message, "info");
                                })
                            }
                        })
                    }
                });
            }else {
                log.createLog("Wrong receive data for value: product " + product + " quantity " + quantity, "error");

                var message = JSON.stringify({
                    action: 'error'
                });

                wss.clients.forEach(function (client) {
                    client.send(message);
                    log.createLog('Send message to client: ' + message, "info");
                })
            }

        } else if (action === "delete"){
            var deleteProductID = reciveDataObj.id;
            db.run('DELETE FROM productList WHERE id=' + deleteProductID + ';', function (err) {
                if (err){
                    log.createLog("Delete action error : " + err, "error");
                }else{
                    var message = JSON.stringify({
                        id: deleteProductID,
                        action: "delete"
                    });
                    wss.clients.forEach(function (client) {
                        client.send(message);
                        log.createLog('Send message to client: ' + message, "info");
                    })
                }
            });
        }
    })
});
