const http = require('http');
const fs = require('fs');
const path = require('path');

const gifsDir = path.join(__dirname, 'gifs');
const videosDir = path.join(__dirname, 'videos');

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
                  background: #212121;
                  gap: 32px;
              }
              img {
                  margin: 5px;
                  object-fit: cover;
                  border-radius: 15px;
                  cursor: pointer;
              }

              @media (max-width: 600px) {
                body { 
                  gap: 36px;
                }

                img {
                  width: 100vw;
                  max-width: none;
                  max-height: none;
                  border-radius: 0;
                }
              }
          </style>
      </head>
      <body>
          ${gifFiles
						.map((gif) => {
							const baseName = gif.replace('.gif', '');
							return `
                <a href="/videos/${encodeURIComponent(baseName)}.mp4">
                  <img src="/gifs/${encodeURIComponent(gif)}" alt="${gif}" />
                </a>
              `;
						})
						.join('')}
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
	} else if (req.url.startsWith('/videos/')) {
		// Servir arquivos de vídeo com suporte a Range
		const requestedFile = decodeURIComponent(path.basename(req.url));
		const videoPath = path.join(videosDir, requestedFile);

		fs.stat(videoPath, (err, stats) => {
			if (err || !stats.isFile()) {
				res.writeHead(404, { 'Content-Type': 'text/plain' });
				return res.end('Arquivo de vídeo não encontrado');
			}

			const range = req.headers.range;
			const fileSize = stats.size;

			if (!range) {
				// Sem cabeçalho range, envia o arquivo inteiro (não é ideal para streaming)
				res.writeHead(200, {
					'Content-Type': 'video/mp4',
					'Content-Length': fileSize,
				});
				fs.createReadStream(videoPath).pipe(res);
			} else {
				// Com range, enviar apenas o pedaço solicitado
				const parts = range.replace(/bytes=/, '').split('-');
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
				const chunkSize = end - start + 1;

				const file = fs.createReadStream(videoPath, { start, end });
				res.writeHead(206, {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunkSize,
					'Content-Type': 'video/mp4',
				});
				file.pipe(res);
			}
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
