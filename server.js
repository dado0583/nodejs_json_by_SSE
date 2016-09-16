var express = require('express');
var app = express();

var template = ' \
<!DOCTYPE html> <html> <body> \
	<script type="text/javascript"> \
		    var source = new EventSource("/events/"); \
		    source.onmessage = function(e) { \
		        document.body.innerHTML = "<PRE>"+ e.data + "</PRE><br>"; \
		    }; \
</script> </body> </html>';

app.get('/', function(req, res) {
	res.send(template);  // <- Return the static template above
});

var clientId = 0;
var clients = {};  // <- Keep a map of attached clients

// Called once for each new client. Note, this response is left open!
app.get('/events/', function(req, res) {
	req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
    	'Content-Type': 'text/event-stream',  // <- Important headers
    	'Cache-Control': 'no-cache',
    	'Connection': 'keep-alive'
    });
    res.write('\n');
    (function(clientId) {
        clients[clientId] = res;  // <- Add this client to those we consider "attached"
        req.on("close", function(){delete clients[clientId]});  // <- Remove this client when he disconnects
    })(++clientId)
});

setInterval(function(){
	var msg = Math.random();

	  var otherObject = { ticker: "USGG2YR:IND", maturity: "2016-09-16" };
	  var json = JSON.stringify({ 
	    instrument: otherObject, 
	    price: ""+ (0.7258 + msg/100)
	  });

	console.log("Clients: " + Object.keys(clients) + " <- " + msg);
	for (clientId in clients) {
		clients[clientId].write("data: "+ json + "\n\n"); // <- Push a message to a single attached client
	};
}, 10);

app.listen(process.env.PORT || 8080);
