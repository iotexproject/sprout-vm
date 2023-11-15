const fs = require('fs');
const zlib = require('zlib');

const wasm = require("./wasm_instance")

const bytesMap = new Map();

const main = () => {
    try {
        // const path = require('path').join(__dirname, '../wasm/halo2_evm_verifier_bg.wasm');
        // const _bytes = require('fs').readFileSync(path);
        // const compressed = zlib.deflateSync(_bytes);
        // fs.writeFile('example_zip.txt', compressed.toString('hex'), (err) => {
        //     if (err) throw err;
        //     console.log('file saved');
        // });
        // fs.writeFile('example_bytes.txt', JSON.stringify(_bytes), (err) => {
        //     if (err) throw err;
        //     console.log('file saved');
        // });
        // console.log(_bytes.toString('utf8'));
        // console.log(_bytes.toString('hex'));
        // fs.writeFile('example.txt', _bytes.toString('hex'), (err) => {
        //     if (err) throw err;
        //     console.log('file saved');
        // });


        // // hexString to bytes
        // const path = require('path').join(__dirname, '../example.txt');
        // const _bytes = require('fs').readFileSync(path);
        // const hexString = _bytes.toString('utf8');
        // let byteArray = Buffer.from(hexString, 'hex');

        const path = require('path').join(__dirname, '../example_zip.txt');
        const _bytes = require('fs').readFileSync(path);
        const hexString = _bytes.toString('utf8');
        console.log(hexString);
        let buffer = Buffer.from(hexString, 'hex');
        let decompressed = zlib.inflateSync(buffer);

        bytesMap.set('halo2_evm_verifier_bg', decompressed);
        const bytes =  bytesMap.get('halo2_evm_verifier_bg');
        wasm.setWasmBytes(bytes)
        wasm.initWasmInstance()
        const result = wasm.prove('{"private_a": 3, "private_b": 4}')
        console.log(result)
    } catch (error) {
        console.error("catch error: ", error.message);
    }
}

main()