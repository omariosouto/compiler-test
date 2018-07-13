const hardwareConfig = require('./hardwareConfig')

const languages = new Map()

languages.set('javascript', function(code, containerId) {   
    const javascriptDockerCommand = `run --name javascript${containerId} -i ${hardwareConfig} --rm node sh -c`.split(' ')
    javascriptDockerCommand.push(`echo 'running' && echo ${JSON.stringify(code)} > app.js && node app`) 
    return javascriptDockerCommand
})

languages.set('java', function(code, containerId) {
    const matches = payload.code.match(/[public]{6}\s(\w+\s)?[class]{5}\s(\w+)/)
    const classNameWithMainMethod = matches[2]

    const javaDockerCommand = `run --name java${containerId} -i ${hardwareConfig} --rm -w /app openjdk:9-jdk sh -c`.split(' ')
    javaDockerCommand.push(`echo 'running' && echo ${JSON.stringify(code)} > ${classNameWithMainMethod}.java && javac ${classNameWithMainMethod}.java && java ${classNameWithMainMethod}`)
    
    return javaDockerCommand
})

module.exports = languages