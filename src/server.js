const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
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

function create(call, callback) {

    callback(null, { instanceId: 'Hello ' + call.request.project });
}

function executeOperator(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
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