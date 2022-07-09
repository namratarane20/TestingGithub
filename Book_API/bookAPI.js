const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');
// var cors = require('cors');
// app.use(cors());

// parse application/json
app.use(bodyParser.json());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

//create database connection
const conn = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: 'Swamisamarth123@',
    database: 'elibrary'
});

//connect to database
conn.connect((err) => {

    if (err) throw err;
    console.log('Mysql Connected successfully -----------------');
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

let finalResult = {}
let errorDetails = {}

let completeData = []

conn.query('SELECT * FROM books WHERE isdeleted = false', (err, results, field) => {
    if (err) throw err;
    completeData = results
    completeData = JSON.parse(JSON.stringify(results));
    for (let i in completeData) {
        console.log(completeData[i].bookid);
    }
    // console.log('It is the complete data', completeData[0], typeof(completeData));
})

//show all books
app.get('/api/displayBooks', (req, res) => {

    let sql = "SELECT * FROM books WHERE isdeleted = false ORDER BY id desc";
    conn.query(sql, (err, results) => {
        if (err) throw err;
        // finalResult = {
        //     books: results
        // }
        // return res.json(results)
        res.status(200).send(results)

    });
});


app.get('/api/getSingleBook', (req, res) => {
    const errors = []

    if (!req.query.bookId) {
        errors.push({
            "status": 400,
            "message": "Required book id to get book"
        })
    }
    

    if (errors.length) {
        res.status(400).send(errors)
    }
    else {

        var id = req.query.bookId
        var sql = `SELECT * FROM books WHERE bookid = '${id}' AND isdeleted = false`
        conn.query(sql, (err, results) => {
            if (err) throw err
            if (results.length == 0) {
                errors.push({
                    status: 400,
                    message: ` NO book availble for id ${id}`
                })
                res.status(400).send(errors)
            }
            else {
                finalResult = {
                    book: results
                }
                console.log(results.length);

                res.status(200).send(finalResult)
            }

        })
    }

})

app.post('/api/addBook', (req, res) => {

    const errors = []

    var bookId = req.body.bookId
    var bookName = req.body.bookName
    var author = req.body.author
    var price = req.body.price
    var isdeleted = false
    var isassigned = false

    if (!bookId) {
        errors.push({
            message: 'Please enter book Id'
        })
    }

    else  {

        for (var id in completeData) {
            if (bookId == completeData[id].bookid) {
                errors.push({
                    message: 'This book id is already exist, PLease enter anathor books id '
                })
            }
        }
    }

   
    if (!bookName) {
        errors.push({
            message: 'Please enter book name'
        })
    }

    if (!author) {
        author = 'NA'
    }

    if (!price) {
        errors.push({
            message: 'Please enter the price'
        })
    }
    else if(isNaN(price)) {
        errors.push({
            message: 'Please enter proper price( price should be number)'
        })
    }

    finalResult = {
        status: 400,
        errors: errors
    }
    if (errors.length) {
        res.status(400).send(finalResult)
    }
    else {

        var sql = `INSERT INTO books(bookid, bookname, author, price, isdeleted, isassigned) VALUES('${bookId}','${bookName}','${author}','${price}',${isdeleted},${isassigned});`
        conn.query(sql, (err, results) => {

            if (err) throw err;

            // if (errors.length) {
            //     res.status(400).send(errors)
            // }

            else {
                finalResult = {
                    status: 200,
                    message: 'Book added successfully !!!'
                }
                res.status(200).send(finalResult)
            }

        })
    }




})

// update book detatils
app.put('/api/updateBookNameById', (req, res) => {
    var responseList =[];
    var id = req.body.bookId
    var newBookName = req.body.newBookName
    console.log(id, newBookName);

    var sql = `UPDATE books SET bookname = '${newBookName}' WHERE bookid = '${id}';`
    conn.query(sql, (err, results) => {
        if (err) throw err
        else {
            responseList.push({
                status: 200,
                message: 'Book name updated successfully !!!'
            })
            
            res.send(responseList)
        }
    })

})

app.post('/api/assignBookToUser', (req, res) => {
    var id = req.body.bookId;
    var user = req.body.userName;
    console.log('user name book id', id, user);
    var sql = `INSERT INTO booksandusers(assignedbookid,username) VALUES ('${id}','${user}');`
    conn.query(sql, (err, results) => {

        if (err) throw err;
        else {
            finalResult = {
                status: 200,
                message: `Book '${id}' is assigned to user '${user}'`
            }
            res.send(finalResult)

        }


    });

    setAssigned(req.body.bookId);
    console.log('funstion called');


})

function setAssigned(assignedId) {
    console.log('inside function called');
    var sql2 = `update books set isassigned = true where bookid = '${assignedId}';`
    conn.query(sql2, (err, results) => {
        console.log('inside query');
        if (err) throw err
        // return results
    })
}

app.put('/api/deleteBook', (req, res) => {
    var id = req.body.bookId
    var finalRes = [];

    // update elibrary.books set isdeleted = false where bookid = 'B10';
    // UPDATE visentry SET flag = ?', [flag]
    var sql = `update books set isdeleted = true where bookid = '${id}' and isassigned = false;`
    conn.query(sql, (err, results) => {
        if (err) throw err;
        else {
            // finalResult = {
            //     status: 200,
            //     message: `Book of Book Id of ${id} is deleted successfully`
            // }
            finalRes.push({
                status: 200,
                message: `Book of Book Id of ${id} is deleted successfully`
            })
            res.send(finalRes).end()
        }

    })
})


app.get('/api/getUserAndId', (req, res) => {
    let userNameList = [];
    let bookIdList = [];

    let finalList = [];
    let distUserName = [];
    let distBookId = []
    var sql = `select username from users`
    conn.query(sql, (err, results) => {
        if (err) throw err;
        else {
            var sql2 = `select bookid from books where isdeleted = false order by id desc`
            console.log('===================================================');
            conn.query(sql2, (err, results2) => {
                if (err) throw err;
                else {

                    userNameList = results
                    userNameList = JSON.parse(JSON.stringify(results));
                    bookIdList = results2
                    bookIdList =JSON.parse(JSON.stringify(results2))
                    for (var user in userNameList){
                        finalList.push({
                            user:userNameList[user].username
                        })
                    }

                    for (var id in bookIdList){
                        finalList.push({
                            bookid:bookIdList[id].bookid
                        })
                    }
                  
            console.log(userNameList);
                    res.send(finalList).end()
                }

            })
            // res.send(finalResult).end()
        }

    })
})


app.post('/demo',(req, res, next) =>{
    var inserts = [];
var bookid = req.body.bookId

var list = req.body.usernameList
    
for(var i in list){
    inserts.push([bookid,list[i]])
}
console.log('mY LIST', inserts);
// inserts.push(['b10', 'uname1']);
// inserts.push(['b20', 'uname2']);
console.log('My list',inserts );
conn.query({
sql: 'INSERT into demo (bookid, username) VALUES ?',
values: [inserts]
});
res.send(results)
})

//Server listening to port
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});