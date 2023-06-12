const ora = require("ora");


function sleep(n){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve()
        },n)
    })
}

async function loading(message,fn,...args){
    // 1. 用ora去显示点点点
    const spiner = ora(message)
    spiner.start()
    try {
        const executeRes = await(fn(...args))
        spiner.succeed()
        return executeRes
    } catch (error) {
        console.log(error)
        spiner.fail("request fail, reTrying");
        await sleep(1000)
        return loading(message, fn, ...args);
    }
}

module.exports = {
    loading
}
