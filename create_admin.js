const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

async function createAdmin() {
    const dbPath = path.join(__dirname, 'src', 'database', 'Database.sqlite.db');
    const db = new sqlite3.Database(dbPath);

    const email = 'admin@email.com';
    const senhaStr = 'admin123';
    const hash = await bcrypt.hash(senhaStr, 10);

    db.get("SELECT id_usuario FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (row) {
            console.log("Admin já existe.");
            db.close();
        } else {
            db.run("INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, ativo) VALUES (?, ?, ?, ?, 1)", 
                ['Administrador', email, hash, 'admin'], 
                function(err) {
                    if (err) console.error(err);
                    else console.log("Admin criado com sucesso!");
                    db.close();
            });
        }
    });
}

createAdmin();
