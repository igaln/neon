var express = require('express');
var router = express.Router();
var db = require("seraph")("http://localhost:7474");

/* GET home page. */
router.get('/', function(req, res, next) {

	    db.nodesWithLabel('NEON', function(err, results) {

        res.render('index', {
            title: 'NEON',
            results: results
        });
    });

});


module.exports = router;
