var isNumber = function(quantity){
    var quantityCheck = isNaN(quantity);

    if(quantityCheck){
        return false
    }else {
        return true
    }
}

exports.validateInputData = function (product, quantity) {
    var quantityCheck = isNumber(quantity);

    if( product.length >= 1 && quantityCheck){
        return true
    }else {
        return false
    }
}