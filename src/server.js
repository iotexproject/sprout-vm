const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const wasm = require("./wasm_instance")
const PROTO_PATH = './proto/vm_runtime.proto'

// TODO add map to store wasm instance(instanceId: wasmInstance/bytes)
// need to update wasm_instance.js? add getWasmInstance 

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const vmRuntime = grpc.loadPackageDefinition(packageDefinition).vm_runtime;

const bytesMap = new Map();

function create(call, callback) {
    const project = call.request.project;
    // const bytes = call.request.content;
    const path = require('path').join(__dirname, '../wasm/halo2_evm_verifier_bg.wasm');
    const bytes = require('fs').readFileSync(path);

    bytesMap.set(project, bytes);

    callback(null, { instanceId: 'Hello ' + project });
}

function executeOperator(call, callback) {
    const project = call.request.project;
    const param = call.request.param;
    
    const bytes = bytesMap.get(project);

    wasm.setWasmBytes(bytes);
    wasm.initWasmInstance();

    const result = wasm.prove(param);
    console.log(result);
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