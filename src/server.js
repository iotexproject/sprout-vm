const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const zlib = require('zlib');
const { v4: uuidv4 } = require('uuid');

const wasm = require("./wasm_instance")

const PROTO_PATH = './proto/vm_runtime.proto'

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const vmRuntime = grpc.loadPackageDefinition(packageDefinition).vm_runtime;

const contentMap = new Map();

function create(call, callback) {
    const project = call.request.project;
    const content = call.request.content;

    contentMap.set(project, content);

    callback(null, { instanceId: uuidv4() });
}

function executeOperator(call, callback) {
    const project = call.request.project;
    const param = call.request.param;
    
    const content = contentMap.get(project);
    const buffer = Buffer.from(content, 'hex');
    let bytes = zlib.inflateSync(buffer);

    wasm.setWasmBytes(bytes);
    wasm.initWasmInstance();

    const result = wasm.prove(param);
    // convert result to bytes
    let resultBytes = new Uint8Array(result.length);
    for (var i = 0; i < result.length; i++) {
        resultBytes[i] = result.charCodeAt(i);
    }

    callback(null, { result: resultBytes });
}

function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(vmRuntime.VmRuntime.service, {
        create: create,
        executeOperator: executeOperator,
    });
    server.bindAsync('0.0.0.0:4001', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('Server running at http://0.0.0.0:4001');
    });
}

startGrpcServer()