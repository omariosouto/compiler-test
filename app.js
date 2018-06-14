require('dotenv').config()


const Restify = require('restify')
const { spawnSync } = require( 'child_process' )
const compilerLanguages = require('./compilerLanguages')

const app = Restify.createServer()
app.use(Restify.plugins.bodyParser({mapParams: true}))

app.post('/', (req,res) => {
    //const { language, code } = global.payload2

    const language = req.body.language
    const code = req.body.code
    
    const command = spawnSync( 'docker', compilerLanguages.get(language)(code) )
    
    res.send({
        output: command.stdout.toString(),
        error: command.stderr.toString()
    })   

})

module.exports = app