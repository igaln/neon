var graph;

function myGraph(el) {

    // Add and remove elements on the graph object
    this.addNode = function(id) {
        nodes.push({
            "id": id
        });
        update();
    };

    this.removeNode = function(id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
                links.splice(i, 1);
            } else i++;
        }
        nodes.splice(findNodeIndex(id), 1);
        update();
    };

    this.removeLink = function(source, target) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                links.splice(i, 1);
                break;
            }
        }
        update();
    };

    this.removeallLinks = function() {
        links.splice(0, links.length);
        update();
    };

    this.removeAllNodes = function() {
        nodes.splice(0, links.length);
        update();
    };

    this.addLink = function(source, target, value) {
        links.push({
            "source": findNode(source),
            "target": findNode(target),
            "value": value
        });
        update();
    };

    var findNode = function(id) {
        for (var i in nodes) {
            if (nodes[i]["id"] === id) return nodes[i];
        };
    };

    var findNodeIndex = function(id) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id == id) {
                return i;
            }
        };
    };

    function dblclick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
    }

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    }

   


    var color = d3.interpolateLab("#008000", "#c83a22");
    var margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10
    };
    // set up the D3 visualisation in the specified element
    var w = 800,
        h = 500;
    var vis = d3.select('body')
        .append('svg')
        .attr('preserveAspectRatio','none')
        // .attr('width', w)
        // .attr('height', h);

    // Per-type markers, as they don't inherit styles.
    vis.append("defs").selectAll("marker")
        .data(["suit", "licensing", "resolved"])
        .enter().append("marker")
        .attr("id", function(d) {
            return d;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");


         // filter chain comes from:
    // https://github.com/wbzyl/d3-notes/blob/master/hello-drop-shadow.html
    // cpbotha added explanatory comments
    // read more about SVG filter effects here: http://www.w3.org/TR/SVG/filters.html

    // filters go in defs element
    var defs = vis.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "120%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 3)
        .attr("dy", 3)
        .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    // end filter



    var force = d3.layout.force();

    var nodes = force.nodes(),
        links = force.links();

    var drag = force.drag()
        .on("dragstart", dragstart);

    var update = function() {
        var link = vis.selectAll("path.link")
            .data(force.links(), function(d) {
                return d.source.id + "-" + d.target.id;
            }).attr("marker-end", function(d) {
                return "url(#)";
            });;

        link.enter().append("path")
            .attr("id", function(d) {
                return d.source.id + "-" + d.target.id;
            });

        link.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });
        //link.attr("class", "link");
        link.style("stroke", function(d) {
            console.log(d.value);
            return color(d.value);
        });

        link.append("title")
            .text(function(d) {
                return d.value;
            });
        link.exit().remove();

        var node = vis.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id;
            }).on("dblclick", dblclick)
            .call(drag);

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("svg:circle")
            .attr("r", 30)
            .attr("id", function(d) {
                return "Node;" + d.id;
            })
            .attr("class", "node")
            .style("filter", "url(#drop-shadow)");

        nodeEnter.append("text")
            .text(function(d) {
                return d.id;
            })
            .attr("transform", "translate(" + 20 + ",0)");

        node.exit().remove();

        force.on("tick", function() {

            link.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = 0.0 //Math.sqrt(dx * dx + dy * dy);
                return "M" +
                    d.source.x + "," +
                    d.source.y + "A" +
                    dr + "," + dr + " 0 0,1 " +
                    d.target.x + "," +
                    d.target.y;
            });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        // Restart the force layout.
        force
        // .nodes(d3.values(nodes))
        // .links(links)
        .linkDistance(120)
            .charge(-1200)
            .size([w, h])
            .start();
    };


    // Make it all go
    update();
}


var socket = io.connect('http://localhost:3000');
socket.on('news', function(data) {
    console.log(data);
    socket.emit('my other event', {
        my: 'data'
    });
});

function drawGraph() {

    graph = new myGraph("#svgdiv");
    graph.addNode('Brain');
    graph.addNode('Heart');
    graph.addLink('Heart', 'Brain', 1);
    // graph.addNode('INCUBATION');
    // graph.addNode('NARRATION');
    // graph.addNode('VISUALISATION');
    // graph.addNode('PRESENTATION');
    // graph.addNode('PROTOTYPE');

    // graph.addNode('IDEATION');
    // graph.addNode('HACKATHON');
    // graph.addNode('HACK TOOLKIT');

    // graph.addNode('IP LIBRARY');
    // graph.addNode('USER TESTING');

    // graph.addNode('CODE REPOSITORY');

    // graph.addNode('PRODUCTION');
    // graph.addNode('VENDORS');
    // graph.addNode('VENDOR A');
    // graph.addNode('VENDOR B');
    // graph.addNode('VENDOR C');
    // graph.addNode('VENDOR D');

    // graph.addNode('COMMUNITY');
    // graph.addNode('CREATIVE CODERS');
    // graph.addNode('DESIGNERS');
    // graph.addNode('DIGITAL ARTISTS');


    // // graph.addPath('A', 'B', '10');
    // graph.addLink('ZOO', 'IDEATION', '10');
    // graph.addLink('ZOO', 'PRODUCTION', '10');
    // graph.addLink('ZOO', 'HACKATHON', '10');

    // graph.addLink('COMMUNITY', 'CREATIVE CODERS', '10');
    // graph.addLink('COMMUNITY', 'DESIGNERS', '10');
    // graph.addLink('COMMUNITY', 'DIGITAL ARTISTS', '10');


    // graph.addLink('HACKATHON', 'HACK TOOLKIT', '10');
    // graph.addLink('PROTOTYPE', 'HACK TOOLKIT', '10');
    // // graph.addLink('IP LIBRARY', 'HACK TOOLKIT', '15');
    // graph.addLink('COMMUNITY', 'HACKATHON', '10');

    // graph.addLink('PRODUCTION', 'VENDORS', '10');
    // graph.addLink('VENDORS', 'VENDOR A', '10');
    // graph.addLink('VENDORS', 'VENDOR B', '10');
    // graph.addLink('VENDORS', 'VENDOR C', '10');
    // graph.addLink('VENDORS', 'VENDOR D', '10');
    // graph.addLink('VENDORS', 'COMMUNITY', '10');


    // graph.addLink('PROTOTYPE', 'IDEATION', '10');
    // graph.addLink('PROTOTYPE', 'ZOO', '10');
    // graph.addLink('PROTOTYPE', 'INCUBATION', '10');

    // graph.addLink('IDEATION', 'IP LIBRARY', '10');
    // graph.addLink('IDEATION', 'INCUBATION', '10');
    // graph.addLink("IP LIBRARY", "CODE REPOSITORY", '10');
    // graph.addLink("HACK TOOLKIT", "CODE REPOSITORY", '10');
    // graph.addLink("PROTOTYPE", "CODE REPOSITORY", '10');

    // graph.addLink('IP LIBRARY', 'INCUBATION', '10');
    // graph.addLink('ZOO', 'INCUBATION', '10');
    // graph.addLink('INCUBATION', 'NARRATION', '10');
    // graph.addLink('NARRATION', 'VISUALISATION', '10');
    // graph.addLink('VISUALISATION', 'PRESENTATION', '10');
    // graph.addLink('PRODUCTION', 'PRESENTATION', '10');

    // graph.addLink('INCUBATION', 'USER TESTING', '10');
    // graph.addLink('USER TESTING', 'PRODUCTION', '10');
    // graph.addLink('A', 'C', '8');
    // graph.addLink('B', 'C', '15');
}