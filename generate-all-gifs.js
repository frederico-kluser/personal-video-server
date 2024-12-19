const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const folderPath = `${process.cwd()}/videos`; // Substitua pelo caminho da sua pasta
const gifFolderPath = `${process.cwd()}/gifs`; // Caminho onde os GIFs são armazenados

function processFile(file) {
	return new Promise((resolve, reject) => {
		console.log(`Processando: ${file} - node ${process.cwd()}/generate-gifs.js --file="${file}"`);
		exec(`node ${process.cwd()}/generate-gifs.js --file="${file}"`, (err, stdout, stderr) => {
			if (err) {
				console.error(`Erro ao processar o arquivo ${file}:`, stderr);
				reject(err);
				return;
			}
			console.log(`Arquivo ${file} processado com sucesso:\n${stdout}`);
			resolve();
		});
	});
}

async function processFilesSequentially(files) {
	for (const file of files) {
		try {
			await processFile(file);
		} catch (err) {
			console.error(`Erro ao processar ${file}, continuando com o próximo...`);
		}
	}
	console.log('Todos os arquivos foram processados.');
}

fs.readdir(folderPath, (err, files) => {
	if (err) {
		console.error('Erro ao ler a pasta:', err);
		return;
	}

	// Filtra apenas arquivos (ignora diretórios, opcional)
	const fileNames = files.filter((file) => fs.lstatSync(path.join(folderPath, file)).isFile());

	const onlyMp4Files = fileNames.filter((file) => file.endsWith('.mp4'));

	// Remove a extensão do nome do arquivo
	const onlyFilesWithoutExtension = onlyMp4Files.map((file) => file.replace('.mp4', ''));

	// Filtra apenas os arquivos que não têm GIF correspondente
	const filesToProcess = onlyFilesWithoutExtension.filter((file) => {
		const gifPath = path.join(gifFolderPath, `${file}.gif`);
		if (fs.existsSync(gifPath)) {
			console.log(`GIF já existe para o arquivo: ${file}.mp4`);
			return false;
		}
		return true;
	});

	if (filesToProcess.length === 0) {
		console.log('Todos os GIFs já estão criados. Nada para processar.');
		return;
	}

	processFilesSequentially(filesToProcess).then(() => {
		console.log('Todos os arquivos processados!');
	});
});
