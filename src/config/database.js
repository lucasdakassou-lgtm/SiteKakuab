const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// caminho do banco
const dbPath = path.resolve(__dirname, "../database/Database.sqlite.db");

// cria conexão
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.message);
  } else {
    console.log("Conectado ao SQLite com sucesso!");

    // Executa o schema.sql para garantir que as tabelas (users, anuncios, etc) existam
    const schemaPath = path.resolve(__dirname, "../database/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      db.exec(schema, (err) => {
        if (err) {
          console.error("Erro ao criar as tabelas:", err.message);
        } else {
          console.log("Tabelas do banco de dados verificadas/criadas com sucesso!");

          // FIX: Corrigir IDs nulos na tabela anuncios
          db.run("UPDATE anuncios SET id_anuncio = rowid WHERE id_anuncio IS NULL;", (errFix) => {
            if (errFix) console.error("Erro ao corrigir id_anuncio nulos:", errFix);
            else console.log("Verificação de id_anuncio concluída.");
          });

          // Garante que as categorias existam!
          db.get("SELECT COUNT(*) as count FROM categorias", [], (err, row) => {
            if (!err && row && row.count === 0) {
              console.log("Banco de categorias vazio! Populando categorias...");
              db.run("INSERT INTO categorias (nome) VALUES ('chips'), ('castanhas'), ('outros')", (e) => {
                if (e) console.log("Erro ao popular categorias:", e);
                else console.log("Categorias populadas com sucesso!");
              });
            }
          });
        }
      });
    }
  }
});

module.exports = db;
