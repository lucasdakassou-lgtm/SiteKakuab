const db = require("./src/config/database");

db.serialize(() => {
  db.all("PRAGMA table_info(avaliacoes);", (err, rows) => {
    if (err) console.error(err);
    else console.log("Avaliacoes:", rows);
    
    db.all("PRAGMA table_info(anuncio_imagens);", (err, rows2) => {
      console.log("Imagens:", rows2);
      process.exit(0);
    });
  });
});
