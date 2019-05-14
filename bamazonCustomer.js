var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
    // Your port; if not 3306
    port: 3306,
    // Your sql username
    user: 'Nodeuser',
    // Your password
    password: '',
    database: 'bamazon_db'
});

connection.connect(function(err, res) {
    if (err) throw err;
    // selectAll();
    orderInput();
});

function selectAll() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

    });
};

function orderInput() {
    inquirer.prompt([{
                type: "input",
                message: "Please enter product ID",
                name: "id"
            },
            {
                type: "input",
                message: "Please enter quantity",
                name: "quantity"
            },
        ])
        .then(function(result) {
            connection.query("SELECT * FROM products WHERE item_id=?", [result.id], function(err, res) {

                ;

                if (res.length === 0) {
                    console.log("---------------");
                    console.log("Invalid ID");
                    console.log("---------------");
                    orderInput();
                } else {

                    for (var i = 0; i < res.length; i++) {

                        var price = (result.quantity * res[i].price);
                        var roundedPrice = Math.round(price * 100) / 100;
                        var displayPrice = "$" + roundedPrice;


                        var item = res[i].product_name;

                        var itemID = result.id;


                        var amountRequested = result.quantity;

                        var amountInStock = res[i].stock_quantity;

                        if (amountRequested > amountInStock) {
                            console.log("---------------");
                            console.log("Insufficient quantity");
                            console.log("---------------");

                            orderInput();
                        } else {
                            placeOrder(item, amountRequested, amountInStock, displayPrice, itemID);
                        }
                    }
                }
            })
        });
};

function placeOrder(item, amountRequested, amountInStock, displayPrice, itemID) {


    updateDatebase(amountRequested, amountInStock, itemID);

    console.log("---------------");
    console.log("Order complete");
    console.log("");
    console.log("id: " + itemID);
    console.log("item: " + item);
    console.log("quantity: " + amountRequested);
    console.log("price: " + displayPrice);
    console.log("---------------");
}

function updateDatebase(amountRequested, amountInStock, itemID) {
    var newQuantity = (amountInStock - amountRequested);


    connection.query(
        "UPDATE products SET ? WHERE ?", [{
                stock_quantity: newQuantity
            },
            {
                item_id: itemID
            }
        ],
        function(error) {
            if (error) throw error;
            exit();
        }
    );


}

function exit() {
    connection.end();
    console.log("Connection terminated");
}