const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FILE_NAME = 'DILLION HARPER S FIRST SCENE YOUNG PORNSTAR WHEN SHE WAS STILL AN AMATEUR';
const INPUT_VIDEO = `/Volumes/Extension/${FILE_NAME}.mp4`;
const OUTPUT_GIF = `/Volumes/Extension/Projects/personal-video-server/${FILE_NAME}.gif`;
const FRAME_DIR = '/Volumes/Extension/Projects/personal-video-server/frames_tmp';
const PALETTE_PATH = '/Volumes/Extension/Projects/personal-video-server/palette.png';

const WIDTH = 320; // Largura do GIF final
const FPS = 10; // Frames por segundo no GIF final
const SEGMENT_DURATION = 1; // Segundos de cada trecho

// Função para obter a duração do vídeo
function getDuration(videoPath) {
	const cmd = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`;
	const output = execSync(cmd).toString().trim();
	return parseFloat(output);
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
	60, // 1 minuto
	totalSeconds * 0.25,
	totalSeconds * 0.5,
	totalSeconds * 0.75,
];

// Função para extrair frames de um intervalo
// start: segundo de início
// duration: duração do trecho (5s)
// prefix: prefixo para nomear arquivos
function extractFrames(start, duration, prefix) {
	const cmd = `ffmpeg -y -ss ${start} -t ${duration} -i "${INPUT_VIDEO}" -vf "scale=${WIDTH}:-1:force_original_aspect_ratio=decrease,fps=${FPS}" "${FRAME_DIR}/${prefix}_%03d.png" -hide_banner -loglevel error`;
	execSync(cmd);
}

// Extrai frames para cada um dos 4 trechos
extractFrames(startPoints[0], SEGMENT_DURATION, 'segment1');
extractFrames(startPoints[1], SEGMENT_DURATION, 'segment2');
extractFrames(startPoints[2], SEGMENT_DURATION, 'segment3');
extractFrames(startPoints[3], SEGMENT_DURATION, 'segment4');

// Agora temos frames como segment1_001.png, segment1_002.png, ..., segment4_XXX.png
// Para gerar o GIF, vamos usar um padrão de entrada glob.
// O ffmpeg processa em ordem alfabética, então segment1 vem antes de segment2, e assim por diante.
// Isso garantirá que a ordem seja segment1, depois segment2, segment3 e segment4.
//
// Caso queira garantir total controle da ordem, poderíamos renomear os arquivos posteriormente,
// mas dado a nomeação com prefixos segment1, segment2, etc, a ordem alfabética deve refletir a ordem desejada.

// Gera paleta com base nos frames
execSync(`ffmpeg -pattern_type glob -i '${FRAME_DIR}/segment*_*.png' -vf "palettegen" -y "${PALETTE_PATH}"`);

// Gera o GIF final usando a paleta
execSync(
	`ffmpeg -framerate ${FPS} -pattern_type glob -i '${FRAME_DIR}/segment*_*.png' -i "${PALETTE_PATH}" -lavfi "paletteuse" -y "${OUTPUT_GIF}"`,
);

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
