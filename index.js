const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var mysql = require('mysql');

var con = mysql.createConnection({
	  host: '127.0.0.1',
	  user: 'root',
	  password: '',
	  database: 'workshop1'
	})

con.connect(function(err) {
	if (err) throw err

});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// défini le port d'écoute
app.listen(8080, function () {
  console.log('Example app listening on port 80!')
})

// route permettant l'authentification
app.get('/user', function (req, res) {
	var json = '';
  con.query("SELECT idSalesPerson, mail, password FROM salesPerson", function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// toute permettant de récupérer tous les clients
app.get('/customers', function (req, res) {
	var json = '';
  con.query("SELECT * FROM customer", function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// route permettant d'obtenir toutes les demandes d'un commercial à partir de son id, le résultat est trié par date
app.get('/getProposals/:id/:tri', function (req, res) {
  var json = '';
  if(req.params.tri!="beginning" && req.params.tri!="proposalTitle" && req.params.tri!="company" && req.params.tri!="status"){
    res.send(json);
  }else
    con.query("SELECT c.company, d.directorMail, p.* FROM proposal p, customer c, operationsdirector d WHERE p.idSalesPerson= " + req.params.id + " AND c.siret=p.idCustomer AND d.idOperationsDirector=p.idDirOps ORDER BY " + req.params.tri + ((req.params.tri==="status" || req.params.tri==="beginning") ? " DESC" : " ASC"), function (err, result, fields) {
      if (err) throw err;
    json = JSON.stringify(result);
    res.send(json);
    });
})

// route permettant d'obtenir toutes les demandes d'un client à partir de son siret
app.get('/getCustomerProposal/:siret', function (req, res) {
	var json = '';
  con.query("SELECT * FROM proposal WHERE idCustomer="+ req.params.siret, function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// route permettant d’ajouter une demande
app.post('/addProposal', function (req, res) {
  var request = `INSERT INTO proposal (idSalesPerson, idDirOps, idCustomer, proposalDate, interlocutorLastName, interlocutorFirstName, interlocutorMail, interlocutorPhone, proposalTitle, description, keySuccess, beginning, location, status, price) VALUES (`;
  request = request + `'${req.body.idSalesPerson}', '${req.body.idDirOps}', '${req.body.idCustomer}', '${req.body.proposalDate}', '${req.body.interlocutorLastName}', '${req.body.interlocutorFirstName}'`;
  request = request + `, '${req.body.interlocutorMail}', '${req.body.interlocutorPhone}', '${req.body.proposalTitle}', '${req.body.description}', '${req.body.keySuccess}', '${req.body.beginning}', '${req.body.location}'`;
  request = request + `, '${req.body.status}', '${req.body.price}')`;
  con.query(request, function (err, result, fields) {
    if (err) throw err;
	res.send("true");
  });
})

// route permettant de modifier une demande une demande
app.post('/updateProposal', function (req, res) {
  var request = `UPDATE proposal SET idSalesPerson='${req.body.idSalesPerson}', idDirOps='${req.body.idDirOps}', idCustomer='${req.body.idCustomer}', proposalDate='${req.body.proposalDate}', interlocutorLastName='${req.body.interlocutorLastName}', interlocutorFirstName='${req.body.interlocutorFirstName}', interlocutorMail='${req.body.interlocutorMail}', interlocutorPhone='${req.body.interlocutorPhone}', proposalTitle='${req.body.proposalTitle}', description='${req.body.description}', keySuccess='${req.body.keySuccess}',`;
	request = request +` beginning='${req.body.beginning}', location='${req.body.location}', status='${req.body.status}', price='${req.body.price}' WHERE idProposal=${req.body.idProposal}`;
  con.query(request, function (err, result, fields) {
    if (err) throw err;
	res.send("true");
  });
})


// route permettant d'obtenir toutes les demandes d'un client à partir de son siret
app.get('/research/:word', function (req, res) {
	var json = '';
  con.query(`SELECT * FROM customer c, proposal p WHERE c.company like '%`+req.params.word+`%' OR p.proposalTitle like '%`+req.params.word+`%'`, function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// // test d'ajout dans une table
// app.post('/addTest', function (req, res) {
//   var json = req.body.test;
//   con.query(`INSERT INTO tester (az) VALUES ('${req.body.test}')`, function (err, result, fields) {
//     if (err) console.log(err);
//   json = JSON.stringify(result);
//   res.send(json);
//   });
// })