var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var connString = require(path.join(__dirname, '../', '../', 'config'));
var GeoJSON = require('geojson');

router.get('/:schema/:table', function(req, res) {
    var results = [];
    var schema = req.params.schema;
    var table = req.params.table;
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query("SELECT id, estado, ST_X(ST_TRANSFORM(geom,4326)) as x, ST_Y(ST_TRANSFORM(geom,4326)) as y FROM "+schema+"."+table);
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {Point: ['x', 'y']}));
        });
    });
});

router.post('/:schema/:table', function(req,res){
	var results = [];
    var schema = req.params.schema;
    var table = req.params.table;
    // Grab data from http request
    var data = {lng: req.body.lng, lat: req.body.lat, estado: req.body.estado};
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        var insertID = null;
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Insert Data
        var qInsert = client.query("INSERT INTO "+schema+"."+table+"(estado, geom) values("+data.estado+", ST_GeomFromText('POINT("+data.lng+" "+data.lat+")',4326)) RETURNING id");
        qInsert.on('row', function(row){
            insertID = row.id;
            // SQL Query > Select Data
            var qReturn = client.query("SELECT id, estado, ST_X(ST_TRANSFORM(geom,4326)) as x, ST_Y(ST_TRANSFORM(geom,4326)) as y FROM "+schema+"."+table+" WHERE id="+insertID);
            // Stream results back one row at a time
            qReturn.on('row', function(row) {
                results.push(row);
            });
            // After all data is returned, close connection and return results
            qReturn.on('end', function() {
                done();
                return res.json(GeoJSON.parse(results, {Point: ['x', 'y']}));
            }); 
        });
    });
});

router.get('/:schema/:table/:id', function(req,res){
	var results = [];
    var schema = req.params.schema;
    var table = req.params.table;
    var id = req.params.id;
	// Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query("SELECT id, estado, ST_X(ST_TRANSFORM(geom,4326)) as x, ST_Y(ST_TRANSFORM(geom,4326)) as y FROM "+schema+"."+table+" WHERE id=$1",[id]);
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {Point: ['x', 'y']}));
        });
    });
});

router.put("/:schema/:table/:id", function(req,res){
    var results = [];
    // Grab data from the URL parameters
    var schema = req.params.schema;
    var table = req.params.table;
    var id = req.params.id;
    // Grab data from http request
    var data = {lng: req.body.lng, lat: req.body.lat, estado: req.body.estado};
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).send(json({ success: false, data: err}));
        }
        // SQL Query > Update Data
        client.query("UPDATE "+schema+"."+table+" SET estado="+data.estado+", geom=ST_GeomFromText('POINT("+data.lng+" "+data.lat+")',4326) WHERE id="+id);
        // SQL Query > Select Data
        var query = client.query("SELECT id, estado, ST_X(ST_TRANSFORM(geom,4326)) as x, ST_Y(ST_TRANSFORM(geom,4326)) as y FROM "+schema+"."+table+" WHERE id="+id);
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {Point: ['x', 'y']}));
        });
    });
});

router.delete('/:schema/:table/:id', function(req, res) {
    var results = [];
    // Grab data from the URL parameters
    var schema = req.params.schema;
    var table = req.params.table;
    var id = req.params.id;
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Delete Data
        client.query("DELETE FROM "+schema+"."+table+" WHERE id=($1)", [id]);
        // SQL Query > Select Data
        var query = client.query("SELECT id, estado, ST_X(ST_TRANSFORM(geom,4326)) as x, ST_Y(ST_TRANSFORM(geom,4326)) as y FROM "+schema+"."+table+" ORDER BY id ASC");
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {Point: ['x', 'y']}));
        });
    });
});

module.exports = router;