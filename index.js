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

app.use('/', express.static('public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.all ("/*", (req, res, next)=>{
console.log(req.body)
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next()
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
app.get('/customers/:tri?', function (req, res) {
	var json = '';
  con.query(`SELECT * FROM customer WHERE contact LIKE '%${req.query.q}%' ORDER BY ${req.params.tri}`, function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// route permettant d'obtenir toutes les demandes d'un client à partir de son siret
app.get('/getCustomerProposal/:siret', function (req, res) {
	var json = '';
  con.query(`SELECT * FROM proposal WHERE idCustomer=${req.params.siret} `, function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// route permettant d’ajouter une demande
app.post('/addProposal', function (req, res) {
  var request = `INSERT INTO proposal (idSalesPerson, idDirOps, idCustomer, proposalDate, interlocutorLastName, interlocutorFirstName, interlocutorMail, interlocutorPhone, proposalTitle, description, keySuccess, beginning, ending, location, status, price) VALUES (`;
  request = request + `'${req.body.idSalesPerson}', '${req.body.idDirOps}', '${req.body.idCustomer}', '${req.body.proposalDate}', '${req.body.interlocutorLastName}', '${req.body.interlocutorFirstName}'`;
  request = request + `, '${req.body.interlocutorMail}', '${req.body.interlocutorPhone}', '${req.body.proposalTitle}', '${req.body.description}', '${req.body.keySuccess}', '${req.body.beginning}', '${req.body.ending}'`;
  request = request + `, '${req.body.location}', '${req.body.status}', '${req.body.price}')`;
	console.log(request);
  con.query(request, function (err, result, fields) {
    if (err) throw err;
	res.send("true");
  });
})

// route permettant de modifier une demande une demande
app.post('/updateProposal', function (req, res) {
  var request = `UPDATE proposal SET idSalesPerson='${req.body.idSalesPerson}', idDirOps='${req.body.idDirOps}', idCustomer='${req.body.idCustomer}', proposalDate='${req.body.proposalDate}', interlocutorLastName='${req.body.interlocutorLastName}', interlocutorFirstName='${req.body.interlocutorFirstName}', interlocutorMail='${req.body.interlocutorMail}', interlocutorPhone='${req.body.interlocutorPhone}', proposalTitle='${req.body.proposalTitle}', description='${req.body.description}', keySuccess='${req.body.keySuccess}',`;
	request = request +` beginning='${req.body.beginning}', ending='${req.body.ending}', location='${req.body.location}', status='${req.body.status}', price='${req.body.price}' WHERE idProposal=${req.body.idProposal}`;
  con.query(request, function (err, result, fields) {
    if (err) throw err;
	res.send("true");
  });
})

// route permettant d'obtenir toutes les demandes d'un commercial à partir de son id, le résultat est trié
app.get('/getProposals/:id/:tri', function (req, res) {
  var json = '';
  if(req.params.tri!="beginning" && req.params.tri!="proposalTitle" && req.params.tri!="company" && req.params.tri!="status"){
    res.send(json);
  }else
    con.query("SELECT c.company, d.directorMail, p.* FROM proposal p, customer c, operationsdirector d WHERE p.idSalesPerson= "
		+ req.params.id + " AND c.siret=p.idCustomer AND d.idOperationsDirector=p.idDirOps ORDER BY "
		+ req.params.tri + ((req.params.tri==="status" || req.params.tri==="beginning") ? " DESC" : " ASC"), function (err, result, fields) {
      if (err) throw err;
    json = JSON.stringify(result);
    res.send(json);
    });
})

// route permettant de rechercher les lignes en fonction de la company du cstomer et du titre du proposal
app.get('/research/:word', function (req, res) {
	var json = '';
  con.query(`SELECT c.company, d.directorMail, p.* FROM customer c, proposal p, operationsdirector d WHERE c.siret=p.idCustomer AND d.idOperationsDirector=p.idDirOps AND c.company like '%`+req.params.word+`%' OR p.proposalTitle like '%`+req.params.word+`%'`, function (err, result, fields) {
    if (err) throw err;
	json = JSON.stringify(result);
	res.send(json);
  });
})

// route permettant d'obtenir toutes les demandes d'un commercial à partir de son id, le résultat est trié et filtrable ar company
app.get('/getProposal/:id/:tri?', function (req, res) {
  var json = '';
  if(req.params.tri!="beginning" && req.params.tri!="proposalTitle" && req.params.tri!="company" && req.params.tri!="status"){
    res.send(json);
  }else {
		var request = `SELECT c.company, d.directorMail, p.* FROM proposal p, customer c, operationsdirector d WHERE p.idSalesPerson= ${req.params.id} AND c.siret=p.idCustomer AND d.idOperationsDirector=p.idDirOps AND p.proposalTitle like '%${req.query.q}%' GROUP BY idProposal ORDER BY ${req.params.tri}` + ((req.params.tri==="status" || req.params.tri==="beginning") ? " DESC" : " ASC");
    con.query(request, function (err, result, fields) {
      if (err) throw err;
    json = JSON.stringify(result);
    res.send(json);
    });
	}
})

// défini le port d'écoute
app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})
