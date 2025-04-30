# Estrutura do Projeto

## Tecnologias Utilizadas
- JavaScript: Linguagem de programação principal.
- Node.js: Ambiente de execução.
- ffmpeg: Ferramenta para processamento de vídeos e criação de GIFs.
- IndexedDB: Banco de dados no navegador para cache de GIFs.
- HTTP: Servidor web nativo do Node.js.

## Arquivos do Projeto
- `server.js`: Servidor HTTP para exibir e servir GIFs e vídeos.
- `generate-gifs.js`: Script para converter um único vídeo MP4 em GIF.
- `generate-all-gifs.js`: Script para processar todos os vídeos da pasta "videos" e gerar os GIFs correspondentes.
- `index.js`: Arquivo simples que mostra o diretório atual.
- `package.json`: Configuração do projeto e dependências.
- `/videos/`: Diretório que contém os vídeos MP4 originais.
- `/gifs/`: Diretório que armazena os GIFs gerados a partir dos vídeos.

## Fluxo de Funcionamento
1. Os vídeos são colocados na pasta "videos".
2. O script `generate-all-gifs.js` processa os vídeos e cria GIFs na pasta "gifs".
3. O servidor web (`server.js`) exibe os GIFs em um mosaico e permite clicar para assistir ao vídeo original.
4. O sistema usa IndexedDB para cache local dos GIFs, evitando recarregamentos desnecessários.