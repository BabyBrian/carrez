var http = require('http');
var express = require('express');
var app = express();
var mod1 = require('./module_lbc');
var mod2 = require('./module_meill');

function onRequest(request, response){
	console.log("A user made a request" + request.url);
	response.writeHead(200);
	response.write("Here is some data");
	app.locals.lbcdata = require('./lb.json');
	response.write(app.locals.lbcdata.prix)
	var price = app.locals.lbcdata.prix
	var surface = app.locals.lbcdata.surface
	response.write(app.locals.lbcdata.ville)
	response.write(app.locals.lbcdata.type)
	response.write(app.locals.lbcdata.surface)
	mod1.leboncoin();
	mod2.meilleursagents(price,surface);
	response.end();
}



http.createServer(onRequest).listen(8888);
console.log("Server is now running...");
