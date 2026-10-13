# HubStudio — frontend

Interface React/Vite do HubStudio.

O [guia de entrega ao cliente](https://github.com/GuilhermeSzFernandes/HubStudio/blob/main/docs/ENTREGA-CLIENTE.md) no repositório backend reúne todas as credenciais, criação dos serviços, execução local, callbacks, publicação e homologação.

## Rodar localmente

```powershell
Copy-Item .env.example .env.local
npm.cmd ci
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

Preencha `VITE_API_URL` em `.env.local` com a URL do backend, sem barra final. Para desenvolvimento: `http://localhost:8080`.

Para login Google, configure `VITE_GOOGLE_CLIENT_ID` no backend. Você pode usar a mesma variável em `.env.local` do frontend, com o mesmo Client ID OAuth Web (`…apps.googleusercontent.com`). Se ficar vazia no frontend, ele obtém o ID pelo backend. Valores diferentes entre os dois impedem o login Google. Reinicie os servidores após configurar; em produção, refaça a build do frontend se alterar a variável nele.

## Verificar e compilar

```powershell
npm.cmd test
npm.cmd run build
```

O diretório publicado é `dist`. Variáveis `VITE_*` são públicas e entram na build; não coloque segredos nelas. O Client ID Google é público; Client Secret não deve ser colocado no frontend.
