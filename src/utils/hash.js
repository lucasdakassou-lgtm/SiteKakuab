const bcrypt = require("bcrypt");

async function gerarHash(senha) {
  return await bcrypt.hash(senha, 10);
}

async function compararSenha(senha, hash) {
  return await bcrypt.compare(senha, hash);
}

module.exports = {
  gerarHash,
  compararSenha
};