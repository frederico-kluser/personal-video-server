# CLAUDE.md

Este arquivo fornece orientações ao **Claude Code** (claude.ai/code) ao trabalhar com código neste repositório.

## Pesquisa Obrigatória Antes de Cada Decisão Técnica

> **REGRA DE OURO:** _Nenhuma decisão técnica deve ser tomada sem pesquisa prévia na internet._

**ANTES** de realizar **qualquer** ação que altere código ou configuração — por exemplo, escolher/atualizar uma
biblioteca, definir arquitetura, otimizar desempenho, refatorar, corrigir bugs ou ajustar testes — Claude **DEVE**:

1. Formular perguntas claras sobre o problema ou decisão.
2. Pesquisar na internet as práticas mais recentes, soluções alternativas e referências confiáveis.
3. Registrar temporariamente todas as URLs consultadas seguindo o **Procedimento Obrigatório** descrito abaixo.
4. Somente **após** avaliar criticamente as fontes coletadas, documentar e implementar a decisão técnica.

## Requisitos de Instalação e Execução

Use **sempre** yarn para instalar dependências e executar scripts neste repositório. Não utilize npm ou outros
gerenciadores de pacotes.

## Roadmap de Implementação Orientado a Tarefas

Após concluir os passos de pesquisa e **antes** de implementar qualquer mudança de código, Claude **DEVE**:

1. **Criar** (ou limpar o arquivo, se já existir) um arquivo `roadmap.md` na raiz do repositório.
2. Nesse arquivo, listar as atividades identificadas durante a pesquisa como caixas de seleção (_Markdown checkboxes_),
   por exemplo:
   - [ ] Nome da atividade 1
   - [ ] Nome da atividade 2
3. Fazer **commit** do `roadmap.md` contendo as novas tarefas **antes** de alterar qualquer outro arquivo de código.
4. Implementar a primeira tarefa.
5. Assim que a tarefa for concluída, marcar sua checkbox correspondente como concluída (`[x]`) no `roadmap.md`.
6. Comitar **juntos** o código alterado e o `roadmap.md` atualizado.
7. Repetir o processo para cada tarefa até que todas as caixas estejam marcadas.
8. Após concluir todas as tarefas, deletar o arquivo `roadmap.md`.

Este fluxo garante rastreabilidade completa entre pesquisa, planejamento e código entregue.

## Documentação da Estrutura do Projeto

**ANTES** de iniciar qualquer trabalho ou (pesquisa na internet) no repositório, Claude **DEVE**:

1. Verificar se existe um arquivo `project-structure.md` na raiz do repositório.
2. Caso **não exista**, criar o arquivo `project-structure.md` contendo:

   - Tecnologias utilizadas no projeto. ex:
      - TypeScript: linguagem de programação.
      - Node.js: ambiente de execução.
      - etc
   - Todos os arquivos do projeto e suas respectivas funções. ex:
      - `src/index.ts`: ponto de entrada do projeto.
      - `src/utils/validateCpf.ts`: função para validar CPF.
      - etc

3. Caso o arquivo já exista, revisá-lo para garantir que está atualizado com a estrutura atual.
4. Sempre consultar este arquivo ao trabalhar com o código para manter contexto sobre a organização do projeto.
5. Atualizar o `project-structure.md` sempre que alterações significativas forem feitas na estrutura ou tecnologias do
   projeto.

Este documento é essencial para manter uma visão clara e consolidada da arquitetura do projeto.

---

## Instruções para Pesquisa de Links

ATENÇÃO: Claude, você **DEVE SEMPRE** seguir **exatamente** o procedimento abaixo quando precisar acessar **qualquer**
link que não esteja listado neste arquivo **ou** quando realizar a pesquisa obrigatória descrita acima:

### PROCEDIMENTO OBRIGATÓRIO (NÃO PULE NENHUMA ETAPA):

1. **ANTES** de tentar acessar **qualquer** URL não listada aqui:

   - **PRIMEIRO**, edite este arquivo `CLAUDE.md`.
   - **ADICIONE** a URL que planeja acessar na seção **"Links Úteis"** abaixo.
   - **SOMENTE DEPOIS DISSO**, use o `WebFetchTool` para acessar a URL.
   - Após obter os resultados, **VOLTE** e **REMOVA** a URL temporária que adicionou.

2. Quando o usuário pedir para pesquisar um tópico genérico (sem URL específica):

   - Use o mecanismo de busca **DDG** (`https://api.duckduckgo.com`) que já está na lista.
   - Faça a pesquisa **em inglês**, mesmo que o usuário pergunte em português.
   - Construa a URL de pesquisa no formato: `https://api.duckduckgo.com/?q=CONSULTA&format=json`.
   - **Adicione temporariamente** essa URL de pesquisa ao `CLAUDE.md`.
   - Use `WebFetchTool` para fazer a consulta.
   - **Remova** a URL específica de pesquisa após concluir.
   - Devolva a resposta ao usuário **no idioma original** da pergunta.

3. Para redirecionamentos:

   - Se encontrar erros de redirecionamento, **ADICIONE** **AMBAS** as URLs (original e de destino).
   - Faça a pesquisa usando a URL de destino.
   - Remova ambas as URLs após a pesquisa.

4. Para erros 308 (Permanent Redirect) ou outros erros de redirecionamento:

   - Adicione a URL alternativa que acredita ser o destino real.
   - Por exemplo, se `example.com/api` falhar, tente adicionar `example.com/api/`.

### Exemplo de Uso Obrigatório

```markdown
# Usuário pergunta: "O que é LangChain?"

1. Claude pensa: "Vou pesquisar sobre LangChain no DuckDuckGo".
2. Claude **PRIMEIRO** edita `CLAUDE.md` e adiciona:
   - https://api.duckduckgo.com/?q=what+is+langchain&format=json
3. **SOMENTE ENTÃO** Claude usa `WebFetchTool` para acessar essa URL.
4. Claude processa os resultados.
5. Claude **REMOVE** a URL temporária do `CLAUDE.md`.
6. Claude responde ao usuário com as informações obtidas.
```

Este procedimento é absolutamente necessário devido a restrições de segurança e NÃO DEVE SER IGNORADO sob nenhuma
circunstância. Qualquer tentativa de acessar URLs não listadas sem seguir este procedimento resultará em erros.

## Links Úteis:

