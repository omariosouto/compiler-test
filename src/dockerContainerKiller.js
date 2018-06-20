const { spawn } = require( 'child_process' )

module.exports = (containerId, language) => {

    const processDockerContainerKill = spawn('docker', `rm --force ${language}${containerId}`.split(' '))

    processDockerContainerKill.stderr.on('data', (data) => {
        console.log(`[processDockerContainerKill:${containerId}] Falhou :(`, data.toString())
    })
}