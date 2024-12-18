const fs = require('fs');
const path = require('path');

const folderPath = '/Volumes/Extension/Videos/3x'; // Substitua pelo caminho da sua pasta

fs.readdir(folderPath, (err, files) => {
	if (err) {
		console.error('Erro ao ler a pasta:', err);
		return;
	}

	// Filtra apenas arquivos (ignora diretórios, opcional)
	const fileNames = files.filter((file) => fs.lstatSync(path.join(folderPath, file)).isFile());

	console.log('Arquivos na pasta:', fileNames);
});
