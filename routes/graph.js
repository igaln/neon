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

/* GET home page. */
router.get('/:id', function(req, res, next) {

    console.log("id " + req.params.id);
    var predicate = {
        id: req.params.id
    };

    db.read(predicate, function(err, graph) {
        if (err) throw err;


        /**
         * Just a simple example to show how to use the sigma.layout.forceAtlas2
         * plugin:
         *
         * A random graph is generated, such that its nodes are separated in some
         * distinct clusters. Each cluster has its own color, and the density of
         * links is stronger inside the clusters. So, we expect the algorithm to
         * regroup the nodes of each cluster.
         */
        var i,
            s,
            o,
            N = 50,
            E = 100,
            C = 5,
            d = 0.5,
            cs = [],
            g = {
                nodes: [],
                edges: []
            };

        // Generate the graph:
        for (i = 0; i < C; i++)
            cs.push({
                id: i,
                nodes: [],
                color: '#' + (
                    Math.floor(Math.random() * 16777215).toString(16) + '000000'
                ).substr(0, 6)
            });

        for (i = 0; i < N; i++) {
            o = cs[(Math.random() * C) | 0];
            g.nodes.push({
                id: 'n' + i,
                label: 'Node' + i,
                x: 100 * Math.cos(2 * i * Math.PI / N),
                y: 100 * Math.sin(2 * i * Math.PI / N),
                size: Math.random(),
                color: o.color
            });
            o.nodes.push('n' + i);
        }

        for (i = 0; i < E; i++) {
            if (Math.random() < 1 - d)
                g.edges.push({
                    id: 'e' + i,
                    source: 'n' + ((Math.random() * N) | 0),
                    target: 'n' + ((Math.random() * N) | 0)
                });
            else {
                o = cs[(Math.random() * C) | 0]
                g.edges.push({
                    id: 'e' + i,
                    source: o.nodes[(Math.random() * o.nodes.length) | 0],
                    target: o.nodes[(Math.random() * o.nodes.length) | 0]
                });
            }
        }

        res.render('sigma', {
            title: graph.name,
            result: graph,
            graph: g
        });
    });

});


router.post('/', function(req, res, next) {


    db.save({
        name: req.body.name
    }, function(err, node) {
        if (err) throw err;
        db.label(node, ['NEON'], function(err) {
            if (err) throw err;
            res.redirect('/graph');
        });
    });


});

router.post('/delete', function(req, res, next) {

    console.log(req.body.deletevalue);

    db.delete({
        id: req.body.deletevalue
    }, function(err) {
        if (!err) console.log('item has been deleted!');
        res.redirect('/graph');
    })


});


module.exports = router;