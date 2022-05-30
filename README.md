## Description

This project is bootstrapped with Nest CLI.

## Installation

This application uses [NestJS Addons: In-Memory DB](https://www.npmjs.com/package/@nestjs-addons/in-memory-db) for the purpose of in memory storage. It has caused a dependency tree error so please use the following to command to install dependencies.

```bash
$ npm install --save --legacy-peer-deps
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Frontend Repo

The frontend repository is available at this [link](https://github.com/Utsavojha2/entain-test).

## Note

If you are starting the frontend on a different port other than 3000, please whitelist the port in cors origin config at src/main.js.

## License

Nest is [MIT licensed](LICENSE).
