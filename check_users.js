const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'database', 'Database.sqlite.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id_usuario, nome, email, tipo_usuario FROM usuarios", [], (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
    db.close();
});
