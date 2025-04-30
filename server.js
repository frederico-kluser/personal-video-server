const http = require('http');
const fs = require('fs');
const path = require('path');

const gifsDir = path.join(__dirname, 'gifs');
const videosDir = path.join(__dirname, 'videos');

// Verifica se as pastas existem, caso contrário, cria-as
if (!fs.existsSync(gifsDir)) {
	console.log('Criando pasta de GIFs...');
	fs.mkdirSync(gifsDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
	console.log('Criando pasta de vídeos...');
	fs.mkdirSync(videosDir, { recursive: true });
}

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

			// Aqui mudamos 'src="/gifs/..."' para 'data-src="/gifs/..."'
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
                  <!-- Em vez de src, usamos data-src -->
                  <img data-src="/gifs/${encodeURIComponent(gif)}" alt="${gif}" />
                </a>
              `;
						})
						.join('')}

        <script>
          // -------------------[ Início do Script para IndexedDB ]-------------------
          // Função para abrir/criar o banco no IndexedDB
          function openDB() {
            return new Promise((resolve, reject) => {
              const request = indexedDB.open('gifsDB', 1);
              request.onupgradeneeded = event => {
                const db = event.target.result;
                // Cria o ObjectStore caso não exista
                if (!db.objectStoreNames.contains('gifs')) {
                  db.createObjectStore('gifs');
                }
              };
              request.onsuccess = event => {
                resolve(event.target.result);
              };
              request.onerror = event => {
                reject(event.target.error);
              };
            });
          }

          // Função para salvar Blob do GIF no banco
          function storeGif(db, gifName, gifBlob) {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(['gifs'], 'readwrite');
              const store = transaction.objectStore('gifs');
              const request = store.put(gifBlob, gifName);
              request.onsuccess = () => resolve();
              request.onerror = event => reject(event.target.error);
            });
          }

          // Função para buscar Blob de um GIF do banco
          function getGif(db, gifName) {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(['gifs'], 'readonly');
              const store = transaction.objectStore('gifs');
              const request = store.get(gifName);
              request.onsuccess = () => {
                resolve(request.result); // Se não existir, virá undefined
              };
              request.onerror = event => reject(event.target.error);
            });
          }

          // Função principal para atualizar SRC de todos os GIFs usando IndexedDB
          async function cacheGifs() {
            const db = await openDB();

            // Seleciona todas as imagens que têm data-src (e não mais src diretamente)
            const gifImgs = document.querySelectorAll('img[data-src]');

            for (const img of gifImgs) {
              const src = img.getAttribute('data-src'); // ex: "/gifs/arquivo.gif"
              const gifName = src.split('/').pop();      // ex: "arquivo.gif"

              try {
                // 1) Verifica se já existe Blob no IndexedDB
                const cachedBlob = await getGif(db, gifName);

                if (cachedBlob) {
                  // Se existir no DB, gera um objeto local e seta no src
                  const objectURL = URL.createObjectURL(cachedBlob);
                  img.src = objectURL;
                } else {
                  // 2) Se não existe, faz fetch do GIF no servidor e armazena
                  const response = await fetch(src);
                  const blob = await response.blob();
                  await storeGif(db, gifName, blob);

                  // Depois de salvo, aponta a imagem pro ObjectURL local
                  const objectURL = URL.createObjectURL(blob);
                  img.src = objectURL;
                }
              } catch (error) {
                console.error('Erro ao gerenciar IndexedDB para', gifName, error);
              }
            }
          }

          // Dispara a função após o carregamento do DOM
          document.addEventListener('DOMContentLoaded', cacheGifs);
          // -------------------[ Fim do Script para IndexedDB ]-------------------
        </script>
      </body>
      </html>
      `;

			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(html);
		});
	}

	// Servir arquivos GIF estáticos
	else if (req.url.startsWith('/gifs/')) {
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
	}

	// Servir arquivos de vídeo com suporte a Range
	else if (req.url.startsWith('/videos/')) {
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
				// Sem cabeçalho range, envia o arquivo inteiro
				res.writeHead(200, {
					'Content-Type': 'video/mp4',
					'Content-Length': fileSize,
				});
				fs.createReadStream(videoPath).pipe(res);
			} else {
				// Enviar apenas o pedaço solicitado (streaming)
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
	}

	// Qualquer outra rota retorna 404
	else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Página não encontrada');
	}
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
