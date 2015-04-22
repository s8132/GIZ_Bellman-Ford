/* Init view */
$('#dotError').hide();
$('#startBtn').hide();
$('#error').hide();
$('#success').hide();
$('#resetButtons').hide();

$("#restartWithDataBtnAuto").click(function(event){
    event.preventDefault();
    restartWithValue($('#source').val());
});

/* Draw graph */
$('#drawDot').click(function(event){
    event.preventDefault();

    graphVisual.draw($('#source').val(), "graphView", function(network){
        initNetwork(network);
        $('#dotError').hide();
        $('#tabs').find('a[href="#auto"]').tab('show');
    }, function(err){
        printErrorDotParse(err);
    });
});

function initNetwork(network) {
    var selectedNode = null;
    network.on('select', function (properties) {
        if (properties.nodes.length > 0) {
            selectedNode = properties.nodes[0];
            $('.selectedNode').html('').text(properties.nodes[0]);
            $('#startBtn').show();
        } else {
            selectedNode = null;
            $('.selectedNode').html('<i>wybierz wierzchołek startowy</i>');
            $('#startBtn').hide();
        }
    });

    $('#startBtn').click(function (event) {
        event.preventDefault();
        var nodes = objectToArray(network.nodesData._data),
            edges = objectToArray(network.edgesData._data),
            result = algorithm(nodes, edges, (isNaN(selectedNode)) ? selectedNode : parseInt(selectedNode));

        printResult(nodes, edges, result);

        $(this).hide();
    });

}

function algorithm(nodes, edges, startNodeId) {
    var distance = {},
        predecessor = {},
        result = {
            distance: {},
            predecessor: {},
            error: null
        };

    /* Init */
    nodes.forEach(function (node) {
        distance[node.id] = Infinity;
        predecessor[node.id] = null;
    });
    distance[startNodeId] = 0;

    /* Main loop */
    for (var i = 0; i < nodes.length-1; i++) {
        edges.forEach(function(edge){
            if(distance[edge.to] > distance[edge.from] + edge.label){
                distance[edge.to] = distance[edge.from] + edge.label;
                predecessor[edge.to] = edge.from;
            }
        });
    }

    result.distance = distance;
    result.predecessor = predecessor;

    /* Is negative cycle */
    edges.forEach(function(e){
        if(distance[e.to] > distance[e.from] + e.label){
            result.error = "Graf zawiera cykl ujemny";
        }
    });

    console.log(result);
    return result;
}

/* Funkcje pomocniczne */
function objectToArray(obj){
    var keys = Object.keys(obj),
        tab = [];
    keys.forEach(function(key){
        tab.push(obj[key]);
    });
    return tab;
}

function printResult(nodes, edges, result){
    if(result.error!==null){
        $('#error').show().find('strong').text(result.error);
    }else{
        $('#success').show();
        Object.keys(result.distance).sort().forEach(function(head){
            $('#success').find('> table > thead > tr').append('<th>' + head + '</th>');
            $('#success').find('> table > tbody > tr.distance').append('<td>' + result.distance[head] + '</td>');
            $('#success').find('> table > tbody > tr.predecessor').append('<td>' + result.predecessor[head] + '</td>');
            if(result.predecessor[head]!==null){
                var edge = _.findWhere(edges, {from: result.predecessor[head],to: (isNaN(head)) ? head : parseInt(head)});
                edge.color = "red";
            }
        });
        graphVisual.redraw(nodes, edges, "graphView");
    }

    $('#drawDot').hide();
    $('#resetButtons').show();
}

function printErrorDotParse(err){
    var match = /\(char (.*)\)/.exec(err);
    if (match) {
        var pos = Number(match[1]),
            txtData = $('#source').get(0);
        if(txtData.setSelectionRange) {
            txtData.focus();
            txtData.setSelectionRange(pos, pos);
        }
    }
    $('#dotError').show().text(err.toString());
}

var graphVisual = (function(){
    var network = null;
    return {
        destroy: function(){
            if(network!==null){
                network.destroy();
                network = null;
            }
        },
        draw: function(dotData, sourceElementId, successCallback, errorCallback){
            this.destroy();
            try{
                var data = {dot: dotData},
                    container = document.getElementById(sourceElementId),
                    options = {height: '400px', configurePhysics:true};
                network = new vis.Network(container, data, options);
                successCallback(network);
            }catch(err){
                errorCallback(err);
            }
        },
        redraw: function(nodes, edges, sourceElementId){
            this.destroy();
            var data = {
                    nodes: nodes,
                    edges: edges
                },
                container = document.getElementById(sourceElementId),
                options = {height: '400px', configurePhysics:true};

            network = new vis.Network(container, data, options);
        }
    }
})();