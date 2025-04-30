const { execSync } = require('child_process');
const fs = require('fs');

// Obtém o FILE_NAME a partir de uma flag ao executar o script no terminal
const args = process.argv.slice(2);
const fileNameArg = args.find((arg) => arg.startsWith('--file='));
if (!fileNameArg) {
	console.error(
		'Erro: Você deve fornecer o nome do arquivo usando a flag --file. Exemplo: node script.js --file=MeuVideo',
	);
	process.exit(1);
}
const FILE_NAME = fileNameArg.split('=')[1];

const INPUT_VIDEO = `${process.cwd()}/videos/${FILE_NAME}.mp4`;
const OUTPUT_DIR = `${process.cwd()}/gifs`;
const OUTPUT_GIF = `${OUTPUT_DIR}/${FILE_NAME}.gif`;
const FRAME_DIR = `${process.cwd()}/frames_tmp`;
const PALETTE_PATH = `${process.cwd()}/palette.png`;

// Garantir que o diretório de saída exista
if (!fs.existsSync(OUTPUT_DIR)) {
    console.log('Criando diretório para GIFs...');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const WIDTH = 320; // Largura do GIF final
const FPS = 10; // Frames por segundo no GIF final
const SEGMENT_DURATION = 1; // Segundos de cada trecho

// Função para obter a duração do vídeo
function getDuration(videoPath) {
	try {
		const cmd = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`;
		const output = execSync(cmd).toString().trim();
		return parseFloat(output);
	} catch (error) {
		console.error(`Erro ao obter duração do vídeo: ${error.message}`);
		process.exit(1);
	}
}

// Limpa diretório de frames se existir, e cria um novo
if (fs.existsSync(FRAME_DIR)) {
	fs.rmSync(FRAME_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAME_DIR);

// Obtém a duração total
const totalSeconds = getDuration(INPUT_VIDEO);

// Calcula pontos de início para cada trecho de 5s
const startPoints = [
	totalSeconds * 0.1,
	totalSeconds * 0.3,
	totalSeconds * 0.5,
	totalSeconds * 0.7,
	totalSeconds * 0.9,
];

// Função para extrair frames de um intervalo
// start: segundo de início
// duration: duração do trecho (5s)
// prefix: prefixo para nomear arquivos
function extractFrames(start, duration, prefix) {
	try {
		const cmd = `ffmpeg -y -ss ${start} -t ${duration} -i "${INPUT_VIDEO}" -vf "scale=${WIDTH}:-1:force_original_aspect_ratio=decrease,fps=${FPS}" "${FRAME_DIR}/${prefix}_%03d.png" -hide_banner -loglevel error`;
		execSync(cmd);
	} catch (error) {
		console.error(`Erro ao extrair frames: ${error.message}`);
		// Continuar com os outros segmentos mesmo se um falhar
	}
}

// Extrai frames para cada um dos 4 trechos
extractFrames(startPoints[0], SEGMENT_DURATION, 'segment1');
extractFrames(startPoints[1], SEGMENT_DURATION, 'segment2');
extractFrames(startPoints[2], SEGMENT_DURATION, 'segment3');
extractFrames(startPoints[3], SEGMENT_DURATION, 'segment4');
extractFrames(startPoints[4], SEGMENT_DURATION, 'segment5');

try {
	// Verifica se existem frames para processar
	const frameFiles = fs.readdirSync(FRAME_DIR);
	if (frameFiles.length === 0) {
		throw new Error('Nenhum frame foi extraído do vídeo.');
	}

	// Gera paleta com base nos frames
	console.log('Gerando paleta de cores...');
	execSync(`ffmpeg -pattern_type glob -i '${FRAME_DIR}/segment*_*.png' -vf "palettegen" -y "${PALETTE_PATH}"`);

	// Gera o GIF final usando a paleta
	console.log('Criando GIF final...');
	execSync(
		`ffmpeg -framerate ${FPS} -pattern_type glob -i '${FRAME_DIR}/segment*_*.png' -i "${PALETTE_PATH}" -lavfi "paletteuse" -y "${OUTPUT_GIF}"`,
	);
} catch (error) {
	console.error(`Erro ao gerar o GIF: ${error.message}`);
	// Limpar arquivos temporários antes de sair
	if (fs.existsSync(PALETTE_PATH)) {
		fs.unlinkSync(PALETTE_PATH);
	}
	if (fs.existsSync(FRAME_DIR)) {
		fs.rmSync(FRAME_DIR, { recursive: true, force: true });
	}
	process.exit(1);
}

// Remove o arquivo de paleta
if (fs.existsSync(PALETTE_PATH)) {
	fs.unlinkSync(PALETTE_PATH);
}

// Remove a pasta de frames
if (fs.existsSync(FRAME_DIR)) {
	fs.rmSync(FRAME_DIR, { recursive: true, force: true });
}

console.clear();

console.log('GIF criado com sucesso em:', OUTPUT_GIF);
