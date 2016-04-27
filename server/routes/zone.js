var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');

var connString = require(path.join(__dirname, '../', '../', 'config'));

var GeoJSON = require('geojson');

router.get('/', function(req,res){
 var results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query("SELECT id, name, ST_asGeoJSON(geom) as geo FROM test.zone");
        // Stream results back one row at a time
        query.on('row', function(row) {
        	var feature = JSON.parse(row.geo);
        	var data = {
        		'id': row.id,
        		'name' : row.name,
        		'coordinates' : JSON.parse(row.geo).coordinates
        	};
        	results.push(data);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {'Polygon' : 'coordinates'}));
        });
    });
});

router.get('/:id', function(req,res){
    var results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
         var query = client.query("SELECT id, name, ST_asGeoJSON(geom) as geo FROM test.zone WHERE id=$1",[req.params.id]);
        // Stream results back one row at a time
        query.on('row', function(row) {
            var feature = JSON.parse(row.geo);
            var data = {
                'id': row.id,
                'name' : row.name,
                'coordinates' : JSON.parse(row.geo).coordinates
            };
            results.push(data);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(GeoJSON.parse(results, {'Polygon' : 'coordinates'}));
        });
    });
});

module.exports = router;