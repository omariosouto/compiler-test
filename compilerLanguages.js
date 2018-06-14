const languages = new Map()

languages.set('javascript', function(code, containerId) {     
    const javascriptDockerCommand = `run --name javascript${containerId} -i --rm node node -p`.split(' ')
    javascriptDockerCommand.push(code)
    return javascriptDockerCommand
})

languages.set('java', function(code, containerId) {
    const matches = payload.code.match(/[public]{6}\s(\w+\s)?[class]{5}\s(\w+)/)

    const classNameWithMainMethod = matches[2]

    const javaDockerCommand = `run --name java${containerId} -i --rm -w /app openjdk:9-jdk sh -c`.split(' ')
    javaDockerCommand.push(`echo ${JSON.stringify(code)} > ${classNameWithMainMethod}.java && javac ${classNameWithMainMethod}.java && java ${classNameWithMainMethod}`)
    
    return javaDockerCommand
})

module.exports = languages