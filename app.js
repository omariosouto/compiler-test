require('dotenv').config()
const Restify = require('restify')
require('./mocks')

const { spawn } = require( 'child_process' )
const terminate = require('terminate')
const PubSub = require('pubsub-js')

const app = Restify.createServer()
app.use(Restify.plugins.bodyParser({mapParams: true}))

const compilerLanguages = require('./compilerLanguages')
const dockerContainerKiller = require('./src/dockerContainerKiller')


app.post('/', (req,res) => {
    let counter = global.counter++
    console.log(counter, 'Request');
    
    const language = global.payload2.language
    const code = global.payload2.code
  
    const containerId = Math.floor(Math.random() * 1000)
    

    console.log(`${counter} - Rodando o container ${containerId}`)
    const processCompiler = spawn( 'docker', compilerLanguages.get(language)(code, containerId), {
        detached: true
    })
    
    let processCompilerFinishing = false
    PubSub.subscribe('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', (channel, msg) => {
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

    let processCompilerOutput = '', processCompilerError = '', processCompilerStatus = ''
    let firstOutput = true
    processCompiler.stdout.on('data', (data) => { 
        if(firstOutput) {
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_START_TIMEOUT')
            firstOutput = false;
        } else if(processCompilerOutput.toString().length > 500) {
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', 'OutPut Too Long')
        } else {
            processCompilerOutput += data.toString()
        }

        
    });    
    processCompiler.stderr.on('data', (data) => { 
        processCompilerError += data
    }); 

    const containerExecTimeLimit = 10 * 1000
    let containerTimeOut 
    PubSub.subscribe('PROCESSCOMPILER_AND_DOCKERCONTAINER_START_TIMEOUT', () => {
        cotainerTimeOut = setTimeout(() => {
            PubSub.publish('PROCESSCOMPILER_AND_DOCKERCONTAINER_KILLER', 'Time Out')
        }, containerExecTimeLimit)    
    })
    

    processCompiler.on('exit', function(){
        clearTimeout(containerTimeOut); 

        res.send({
            processCompilerOutput,
            processCompilerError,
            processCompilerStatus
        })
    });

})

module.exports = app

