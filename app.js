require('dotenv').config()

const Express = require('express')
const { spawn, spawnSync } = require( 'child_process' )
const compilerLanguages = require('./compilerLanguages')
const terminate = require('terminate')
const app = new Express()


global.payload = {
    code: `
    public class Teste {
        public static void main(String[] args) {
            System.out.println("Hello PANCO!!!");
            new Teste3().teste();
        } 
    }
    
    class Teste3 {
        public void teste() {
            System.out.println("Hello fodac do teste3!");
        } 
    }`,
    language: 'java'
}

global.payload2 = {
    code: `
        const msg = 'alo alo w brazil'
        console.log('JS FTW');
        console.log(msg);
        while(true) {
            console.log('hi')
        }
    `,
    language: 'javascript'
}


    

    // const command = spawn( 'docker', compilerLanguages.get(language)(code) )
    
    // command.stdout.on('data', (data) => {
    //     spawnSync('docker', 'rm --force node1'.split(' '))
    //     console.log('output', data)
    // });
    
    // command.stderr.on('data', (data) => {
        //     console.log('error', data)
    // });

global.counter = 0

app.get('/', (req,res) => {
    let counter = global.counter++
    console.log(counter, 'Request');
    const { language, code } = global.payload2

    const containerId = Math.floor(Math.random() * 1000)


    console.log(`${counter} - Rodando o container ${containerId}`)
    const child = spawn( 'docker', compilerLanguages.get(language)(code, containerId), {
        detached: true
    })

    // Pegando o Output e os Erros
    let resOutput = 'output'
    let resError = 'error'
    // Limitar a 10: child.stdout.on('data', (data) => resOutput += data);    
    // Limitar a 10: child.stderr.on('data', (data) => resError += data);
    
    // Tempo limite de execução
    const limitTime = 5 * 1000
    const to = setTimeout(function(){
        console.log(`${counter} - Ordenando matar o processo`);
        terminate(child.pid, function (err) {
            if (!err) {
                console.log('done'); // terminating the Processes succeeded.
                spawn('docker', `rm --force node${containerId}`.split(' '))
                    .on('exit', () => console.log(`container morto: ${containerId}`))

            }
          });
          
    }, limitTime);  
    
    child.on('exit', function(){
        clearTimeout(to); // if finish okay, don't kill docker container, because it's finished okay
        console.log(`${counter} - Processo morto!`);
        res.json({
            resOutput,
            resError
        })
    });

})

module.exports = app