const http = require('http');
const fs = require('fs');
const path = require('path');

const gifsDir = path.join(__dirname, 'gifs');

// Função para embaralhar um array (Fisher-Yates)
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const server = http.createServer((req, res) => {
	if (req.url === '/') {
		// Página principal: listar e embaralhar os GIFs
		fs.readdir(gifsDir, (err, files) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				return res.end('Erro interno do servidor');
			}

			const gifFiles = files.filter((file) => file.toLowerCase().endsWith('.gif'));
			shuffleArray(gifFiles);

			const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Mosaico de GIFs</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  background: #f0f0f0;
              }
              img {
                  margin: 5px;
                  max-width: 200px;
                  max-height: 200px;
                  object-fit: cover;
              }

              @media (max-width: 600px) {
                body { 
                  gap: 36px;
                }

                img {
                  width: 100vw;
                  max-width: none;
                  max-height: none;
                }
          </style>
      </head>
      <body>
          ${gifFiles.map((gif) => `<img src="/gifs/${encodeURIComponent(gif)}" alt="${gif}" />`).join('')}
      </body>
      </html>
      `;

			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(html);
		});
	} else if (req.url.startsWith('/gifs/')) {
		// Servir arquivos GIF estáticos
		const requestedFile = decodeURIComponent(path.basename(req.url));
		const gifPath = path.join(gifsDir, requestedFile);

		fs.stat(gifPath, (err, stats) => {
			if (err || !stats.isFile()) {
				res.writeHead(404, { 'Content-Type': 'text/plain' });
				return res.end('Arquivo não encontrado');
			}

			fs.readFile(gifPath, (readErr, data) => {
				if (readErr) {
					res.writeHead(500, { 'Content-Type': 'text/plain' });
					return res.end('Erro interno do servidor');
				}

				res.writeHead(200, { 'Content-Type': 'image/gif' });
				res.end(data);
			});
		});
	} else {
		// Qualquer outra rota retorna 404
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Página não encontrada');
	}
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
