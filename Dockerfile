FROM oven/bun:1 AS base

WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev

COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev 

RUN bun install duckdb-async
RUN bun install express
RUN bun install zod

COPY Employee.db /usr/src/app/
COPY *.ts /usr/src/app/

# gives sudo permission to access Employee.db
RUN chmod 666 Employee.db

USER bun
EXPOSE 3000/tcp
EXPOSE 3000/udp
ENTRYPOINT ["bun", "run", "/usr/src/app/server.ts"]