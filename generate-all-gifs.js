const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Flags opcionais para diretórios customizados
const args = process.argv.slice(2);
const videosDirArg = args.find((arg) => arg.startsWith('--videosDir='));
const gifsDirArg = args.find((arg) => arg.startsWith('--gifsDir='));

const folderPath = videosDirArg ? videosDirArg.split('=')[1] : path.join(process.cwd(), 'videos');
const gifFolderPath = gifsDirArg ? gifsDirArg.split('=')[1] : path.join(process.cwd(), 'gifs');

// Verifica se a pasta de GIFs existe e cria se não existir
if (!fs.existsSync(gifFolderPath)) {
    console.log('Criando pasta de GIFs...');
    fs.mkdirSync(gifFolderPath, { recursive: true });
}

function processFile(file) {
	return new Promise((resolve, reject) => {
		const cmd = `node ${process.cwd()}/generate-gifs.js --file="${file}" --videosDir="${folderPath}" --gifsDir="${gifFolderPath}"`;
		console.log(`Processando: ${file}`);
		exec(cmd, (err, stdout, stderr) => {
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

// Verifica se a pasta de vídeos existe
if (!fs.existsSync(folderPath)) {
	console.error(`Pasta de vídeos não encontrada: ${folderPath}`);
	process.exit(1);
}

fs.readdir(folderPath, (err, files) => {
	if (err) {
		console.error('Erro ao ler a pasta:', err);
		return;
	}

	// Filtra apenas arquivos (ignora diretórios, opcional)
	const fileNames = files.filter((file) => fs.lstatSync(path.join(folderPath, file)).isFile());

	const onlyMp4Files = fileNames.filter((file) => file.endsWith('.mp4') && !file.startsWith('._'));

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
