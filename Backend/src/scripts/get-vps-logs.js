const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /etc/nginx/sites-available/default', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:\n' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR:\n' + data);
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: 'backend.goran.in',
  port: 22,
  username: 'root',
  password: 'Hostinger@9992'
});
