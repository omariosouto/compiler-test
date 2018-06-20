require('dotenv').config()
require('./mocks')
const Express = require('express')
const { spawn } = require( 'child_process' )
const terminate = require('terminate')
const PubSub = require('pubsub-js')
const app = new Express()

const compilerLanguages = require('./compilerLanguages')
const dockerContainerKiller = require('./src/dockerContainerKiller')


app.get('/', (req,res) => {
    let counter = global.counter++
    console.log(counter, 'Request');
    const { language, code } = global.payload
    
    // 0 - Gerar ID
    const containerId = Math.floor(Math.random() * 1000)
    

    // 1 - Iniciando o container
    console.log(`${counter} - Rodando o container ${containerId}`)
    const processCompiler = spawn( 'docker', compilerLanguages.get(language)(code, containerId), {
        detached: true
    })
    // 1.1 - Código para matar o processo atual
    let processCompilerFinishing = false
    PubSub.subscribe('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', (channel, msg) => {
        // console.log(`[SHOULD KILL EVERY THING! -[[${msg}]]- ]`)
        if(!processCompilerFinishing) {
            processCompilerStatus = msg
            processCompilerFinishing = true
            terminate(processCompiler.pid, function (err) {
                if (!err) {
                    dockerContainerKiller(containerId, language)
                } else {
                    console.log(`[processCompiler:${containerId}] Processo já morto x.x`)
                }
            })
        }
    })

    // 2 - Gerenciando Outputs e erros do processo que subiu o container
    let processCompilerOutput = '', processCompilerError = '', processCompilerStatus = ''
    let processCompilerOutputCounter = 0
    processCompiler.stdout.on('data', (data) => { 
        processCompilerOutputCounter++

        if(processCompilerOutputCounter === 1) {
            // console.log(`Container Subiu! Iniciar o Contador do Timeout`)
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_START_TIMEOUT')
        } else if(processCompilerOutput.toString().length > 500) {
            // console.log(`Matar o container`)
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', 'OutPut Too Long')
        } else {
            // console.log('Incrementa output')
            processCompilerOutput += data
        }
    });    
    processCompiler.stderr.on('data', (data) => { 
        processCompilerError += data
    }); 

    // 3 - Iniciando TimeOut para o Container
    const containerExecTimeLimit = 10 * 1000
    let containerTimeOut 
    PubSub.subscribe('PROCESSCOMPILER_AND_DOCKERCONTAINER_START_TIMEOUT', () => {
        cotainerTimeOut = setTimeout(() => {
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', 'Time Out')
        }, containerExecTimeLimit)    
    })
    
    // 4 - Saida do processo que subiu o container
    processCompiler.on('exit', function(){
        clearTimeout(containerTimeOut); 
        // console.log(`[processCompiler:${containerId}] Processo que iniciou o container ${containerId} foi morto!`);
        // console.log(`[processCompiler:${containerId}] processCompilerOutput:`, processCompilerOutput)
        // console.log(`[processCompiler:${containerId}] processCompilerError:`, processCompilerError)
        res.json({
            processCompilerOutput,
            processCompilerError,
            processCompilerStatus
        })
    });

})

module.exports = app

