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

## Verificar e compilar

```powershell
npm.cmd test
npm.cmd run build
```

O diretório publicado é `dist`. Variáveis `VITE_*` são públicas e entram na build; não coloque segredos nelas. O login Google consulta o Client ID público pelo backend.
