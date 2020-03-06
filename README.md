# Wialon-Retranslator
Wialon Retranslator (v. 1.0): TCP server &amp; binary protocol parser

### Available functions
```javascript
// Create TCP (Socket) server on 20163 port
let retranslator = new Retranslator(20163);
```
```javascript
// Catch wailon message data from TCP connection
retranslator.emitter.on('message', message => {
  // Handle message object
});
```
```javascript
// Start listening
retranslator.start();
```
### Message object
```json
{ 
  "data" : [
    {
     "name": "posinfo", 
      "value" : {
        "lon": 45.9689566666667, 
        "lat": 51.5845266666667, 
        "height": 0, 
        "speed": 11, 
        "course": 141, 
        "satelites": 16 
      }
    }, 
    { 
      "name": "avl_inputs", 
      "value": 0 
    }, 
    { 
      "name": "egts_mt_id", 
      "value": 184139
    }, 
    { 
      "name": "pwr_ext", 
      "value": 25.331 
    }, 
    {
      "name": "pwr_int", 
      "value": 4.211 
    }, 
    { 
      "name": "gsm1", 
      "value": 100 
    }
  ], 
  "controllerId": 867157045976750, 
  "time": "Thu Mar 05 2020 13:23:29 GMT+0000 (Coordinated Universal Time)" 
}
```
