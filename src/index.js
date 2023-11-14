const wasm = require("./wasm_instance")

const main = () => {
    try {
        const path = require('path').join(__dirname, '../wasm/halo2_evm_verifier_bg.wasm');
        const bytes = require('fs').readFileSync(path);
        wasm.setWasmBytes(bytes)
        wasm.initWasmInstance()
        const result = wasm.prove('{"private_a": 3, "private_b": 4}')
        console.log(result)
    } catch (error) {
        console.error("捕获到异常: ", error.message);
    }
}

main()