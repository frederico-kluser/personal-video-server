const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const folderPath = `${process.cwd()}/videos`; // Substitua pelo caminho da sua pasta

fs.readdir(folderPath, (err, files) => {
	if (err) {
		console.error('Erro ao ler a pasta:', err);
		return;
	}

	// Filtra apenas arquivos (ignora diretórios, opcional)
	const fileNames = files.filter((file) => fs.lstatSync(path.join(folderPath, file)).isFile());

	const onlyMp4Files = fileNames.filter((file) => file.endsWith('.mp4'));

	const onlyFilesWithoutExtension = onlyMp4Files.map((file) => file.replace('.mp4', ''));

	console.log('Arquivos na pasta:', onlyFilesWithoutExtension);
});
