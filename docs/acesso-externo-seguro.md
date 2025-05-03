# Expondo o Servidor de Vídeo à Internet com Segurança

Este documento contém um estudo sobre as melhores práticas e métodos para tornar um servidor de vídeo acessível fora da rede local, com foco em segurança e performance para streaming.

## Sumário
- [Opções Recomendadas](#opções-recomendadas)
- [Cloudflare Tunnel (Recomendado)](#cloudflare-tunnel-recomendado)
- [Alternativa: Ngrok](#alternativa-ngrok)
- [Configuração Completa para Produção](#configuração-completa-para-produção)
- [Segurança do Servidor](#segurança-do-servidor)
- [Implementação de Autenticação](#implementação-de-autenticação)

## Opções Recomendadas

Para expor um servidor de vídeo à internet com segurança, temos várias opções com diferentes níveis de complexidade e segurança. As soluções abaixo são ordenadas da mais recomendada para alternativas simplificadas.

## Cloudflare Tunnel (Recomendado)

O Cloudflare Tunnel (anteriormente conhecido como Argo Tunnel) é uma das soluções mais seguras e eficientes para expor seu servidor à internet.

### Vantagens:
- Não precisa abrir portas no seu roteador
- Tráfego criptografado
- Proteção contra DDoS
- Autenticação integrada
- Alta velocidade para streaming
- Certificados SSL gratuitos e automáticos

### Como implementar:
1. Crie uma conta gratuita no Cloudflare
2. Registre seu domínio no Cloudflare (ou compre um através deles)
3. Instale o cliente cloudflared no seu servidor
4. Configure o tunnel para apontar para o seu servidor local na porta 8888 (ou outra porta que configurou)

```bash
# Instalação do cloudflared no Ubuntu/Debian
curl -L https://github.com/cloudflare/cloudflare-tunnel/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Login e autenticação
cloudflared tunnel login

# Criar um tunnel
cloudflared tunnel create meu-servidor-video

# Configuração do tunnel (salve em config.yml)
cloudflared tunnel route dns meu-servidor-video seuvideo.seudominio.com

# Inicie o tunnel
cloudflared tunnel run --config config.yml meu-servidor-video
```

No arquivo config.yml:
```yaml
tunnel: seu-id-do-tunnel
credentials-file: /path/to/credentials.json
ingress:
  - hostname: seuvideo.seudominio.com
    service: http://localhost:8888
  - service: http_status:404
```

## Alternativa: Ngrok

Se precisar de uma solução temporária ou mais simples:

### Vantagens:
- Fácil de configurar
- Não precisa de domínio próprio 
- Bom para testes temporários

### Desvantagens:
- Limitações na versão gratuita
- Menos recursos de segurança que o Cloudflare Tunnel
- URLs aleatórias na versão gratuita (versão paga permite domínios personalizados)

### Implementação:
```bash
# Instalar ngrok
npm install -g ngrok

# Expor seu servidor na porta 8888
ngrok http 8888
```

## Configuração Completa para Produção

Para uma solução mais robusta e permanente em ambiente de produção, recomenda-se o seguinte setup:

1. **Configure Cloudflare Tunnel** conforme explicado acima
2. **Adicione autenticação** ao seu servidor Node.js:
   - Implemente JWT (JSON Web Tokens) para autenticação 
   - Configure CORS adequadamente
   - Use senhas fortes e hash de senhas com bcrypt

3. **Configure HTTPS/SSL**:
   - Com Cloudflare Tunnel, isso é automático
   - Alternativamente, use Let's Encrypt para certificados gratuitos

4. **Melhore a segurança do servidor**:
   - Desative o login root via SSH, use chaves SSH
   - Configure um firewall (UFW é simples de usar)
   - Mantenha o sistema atualizado

5. **Otimize para streaming**:
   - Configure o servidor para lidar com conexões simultâneas
   - Implemente buffer e qualidade adaptativa (se possível)
   - Considere um servidor mais potente ou CDN para muitos usuários simultâneos

## Segurança do Servidor

### Configuração do firewall (UFW) recomendada

```bash
# Instalar UFW
sudo apt install ufw

# Configuração básica
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (importante para não perder acesso)
sudo ufw allow ssh

# Permitir HTTP/HTTPS (se necessário para configuração)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar o firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

### Proteção avançada

- Configurar fail2ban para prevenir ataques de força bruta
- Implementar monitoramento de segurança
- Realizar backups regulares
- Manter o sistema e todas as dependências atualizadas

## Implementação de Autenticação

Exemplo de código para implementar autenticação básica no seu servidor Node.js:

```javascript
const express = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Gere uma senha mestra segura - armazene em variável de ambiente em produção
const MASTER_PASSWORD = "senha-super-segura-1111"; 
const hashedPassword = crypto.createHash('sha256').update(MASTER_PASSWORD).digest('hex');

// Middleware de autenticação
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.writeHead(401, {'WWW-Authenticate': 'Basic'});
    return res.end('Autenticação necessária');
  }
  
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const password = auth[1] || '';
  const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  if (hashedInputPassword === hashedPassword) {
    return next();
  } else {
    res.writeHead(401, {'WWW-Authenticate': 'Basic'});
    return res.end('Credenciais inválidas');
  }
}

// Aplicar middleware de autenticação às rotas necessárias
// Adicione este middleware antes de servir conteúdo sensível
```

---

**Nota**: Este documento contém apenas sugestões e pesquisas. Antes de implementar em um ambiente de produção, sempre realize testes adequados e considere consultar um profissional de segurança. 