# LocalizaAI

Site responsivo para consulta de horários de vans e ônibus, com filtros por origem, destino e tipo de transporte. Inclui painel administrativo em `/admin.html` e usa o Supabase existente para dados e autenticação.

## Publicação no Netlify

1. Extraia este ZIP no celular ou use o fluxo de deploy manual do Netlify que aceite o ZIP.
2. A pasta publicada deve conter diretamente `index.html`, `admin.html`, `app.js`, `admin.js`, `config.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, `assets/` e `supabase/`.
3. O projeto é estático: comando de build vazio; diretório de publicação `.`.
4. Depois de publicar, abra o endereço público e `/admin.html`.

## Supabase

A URL e a chave pública (publishable) do projeto já estão em `config.js`. A chave publishable pode ser usada no navegador; nunca coloque uma chave `service_role` ou segredo no frontend.

As tabelas `transport_lines`, `departures` e `site_admins` já foram preparadas no projeto Supabase. Antes de usar o painel:

1. No Supabase, abra **Authentication → Users** e crie um usuário com e-mail e senha.
2. Copie o UUID desse usuário.
3. No **SQL Editor**, autorize esse usuário com o comando abaixo, substituindo o texto pelo UUID real:

   ```sql
   insert into public.site_admins (user_id)
   values ('UUID-REAL-DO-USUARIO');
   ```

4. Entre em `/admin.html` com esse e-mail e senha.
5. Cadastre uma rota/saída de teste e confirme que ela aparece no site público; depois desative ou remova o teste, se necessário.

## Antes de divulgar

- Testar consulta pública em janela anônima.
- Testar login, cadastro, edição e ativação/desativação de horário no painel.
- Cadastrar apenas horários confirmados por motoristas/operadores ou fonte confiável. O banco pode estar vazio até que os horários sejam cadastrados.
- Não divulgar o site como plenamente operacional até concluir esses testes.

## Arquivos principais

- `index.html`: consulta pública.
- `admin.html`: painel administrativo.
- `app.js` e `admin.js`: lógica de consulta e gestão.
- `config.js`: configuração pública do Supabase.
- `supabase/schema.sql`: lembrete de autorização administrativa; não é uma migração para executar.
- `netlify.toml`: configuração de publicação estática.
