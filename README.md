# Segundo Trabalho de Programacao para Web - PUC-Encontra Frontend

Frontend do PUC-Encontra, uma plataforma web de achados e perdidos para a PUC. A aplicacao permite consultar itens publicos, cadastrar usuario, fazer login, registrar objetos perdidos ou encontrados, gerenciar os proprios registros e acessar telas administrativas quando o usuario logado e administrador.

## Integrantes

- Dante Navaza - 2321406
- Rafael Soares - 2320470

## Links

- Site frontend publicado: [https://puc-encontra-frontend.vercel.app/](https://puc-encontra-frontend.vercel.app/)
- Site backend publicado: [https://puc-encontra-api.vercel.app/](https://puc-encontra-api.vercel.app/)

## Escopo

O frontend foi desenvolvido com HTML, CSS e TypeScript. O JavaScript usado pelo navegador e gerado pelo compilador TypeScript no diretorio `dist/`.

Funcionalidades implementadas:

- Pagina inicial publica.
- Listagem publica de itens perdidos, encontrados e devolvidos.
- Filtros por texto, categoria, local e tipo.
- Login e cadastro de usuario.
- Logout.
- Dashboard para usuario comum.
- Dashboard para administrador.
- Cadastro, edicao e exclusao de objetos.
- Upload de imagem local pelo computador.
- Visualizacao detalhada de objeto.
- Lista de "Meus Registros".
- Troca de senha.
- Recuperacao de senha por link enviado por e-mail.
- Edicao de perfil.
- Desativacao de conta.
- Area administrativa para aprovar ou rejeitar objetos pendentes.
- CRUD administrativo de categorias.
- CRUD administrativo de locais.
- CRUD administrativo de usuarios.
- Navegacao com URLs reais, como `/login`, `/explorar`, `/meus-registros` e `/objetos/1`.

## Tecnologias

- HTML
- CSS
- TypeScript
- Fetch API
- LocalStorage para armazenar token de autenticacao
- Servidor estatico Node `serve` para desenvolvimento local

## Instalacao Local

Clone o repositorio:

```bash
git clone https://github.com/Raafaael/PUC-Encontra-FrontEnd.git
cd PUC-Encontra-FrontEnd
```

Instale as dependencias:

```bash
npm install
```

Compile o TypeScript:

```bash
npm run build
```

Execute o servidor local:

```bash
npm run serve
```

Acesse:

```text
http://127.0.0.1:5173/
```

## Backend Necessario

O frontend espera que a API esteja rodando em:

```text
http://127.0.0.1:8000/api
```

Para rodar o backend localmente:

```bash
cd ../PUC-Encontra-API
source .venv/bin/activate
SERVE_MEDIA=True python manage.py runserver 127.0.0.1:8000
```

Antes disso, o backend deve ter as migracoes e o seed aplicados:

```bash
python manage.py migrate
python manage.py seed
```

## Publicacao na Vercel

O repositorio ja contem os arquivos necessarios para deploy estatico na Vercel:

- `vercel.json`: configura `npm run build`, publica a pasta `dist/` e redireciona rotas internas para `index.html`.
- `scripts/build-assets.mjs`: copia o CSS, gera `dist/index.html` e cria a configuracao de runtime.
- `src/config.ts`: le a URL da API a partir de `window.PUC_ENCONTRA_CONFIG`.

Crie um projeto separado na Vercel apontando para este repositorio e configure a variavel:

```env
PUC_ENCONTRA_API_URL=https://SEU-BACKEND.vercel.app/api
```

O valor nao deve terminar com barra. Se terminar, o build remove a barra automaticamente.

Ordem recomendada:

1. Publique primeiro o backend.
2. Confirme que `https://SEU-BACKEND.vercel.app/api/docs/` abre.
3. Configure `PUC_ENCONTRA_API_URL` no projeto do frontend.
4. Publique o frontend.
5. Volte ao backend e ajuste `CORS_ALLOWED_ORIGINS` para a URL final do frontend.

## Usuarios de Teste

Todos os usuarios criados pelo seed usam a senha:

```text
PucEncontra123
```

Usuarios:

```text
admin   - Administrador
aluno1  - Usuario comum
aluno2  - Usuario comum
```

## Manual do Usuario

Fluxo publico:

1. Abra [https://puc-encontra-frontend.vercel.app/](https://puc-encontra-frontend.vercel.app/).
2. Clique em "Itens" ou acesse `/explorar`.
3. Use os filtros para procurar objetos por texto, categoria, local ou tipo.
4. Clique em um objeto para abrir a pagina de detalhes.

Fluxo de usuario comum:

1. Acesse `/login`.
2. Entre com `aluno1` e senha `PucEncontra123`.
3. Abra o dashboard para ver os seus registros e possiveis correspondencias.
4. Acesse "Meus Registros" para editar ou excluir seus objetos.
5. Clique em "Registrar Solicitacao" para cadastrar um objeto perdido ou encontrado.
6. Selecione uma imagem local do computador no campo "Imagem do computador".
7. Acesse "Perfil" para editar dados, trocar senha ou desativar a conta.
8. Em "Esqueceu sua senha?", informe o e-mail cadastrado e abra o link recebido para redefinir a senha.

Fluxo de administrador:

1. Acesse `/login`.
2. Entre com `admin` e senha `PucEncontra123`.
3. Use o dashboard para acompanhar pendencias e estatisticas.
4. Acesse "Aprovacoes" para aprovar ou rejeitar objetos pendentes.
5. Acesse "Categorias" para criar, editar e excluir categorias.
6. Acesse "Locais" para criar, editar e excluir locais.
7. Acesse "Usuarios" para criar e editar usuarios administrativos ou comuns.

## Rotas Principais

```text
/                 - Pagina inicial
/explorar         - Listagem publica
/login            - Login
/cadastro         - Cadastro
/dashboard        - Dashboard do usuario logado
/meus-registros   - Registros do usuario logado
/registro         - Formulario de objeto
/objetos/{id}     - Detalhe de objeto
/perfil           - Perfil
/trocar-senha     - Troca de senha
/redefinir-senha  - Recuperacao de senha; tambem aceita `?uid=...&token=...`
/aprovacoes       - Area administrativa
/categorias       - CRUD de categorias
/locais           - CRUD de locais
/usuarios         - CRUD de usuarios
```

## Imagens

Pagina inicial:

![Pagina inicial](image/README/01-inicio.png)

Listagem publica:

![Listagem publica](image/README/02-explorar.png)

Dashboard administrativo:

![Dashboard administrativo](image/README/03-dashboard-admin.png)

Formulario com upload de imagem:

![Formulario com upload](image/README/04-formulario-upload.png)

## O Que Foi Testado e Funcionou

Testado localmente em 21/06/2026:

- `npm install` instalado sem vulnerabilidades reportadas.
- `npm run build` executado com sucesso.
- Servidor local Node abriu em `http://127.0.0.1:5173/`.
- Rotas diretas funcionaram com refresh:
  - `/login`
  - `/explorar`
  - `/objetos/1`
- Login de administrador funcionou.
- Tela de dashboard administrativo abriu.
- Formulario de objeto mostra apenas upload de imagem local.
- O backend aceitou upload de imagem e retornou URL em `/media/...`.
- A imagem enviada abriu com `200 image/png`.
- Telas de CRUD administrativo estao acessiveis para admin.
- Usuario comum nao acessa area administrativa.

Testado em producao na Vercel em 26/06/2026:

- Frontend publicado abre em `https://puc-encontra-frontend.vercel.app/`.
- Rotas diretas `/login`, `/explorar`, `/meus-registros` e `/objetos/1` retornaram `200`.
- `runtime-config.js` aponta para `https://puc-encontra-api.vercel.app/api`.
- CSS e JavaScript de producao carregaram corretamente.
- CORS da API aceitou a origem `https://puc-encontra-frontend.vercel.app`.
- Login com `admin` e `aluno1` funcionou via API publicada.
- Smoke test de CRUD em producao criou, editou, marcou como resolvido e apagou um objeto temporario.
- Smoke test administrativo em producao criou e removeu categoria/local temporarios.
- Upload de imagem em producao funcionou via API publicada, salvou no Cloudinary e retornou URL publica.
- A imagem enviada em producao abriu publicamente com `200 image/png`.

## O Que Nao Funcionou ou Esta Pendente

- Ainda nao ha testes automatizados do frontend; a validacao foi feita por build, navegador e chamadas reais ao backend.
- O fluxo de recuperacao de senha foi implementado, mas a entrega real do e-mail na caixa de entrada depende das variaveis SMTP corretas no backend publicado e de um remetente validado no provedor SMTP.

## Comandos de Validacao

```bash
npm run build
npm run serve
```

Com o backend rodando, acessar:

```text
https://puc-encontra-frontend.vercel.app/
```

## Observacoes Para Entrega

O frontend esta publicado na Vercel em [https://puc-encontra-frontend.vercel.app/](https://puc-encontra-frontend.vercel.app/) e consome a API publicada em [https://puc-encontra-api.vercel.app/](https://puc-encontra-api.vercel.app/).
