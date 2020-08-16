const readline = require('readline');
const fs = require('fs');

_readInterface = (filePath) => {
  if (filePath === null || filePath === '') return null;
  return readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    console: false,
  });
};

_addToArr = (line, arr) => {
  arr.push(line);
};

class Ppm {
  constructor (filePath, width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.maxColValue = 255;
    this._nrLines = this.height;
    this._nrColumns = this.width;
    this.size = this.width * this.height;
    this.filePath = filePath || null;
    this.r = new Array(this.size).fill(0);
    this.g = new Array(this.size).fill(0);
    this.b = new Array(this.size).fill(0);
    this._arr = [];
    this._readInterface = () => _readInterface.bind(this);
    this._addToArr = () => _addToArr.bind(this);
    this.read();
  }

  read = () => {
    if (this.filePath === null || this.filePath === '') return;
    this._readInterface()(this.filePath)
    .on('line', (line) => {
      this._addToArr()(line, this._arr);
    });
    this._readInterface()(this.filePath)
    .on('close', () => {
      if (this._arr[0] === 'P6') {
        console.log('Error. Unrecognized file format.');
        return;
      }

      let positionTracker = 1;
      let nextPosition = this._arr[positionTracker];
      while (nextPosition[0] === '#') {
        nextPosition = this._arr[++positionTracker];
      }
      [this.width, this.height] = nextPosition.split[' '];
      this._nrLines = this.height;
      this._nrColumns = this.width;
      try {
        this.maxColValue = nextPosition[positionTracker];
      } catch (err) {
        console.log('Header file format error. ', err.message);
        return;
      }

      this.size = this.height * this.width;

      this.r = new Array(this.size).fill(0);
      this.g = new Array(this.size).fill(0);
      this.b = new Array(this.size).fill(0);

      const tempFileName = 'dump.tmp';
      const offSet = false;

      this.write(tempFileName, offSet);

      const file = fs.createReadStream(tempFileName);
      file.read(1);

      let aux;
      for (let i = 0; i < this.size; ++i) {
        aux = file.read(1);
        this.r[i] = aux.charCodeAt(0);
        aux = file.read(1);
        this.g[i] = aux.charCodeAt(0);
        aux = file.read(1);
        this.b[i] = aux.charCodeAt(0);
      }
      console.log(this._arr);
      file.close();
      fs.unlinkSync(tempFileName);
    });
  };

  write = (fileName, offset = true) => {
    const file = fs.createWriteStream(fileName);
    if (offset) {
      file.write('P6\n');
      file.write(`${this.width} ${this.height}\n`);
      file.write(`${this.maxColValue}\n`);
    }

    let aux;
    for (let i = 0; i < this.size; ++i) {
      aux = String.fromCharCode(this.r[i]);
      file.write(aux);
      aux = String.fromCharCode(this.g[i]);
      file.write(aux);
      aux = String.fromCharCode(this.b[i]);
      file.write(aux);
    }

    file.on('error', () => {
      console.log('Error. Unable to open ');
      file.close();
    });
    file.close();
  };
}

module.exports.Ppm = Ppm;
