# FROM oven/bun:1 AS base
FROM oven/bun:1-debian AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev

COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules

RUN apt update && apt install -y bash

# COPY Employee.db .
COPY *.ts .

# gives sudo permission to access Employee.db
# RUN chmod 666 Employee.db

USER bun
EXPOSE 3000/tcp
EXPOSE 3000/udp
ENTRYPOINT ["bun", "run", "server.ts"]