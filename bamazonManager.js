var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: 'localhost',
    // Your port; if not 3306
    port: 3306,
    // Your sql username
    user: 'nodeUser',
    // Your password
    password: '',
    database: 'bamazon_db'

});

connection.connect(function(err) {
    if (err) throw err;
    welcomeMenu();
});

function welcomeMenu() {
    console.log("");
    inquirer.prompt([{
            type: "rawlist",
            message: "Please enter number to select option, then hit return",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
            name: "action"
        }, ])
        .then(function(user) {
            switch (user.action) {
                case "View Products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                case "Exit":
                    exit();
                    break;
            }
        });
}


function viewProducts() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;


        var table = new Table({
            head: ["Product ID", "Product Name", "Department Name", "Price", "Quantity"],
            colWidths: [13, 20, 20, 13, 13],
            wordWrap: true
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());

        welcomeMenu();
    });
}

function viewLowInventory() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["Product ID", "Product Name", "Department Name", "Price", "Quantity"],
            colWidths: [13, 20, 20, 13, 13],
            wordWrap: true
        });

        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {
                table.push(
                    [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]

                );
            }
        }

        if (table.length > 0) {
            console.log("\nProducts with less than 5 remaining:");
            console.log(table.toString());
        } else {
            console.log("\nNo low quality products\n");
        }

        welcomeMenu();
    });
}

function addInventory() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["Product ID", "Product Name", "Department Name", "Price", "Quantity"],
            colWidths: [13, 20, 20, 13, 13],
            wordWrap: true
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());
        inquirer.prompt([{
                type: "input",
                message: "Product ID: ",
                name: "itemNumber"
            },
            {
                type: "input",
                message: "Quantity: ",
                name: "howMany"
            },

        ]).then(function(answers) {


            connection.query("SELECT * FROM products WHERE item_id=?", [answers.itemNumber], function(err, res) {



                var amountInStock = res[0].stock_quantity;
                var amountAdded = answers.howMany;
                var productID = res[0].itemNumber;
                var newQuantity = parseInt(amountInStock) + parseInt(amountAdded);
                var displayID = parseInt(res[0].item_id);

                var test = connection.query(
                    "UPDATE products SET ? WHERE ?", [{
                            stock_quantity: newQuantity
                        },
                        {
                            item_id: displayID
                        }
                    ],
                    function(error) {
                        if (error) throw error;
                    })
                console.log("----------------");
                console.log("Quantity updated");
                console.log("----------------");
                welcomeMenu();
            })
        })
    })
}

function addNewProduct() {

    var newItemID;

    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;

        newItemID = res.length + 1;
    })

    inquirer.prompt([{
            type: "input",
            message: "Product name:",
            name: "itemName"
        },
        {
            type: "input",
            message: "Department:",
            name: "itemDepartment"
        },
        {
            type: "input",
            message: "Price:",
            name: "itemPrice"
        },
        {
            type: "input",
            message: "Quanity:",
            name: "itemQuantity"
        },
    ]).then(function(user) {
        connection.query("INSERT INTO products SET ?", {
            item_id: newItemID,
            product_name: user.itemName,
            department_name: user.itemDepartment,
            price: user.itemPrice,
            stock_quantity: user.itemQuantity
        }, function(err, result) {
            if (err) throw err;

            console.log("\nProduct added!\n");
            welcomeMenu();
        });
    });
}

function exit() {
    connection.end();
    console.log("Connection terminated");
}