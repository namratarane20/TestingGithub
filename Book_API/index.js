const express      = require('express');
const bodyParser   = require('body-parser');
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
  database: 'bookDetails'
});
 
//connect to database
conn.connect((err) =>{

  if(err) throw err;
  console.log('Mysql Connected successfully -----------------');
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//show all books
app.get('/api/books',(req, res) => {
  let sql = "SELECT * FROM books ORDER BY id DESC";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    // return res.json(results)
    res.status(200).send(results)
    
  });
});
 

app.get('/api/singleBook' ,(req,res) =>{
    if(req.query.id){
        var id = req.query.id
        var sql = `SELECT * FROM books WHERE id = ${id}`
        conn.query(sql,(err,results) =>{
            if(err) throw err
            res.send(results)
        })
    }
    else{
        var obj ={
            status : 400,
            message : 'Require book Id'
        }
        res.send(obj)
    }
})

//add new book
// app.get('/user',async(req,res)=>{
//     res.header("Access-Control-Allow-Origin", "*");
//     const user=await getuser();
//     res.send(user);
// })

app.post('/api/addBook', (req,res) =>{
    
    var id =req.body.id
    var bookName = req.body.bookName
    var price = req.body.price
    var author = req.body.author

    // var bookData = {
    //     id :id,
    //     name:name,
    //     price:price,
    //     author:author
    // }
    
    var sql =`INSERT INTO books(id,bookName,price,author) VALUES(${id},'${bookName}','${price}','${author}');`
    conn.query(sql, (err, results)=>{
        if(err) throw err
        res.send(results)
    })


})
 
// update book detatils
app.put('/api/updateBookInfo',(req,res) =>{
    var id = req.query.id
    var newBookName = req.query.newBookName
    var sql =`UPDATE books SET bookName = '${newBookName}' WHERE id = ${id};`
    conn.query(sql,(err, results) =>{
        if(err) throw err
        res.send(results)
    })

})

 
// Delete Book

app.delete('/api/deleteBook',(req, res) =>{
    var id  = req.query.id
    var sql = `DELETE FROM books WHERE id = ${id};`
    conn.query(sql,(err, results) =>{
        if(err) throw err;
        res.send(results)
    })
})

 
//Server listening to port
app.listen(3000,() =>{
  console.log('Server started on port 3000...');
});