const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Diretório contendo os GIFs
const gifsDir = path.join(__dirname, 'public', 'gifs');

// Servir a pasta 'gifs' estaticamente em /gifs
app.use('/gifs', express.static(gifsDir));

// Rota principal (/) que lista todos os gifs em um mosaico simples
app.get('/', (req, res) => {
	fs.readdir(gifsDir, (err, files) => {
		if (err) {
			console.error('Erro ao ler diretório de GIFs:', err);
			return res.status(500).send('Erro interno do servidor');
		}

		// Filtra apenas arquivos .gif
		const gifFiles = files.filter((file) => file.toLowerCase().endsWith('.gif'));

		// Cria tags <img> para cada GIF
		const imgTags = gifFiles
			.map((gif) => `<img src="/gifs/${gif}" style="width:200px; height:auto; margin:5px;">`)
			.join('');

		const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mosaico de GIFs</title>
      <style>
        body {
          display: flex;
          flex-wrap: wrap;
          background: #f0f0f0;
          margin: 0;
          padding: 0;
        }
        img {
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      ${imgTags}
    </body>
    </html>`;

		res.send(html);
	});
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
	console.log('Servidor rodando em http://localhost:3000');
});
