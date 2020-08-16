const { Ppm } = require('./lib/ppm');

const ppm = new Ppm();
ppm.write(`file-${new Date()}.txt`);
// ppm.read();
