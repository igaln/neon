// Socket.io
//var app          = express();

var io = null;


	// Each entity table is represented by a label on nodes
	// Each row in a entity table is a node
	// Columns on those tables become node properties.
	// Remove technical primary keys, keep business primary keys
	// Add unique constraints for business primary keys, add indexes for frequent lookup attributes
	// Replace foreign keys with relationships to the other table, remove them afterwards
	// Remove data with default values, no need to store those
	// Data in tables that is denormalized and duplicated might have to be pulled out into separate nodes to get a cleaner model.
	// Indexed column names, might indicate an array property (like email1, email2, email3)
	// Join tables are transformed into relationships, columns on those tables become relationship properties

exports.init = function(_io) {
    io = _io;

    io.on('connection', function(socket) {
        socket.emit('news', {
            hello: 'world'
        });
        socket.on('my other event', function(data) {
            console.log(data);
        });
    });

}