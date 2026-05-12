// Middleware global de tratamento de erros
// Ele captura erros que acontecem nas rotas, controllers ou middlewares

function errorMiddleware(err, req, res, next) {
  console.error("Erro capturado:", err.message);

  // Erro do Multer quando o arquivo é maior que o permitido
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "Arquivo muito grande. O limite é de 2MB."
    });
  }

  // Erro personalizado do uploadMiddleware
  if (err.message.includes("Formato de imagem inválido")) {
    return res.status(400).json({
      error: err.message
    });
  }

  // Erro padrão para qualquer outro problema
  return res.status(500).json({
    error: "Erro interno no servidor"
  });
}

module.exports = errorMiddleware;
