const net = require("net");
const events = require("events");
const Parser = require("./Parser");

module.exports = class Service {
  constructor(port, simpleData = true) {
    this.port = port;
    this.Parser = new Parser(simpleData);
    this.server = net.createServer(this.socket.bind(this));
    this.emitter = new events.EventEmitter();
  }

  // Start service listening
  async start() {
    await this.server.listen(this.port);

    console.log('Service start listening');
  }

  // Stop service listetning
  async end(callback) {
    await this.server.close();

    console.log('Service stoped listening');

    return callback ? callback()
                    : null;
  }

  // Concat buffer
  concatBuffer(bufferArray) {
    let totalLength = 0;

    bufferArray.forEach((b) => {
      totalLength += b.length;
    });

    return Buffer.concat(bufferArray, totalLength);
  }

  // Service data handler
  socket(socket) {
    let callback = function(buffer) {
      let body;
      let data = [];

      if (body) {
        body = this.concatBuffer([body, buffer]);
      } else {
        body = buffer;
      }

      while (true) {
        let result = this.Parser.buffer(body);
        body = result.data;

        if (!result.message) {
          break;
        } else {
          this.emitter.emit('message', result.message);
        }
      }

      // To each valid incoming packet, Wialon sends 0x11 as a response.
      socket.write(Buffer.from([0x11]));
    }

    socket.on("data", callback.bind(this));
  }
}
