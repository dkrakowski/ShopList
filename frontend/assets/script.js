var serverUrl = 'ws://localhost:3000';
//var serverUrl = 'ws://dkrako.bieda.it:80';

class ServerConnection {
    constructor(wsConnectionObject) {
        this.wsConnectionObject = wsConnectionObject;
    }
    checkStatus(){
        var connectStatus = this.wsConnectionObject.readyState;
        if(connectStatus === 3){
            this.restartConnection();
        }
    }
    restartConnection(){
        location.reload();
    }
}

class Alert {
    constructor(alertBox) {
        this.alertBox = alertBox;

    }
    createValidationAlert(alertId){
        var alertDiv = document.createElement("div");
        alertDiv.innerHTML = "Brak produktu lub ilości";
        this.alertBox.appendChild(alertDiv);
        alertDiv.setAttribute("class", "alert alert-danger");
        alertDiv.setAttribute("id", alertId);
    }
    deleteAlert(alertID){
        var alertDiv = document.getElementById(alertID);
        if(alertDiv == null){
            return
        }else {
            alertDiv.remove();
        }
    }
}

//Add product row function
var addProductPosition = function (product, quantity, productID) {

    var msgBox = document.getElementById('shoppListBox');
    console.log("Added id: " + productID);
    msgBox.innerHTML += "<li id='" + productID +"'>" + "<label><input type='checkbox' name='checkbox' id='" + productID + "' >" + product + " | ilość: " + quantity + "</label></li>";
}

//Delete product row function
var deleteProductPosition = function (deleteProductID) {
    var msgBox = document.getElementById('shoppListBox');
    var elementToDelete = document.getElementById(deleteProductID);
    msgBox.removeChild(elementToDelete);
    console.log("Delete id: " + deleteProductID);
}

var getSelectedCheckboxs = function () {
    var checkedBoxes = [];
    var checkboxes = document.getElementsByName("checkbox");
    for (var i=0; i < checkboxes.length; i++){
        if (checkboxes[i].checked){
            var id = checkboxes[i].id;
            id = parseInt(id);
            checkedBoxes.push(id);
        }
    }
    return checkedBoxes;
}

window.onload = function () {
//Create websocket object to connect with server
    var ws = new WebSocket(serverUrl);
    var msgBox = document.getElementById('msgBox');

    const connection = new ServerConnection(ws);

//Check status of connection with server
    setInterval(function(){
        connection.checkStatus()
    },1000);

//Receive message from server
    ws.onmessage = function (message) {
        var reciveData = message.data;
        var reciveDataObj = JSON.parse(reciveData);

        var action = reciveDataObj.action;

        if (action === "added") {
            var product = reciveDataObj.product;
            var quantity = reciveDataObj.quantity;
            var productID = reciveDataObj.id;
            addProductPosition(product, quantity, productID);

        } else if (action === "delete") {
            var deleteProductID = reciveDataObj.id;
            deleteProductPosition(deleteProductID);
        } else if (action === "error") {
            var alertBox = document.getElementById('msgBox');
            const alert = new Alert(alertBox);
            alert.createValidationAlert('error');
        }
    };

//Send added request to server
    var sendBtn = document.getElementById('sendBtn');

    sendBtn.onclick = function (event) {
        event.preventDefault();

        var product = document.getElementById('product').value;
        var quantity = document.getElementById('quantity').value;

        var alertBox = document.getElementById('msgBox');
        const alert = new Alert(alertBox);

        if(product && quantity){
            //msgBox.innerHTML = "";
            alert.deleteAlert('error');

            var message = JSON.stringify({
                product: product,
                quantity: quantity,
                action: "added"
            });
            ws.send(message);

        } else {
            alert.createValidationAlert('error');
            //msgBox.innerHTML = "Brak produktu lub ilości!";
        }
    };

//Send delete request to server
    var deleteBtn = document.getElementById('deleteBtn');

    deleteBtn.onclick = function () {
        var deleteProductID = getSelectedCheckboxs();

        for(i=0; i<deleteProductID.length; i++){
            var message = JSON.stringify({
                id: deleteProductID[i],
                action: "delete"
            })

            ws.send(message);
        }
    }
}