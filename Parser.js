module.exports = class Parser {
  constructor(simpleData) {
    this.simpleData = simpleData;
  }

  buffer(buffer) {
    if (buffer.length < 4) {
      return { data: buffer };
    }

    let offset = 0;
    // The size of the entire package, excluding the current field . Size 4 bytes.
    let packetSize = buffer.readUInt32LE(offset);
    offset += 4;

    if ((buffer.length - offset) < packetSize) {
      return { data: buffer };
    }

    // Message
    let messageBuffer = buffer.slice(offset, offset + packetSize);
    // A substructure that contains data blocks.
    let data = buffer.slice(offset + packetSize);

    // Decoded message
    let message = this.message(messageBuffer);

    return {
      message: message,
      data: data
    }
  }

  message(buffer) {
    let message = {};
    let offset = 0;

    // Information about the identity of the driver.
    let controllerIdEnd = buffer.indexOf(0x00, offset);
    let controllerIdBuf = buffer.slice(offset, controllerIdEnd);
    // UID
    let controllerId = controllerIdBuf.toString();
    offset = controllerIdEnd + 1;
    // Time
    let timestamp = buffer.readUInt32BE(offset);
    let time = this.timestamp(timestamp);
    offset += 4;

    let data = buffer.readUInt32BE(offset);
    offset += 4;

    if (!this.simpleData) {
      // Location information.
      message.posInfo = Boolean(data & 0x01);
      // Information about digital inputs.
      message.digInputInfo = Boolean(data & 0x02);
      // Information about digital outputs.
      message.digOutInfo = Boolean(data & 0x04);
      // Alarm bit
      message.alarm = Boolean(data & 0x10);
      // Driver ID
      message.driversIdInfo = Boolean(data & 0x20);
      // Data
      message.data = this.messageData(buffer.slice(offset));
      // Time
      message.time = time;
      // UID
      message.controllerId = controllerId;
    } else {
      message = {
        data: this.messageData(buffer.slice(offset)),
        controllerId: controllerId,
        time: time
      }
    }

    return message;
  }

  messageData(buffer) {
    let offset = 0;
    let data = [];

    while (true) {
      let result = this.dataBlock(buffer);

      if (!result) {
        return data;
      }

      data.push(result.block);
      buffer = result.data;
    }
  }

  dataBlock(buffer) {
    if (buffer.length === 0) {
      return false;
    }

    if (buffer.length < 8) {
      throw new Error('Data block too small');
    }

    let offset = 0;

    let blockType = buffer.readUInt16LE(offset);
    offset += 2;

    let blockSize = buffer.readUInt32BE(offset);
    offset += 4;

    let visibility = buffer.readUInt8(offset);
    offset += 1;

    let blockDataType = buffer.readUInt8(offset);
    offset += 1;

    let blockNameEnd = buffer.indexOf(0x00, offset);
    let blockNameBuf = buffer.slice(offset, blockNameEnd);
    let blockName = blockNameBuf.toString();
    offset = blockNameEnd + 1;

    let blockValueSize = (blockSize + 6) - offset;
    let blockValueBuf = buffer.slice(offset, offset + blockValueSize);
    offset += blockValueSize;

    let blockValue;
    if (blockName === 'posinfo') {
      blockValue = this.posInfo(blockValueBuf);
    } else {
      switch (blockDataType) {
        case 0x01: // text
          blockValue = parseText(blockValueBuf);
          break;

        case 0x02: // binary
          blockValue = blockValueBuf;
          break;

        case 0x03: // Int32
          blockValue = blockValueBuf.readInt32LE(0);
          break;

        case 0x04: // Double
          blockValue = blockValueBuf.readDoubleLE(0);
          break;

        case 0x05: // Int64
          blockValue = blockValueBuf.readIntLE(0, 8);
          break;

        default:
          throw new Error('Unknown block type code: ' + blockType);
      }
    }

    return {
      block: {
        name: blockName,
        value: blockValue,
      },
      data: buffer.slice(offset),
    };
  }

  timestamp(timestamp) {
    // Seconds to miliseconds
    return new Date(timestamp * 1000);
  }

  text(buffer) {
    if (buffer[buffer.length - 1] !== 0x00) {
      throw new Error('Text must end with 0x00');
    }

    let textBuffer = buffer.slice(0, buffer.length - 1);

    return textBuffer.toString();
  }

  posInfo(buffer) {
    if (buffer.length !== 29) {
      throw new Error('Wrong posinfo block length (' + buffer.length + ')');
    }

    let offset = 0;
    let posInfo = {};

    // Double, 8 bytes
    posInfo.lon = buffer.readDoubleLE(offset);
    offset += 8;
    // Double, 8 bytes
    posInfo.lat = buffer.readDoubleLE(offset);
    offset += 8;
    // Double, 8 bytes
    posInfo.height = buffer.readDoubleLE(offset);
    offset += 8;
    // Short, 2 bytes
    posInfo.speed = buffer.readInt16BE(offset);
    offset += 2;
    // Short, 2 bytes
    posInfo.course = buffer.readInt16BE(offset);
    offset += 2;
    // Byte, 1 byte
    posInfo.satelites = buffer.readUInt8(offset);
    offset += 1;

    return posInfo;
  }
}
