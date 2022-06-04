## Run on local

```bash
yarn dev
```

## Migrate DB and Hasura

```bash
cd hasura
npx hasura metadata apply
npx hasura migrate apply
npx hasura metadata reload
```
