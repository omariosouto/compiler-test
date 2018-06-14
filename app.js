require('dotenv').config()

const Express = require('express')
const { spawnSync } = require( 'child_process' )
const compilerLanguages = require('./compilerLanguages')
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
    `,
    language: 'javascript'
}

app.get('/', (req,res) => {
    const { language, code } = global.payload2
    const command = spawnSync( 'docker', compilerLanguages.get(language)(code) )
    
    res.json({
        output: command.stdout.toString(),
        error: command.stderr.toString()
    })   

})

module.exports = app