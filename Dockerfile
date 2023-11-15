FROM node:14

WORKDIR /halo2-wasm-server

COPY ./ .

RUN npm install

# 定义docker容器启动时运行的命令
CMD [ "node", "src/server.js" ]