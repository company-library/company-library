# Company-Library

## Deploy your own

Deploy the example using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcompany-library%2Fcompany-library)

## Run local

### Run local DB

```bash
docker-compose --env-file .env.local up -d  
```

### Migrate DB

```bash
yarn db:generate
yarn db:push
```

### Run on local

```bash
yarn dev
```
