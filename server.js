/**
 * @author Paul Kalnitski
 * @contact kalnitski@polydev.io
 * @copyright 2019-2020 All rights reserved
 */
const Retranslator = require("./src/Retranslator");

// Create TCP (Socket) server on 20163 port
let retranslator = new Retranslator(20163);

retranslator.emitter.on('message', message => {
  // message is wialon retranslator data from TCP connection
  //
  // {
  //   data: [ {name: "%NAME%", value: "%VALUE%"}, ... ],
  //   controllerId: %CONTROLLERID%,
  //   time: "%TIME%"
  // }
});

// Start listening
retranslator.start();
