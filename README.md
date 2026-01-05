# Personal Video Server

Um servidor web pessoal para organizar, visualizar e assistir sua coleção de vídeos locais. O sistema gera automaticamente GIFs de preview e exibe uma galeria interativa que funciona tanto no computador quanto em dispositivos móveis na mesma rede.

## Funcionalidades

- **Galeria de Mosaico** - Interface visual com GIFs de preview em grade responsiva
- **Geração Automática de GIFs** - Cria previews animados extraindo frames de 5 pontos diferentes do vídeo (10%, 30%, 50%, 70% e 90% da duração)
- **Streaming de Vídeo** - Suporte completo a Range Requests para reprodução eficiente e seeking
- **Cache Inteligente** - Utiliza IndexedDB no navegador para armazenar GIFs localmente, evitando downloads repetidos
- **Acesso via QR Code** - Gera QR Code no terminal para conexão rápida de dispositivos móveis
- **Detecção Automática de Rede** - Exibe todos os IPs disponíveis para acesso em outros dispositivos
- **Fallback de Portas** - Tenta automaticamente portas alternativas se a preferida estiver em uso
- **Design Responsivo** - Interface adaptada para desktop e mobile com bordas arredondadas e layout otimizado

## Requisitos

### Obrigatórios
- **Node.js** (versão 14 ou superior)
- **ffmpeg** e **ffprobe** (para geração de GIFs)

### Instalação do ffmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS (com Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
Baixe em [ffmpeg.org](https://ffmpeg.org/download.html) e adicione ao PATH do sistema.

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/personal-video-server.git
cd personal-video-server
```

2. Instale as dependências com yarn:
```bash
yarn install
```

3. Crie a pasta de vídeos (se não existir) e adicione seus arquivos MP4:
```bash
mkdir -p videos
# Copie seus vídeos .mp4 para a pasta videos/
```

## Uso

### Iniciar o Servidor

```bash
yarn start
```

O servidor iniciará e exibirá:
- URL local: `http://localhost:8888`
- URLs de rede para acesso de outros dispositivos
- QR Code para escaneamento com celular

### Gerar GIFs de Preview

Para processar todos os vídeos e gerar os GIFs correspondentes:

```bash
yarn generate-gifs
```

Este comando:
- Processa todos os arquivos `.mp4` na pasta `videos/`
- Pula vídeos que já possuem GIF gerado
- Cria GIFs otimizados com paleta de cores

Para gerar GIF de um único vídeo:

```bash
node generate-gifs.js --file=NomeDoVideo
```

(Sem a extensão .mp4)

## Estrutura do Projeto

```
personal-video-server/
├── server.js              # Servidor HTTP principal
├── generate-gifs.js       # Script para gerar GIF de um vídeo específico
├── generate-all-gifs.js   # Script para processar todos os vídeos
├── index.js               # Utilitário para exibir diretório atual
├── package.json           # Configuração do projeto e dependências
├── videos/                # Pasta para armazenar vídeos MP4
├── gifs/                  # Pasta com GIFs gerados automaticamente
└── docs/
    └── acesso-externo-seguro.md  # Guia para expor servidor à internet
```

## Como Funciona

### 1. Servidor Web (`server.js`)

O servidor HTTP nativo do Node.js oferece:

- **Rota `/`** - Página principal com galeria de GIFs em mosaico embaralhado
- **Rota `/gifs/*`** - Serve arquivos GIF estáticos
- **Rota `/videos/*`** - Serve vídeos MP4 com suporte a streaming (Range Requests)

### 2. Geração de GIFs (`generate-gifs.js`)

O processo de criação de GIFs:

1. Obtém a duração total do vídeo via `ffprobe`
2. Extrai frames de 5 pontos do vídeo (10%, 30%, 50%, 70%, 90%)
3. Cada segmento captura 1 segundo a 10 FPS
4. Redimensiona para largura de 320px mantendo proporção
5. Gera paleta de cores otimizada
6. Combina os frames em um GIF final com boa qualidade

### 3. Sistema de Cache (IndexedDB)

O navegador armazena os GIFs localmente:

1. Ao carregar a página, verifica se o GIF existe no IndexedDB
2. Se existir, carrega do cache local (instantâneo)
3. Se não existir, baixa do servidor e armazena para próximas visitas
4. Elimina downloads repetidos e acelera carregamentos futuros

### 4. Acesso em Rede Local

Ao iniciar, o servidor:

1. Detecta todas as interfaces de rede IPv4
2. Exibe URLs para acesso de outros dispositivos
3. Gera QR Code para conexão rápida via celular
4. Lista todas as opções de porta disponíveis

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 8888 |

Exemplo:
```bash
PORT=3000 yarn start
```

### Portas Preferidas

O servidor tenta as seguintes portas em ordem se a preferida estiver ocupada:

`8888` → `9999` → `7777` → `6666` → `5555` → `4444` → `3333` → `2222` → `1111` → porta aleatória

### Parâmetros de Geração de GIF

No arquivo `generate-gifs.js`:

```javascript
const WIDTH = 320;           // Largura do GIF em pixels
const FPS = 10;              // Frames por segundo
const SEGMENT_DURATION = 1;  // Duração de cada segmento em segundos
```

## Tecnologias Utilizadas

- **JavaScript** - Linguagem de programação principal
- **Node.js** - Ambiente de execução do servidor
- **HTTP nativo** - Servidor web sem frameworks externos
- **ffmpeg/ffprobe** - Processamento de vídeo e extração de frames
- **IndexedDB** - Banco de dados no navegador para cache
- **qrcode-terminal** - Geração de QR Codes no terminal
- **nodemon** - Hot reload durante desenvolvimento

## Acesso Externo (Internet)

Para acessar o servidor fora da rede local, consulte o guia detalhado em:

[docs/acesso-externo-seguro.md](docs/acesso-externo-seguro.md)

Opções recomendadas:
- **Cloudflare Tunnel** - Solução segura e gratuita (recomendado)
- **ngrok** - Alternativa simples para testes temporários

## Fluxo de Funcionamento

```
┌─────────────────┐
│  Adicionar      │
│  vídeos MP4     │
│  em /videos     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  yarn           │
│  generate-gifs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GIFs criados   │
│  em /gifs       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  yarn start     │
│  (servidor)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Acessar via    │
│  navegador ou   │
│  QR Code        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clicar no GIF  │
│  para assistir  │
│  o vídeo        │
└─────────────────┘
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn start` | Inicia o servidor com hot reload (nodemon) |
| `yarn generate-gifs` | Gera GIFs para todos os vídeos sem preview |

## Dicas de Uso

1. **Organização**: Nomeie seus vídeos de forma descritiva, pois o nome aparece no alt das imagens
2. **Performance**: Para muitos vídeos, execute a geração de GIFs antes de iniciar o servidor
3. **Mobile**: Use o QR Code para acessar rapidamente pelo celular
4. **Cache**: Limpe o IndexedDB do navegador se quiser forçar download dos GIFs novamente

## Solução de Problemas

### GIFs não estão sendo gerados
- Verifique se o `ffmpeg` está instalado: `ffmpeg -version`
- Certifique-se que os vídeos estão no formato `.mp4`
- Verifique permissões de escrita na pasta `gifs/`

### Servidor não inicia
- Verifique se a porta não está em uso: `lsof -i :8888`
- Tente definir outra porta: `PORT=3000 yarn start`

### Vídeos não carregam no navegador
- Confirme que os vídeos são MP4 válidos com codec H.264
- Verifique o console do navegador para erros de CORS

### QR Code não aparece
- A biblioteca `qrcode-terminal` deve estar instalada
- Execute `yarn install` novamente

## Licença

ISC

## Autor

**Frederico Guilherme Kluser de Oliveira**

---

Feito com Node.js para uso pessoal e educacional.
