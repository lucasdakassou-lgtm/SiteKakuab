const db = require("../config/database");
const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(__dirname, "schema.sql");

const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema, (err) => {
  if (err) {
    console.error("Erro ao criar tabelas:", err.message);
  } else {
    console.log("Banco inicializado com sucesso!");
  }
});