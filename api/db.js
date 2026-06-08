import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Insira sua senha do MySQL local, se houver
  database: 'bubatag',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
