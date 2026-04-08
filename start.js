const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const inquirer = require('inquirer').default;
const { startServer } = require('./server');

const PROJECT_ROOT = __dirname;
const DEFAULT_VIDEOS_DIR = path.join(PROJECT_ROOT, 'videos');

async function promptFolder() {
	const { choice } = await inquirer.prompt([
		{
			type: 'list',
			name: 'choice',
			message: 'Qual pasta de vídeos deseja usar?',
			choices: [
				{ name: `Padrão (./videos)`, value: 'default' },
				{ name: 'Outra pasta (digitar caminho)', value: 'custom' },
			],
		},
	]);

	if (choice === 'default') {
		return { videosDir: DEFAULT_VIDEOS_DIR, folderName: 'default' };
	}

	const { customPath } = await inquirer.prompt([
		{
			type: 'input',
			name: 'customPath',
			message: 'Digite o caminho completo da pasta de vídeos:',
			validate: (input) => {
				const resolved = path.resolve(input);
				if (!fs.existsSync(resolved)) {
					return `Pasta não encontrada: ${resolved}`;
				}
				if (!fs.statSync(resolved).isDirectory()) {
					return `O caminho não é um diretório: ${resolved}`;
				}
				return true;
			},
		},
	]);

	const resolved = path.resolve(customPath);
	const folderName = path.basename(resolved);
	return { videosDir: resolved, folderName };
}

function generateGif(fileName, videosDir, gifsDir) {
	return new Promise((resolve, reject) => {
		const cmd = `node "${path.join(PROJECT_ROOT, 'generate-gifs.js')}" --file="${fileName}" --videosDir="${videosDir}" --gifsDir="${gifsDir}"`;
		console.log(`  Gerando GIF: ${fileName}`);
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.error(`  Erro ao gerar GIF para ${fileName}:`, stderr);
				reject(err);
				return;
			}
			console.log(`  GIF gerado: ${fileName}.gif`);
			resolve();
		});
	});
}

async function generateMissingGifs(videosDir, gifsDir) {
	if (!fs.existsSync(gifsDir)) {
		fs.mkdirSync(gifsDir, { recursive: true });
	}

	if (!fs.existsSync(videosDir)) {
		console.log(`Pasta de vídeos não encontrada: ${videosDir}`);
		return;
	}

	const files = fs.readdirSync(videosDir);
	const mp4Files = files.filter(
		(f) => f.endsWith('.mp4') && !f.startsWith('._') && fs.lstatSync(path.join(videosDir, f)).isFile()
	);

	const missing = mp4Files
		.map((f) => f.replace('.mp4', ''))
		.filter((name) => !fs.existsSync(path.join(gifsDir, `${name}.gif`)));

	if (missing.length === 0) {
		console.log('Todos os GIFs já existem. Nenhum para gerar.');
		return;
	}

	console.log(`\nGerando ${missing.length} GIF(s) faltante(s)...\n`);

	for (const name of missing) {
		try {
			await generateGif(name, videosDir, gifsDir);
		} catch {
			console.error(`  Falha ao gerar ${name}, continuando...`);
		}
	}

	console.log('\nGeração de GIFs concluída.\n');
}

async function main() {
	const { videosDir, folderName } = await promptFolder();
	const gifsDir = path.join(PROJECT_ROOT, 'gifs', folderName);

	console.log(`\nPasta de vídeos: ${videosDir}`);
	console.log(`Pasta de GIFs:   ${gifsDir}\n`);

	await generateMissingGifs(videosDir, gifsDir);

	startServer(videosDir, gifsDir);
}

main().catch((err) => {
	console.error('Erro ao iniciar:', err);
	process.exit(1);
});
