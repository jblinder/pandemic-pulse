const appRoot = require('app-root-path')
const spawn = require('child_process').spawn
const platform = require('./platform')
const path = require('path')
const osu = require('node-os-utils')
const os = require('os')


const rootPath = path.resolve(__dirname)
const RESOURCE_DIR = 'resources'
const PLATFORM = platform.get()
const STRESS = platform.stress()
const STRESS_EXEC_PATH = path.join(rootPath, RESOURCE_DIR, PLATFORM, STRESS)
// const STRESS_SCALER = 6

// Run cpu stress executable
const stress = (covid) => {
    return new Promise(function (resolve, reject) {
        let cpuExecutable;
        const infectionPercent = `${Math.min(Math.round(Math.max(covid.infectionsScaled, 0)), 100)}`
        if (PLATFORM == 'win')
            cpuExecutable = spawn('powershell.exe', ['WindowsStress.exe', infectionPercent, 'all']);
        else
            cpuExecutable = spawn(STRESS_EXEC_PATH, ['-c', '0', '-l', infectionPercent]);
        console.log(`[CPU STRESS]: ${Math.max(covid.infectionsScaled)}%`)
        cpuExecutable.stdout.on('data', data => {
            console.log(`stdout: ${data}`);
            resolve(data)
        });
        cpuExecutable.stderr.on('data', data => {
            console.log(`stderr: ${data}`);
            resolve(reject)
        });
    });
}

// Kill all stress executable instances
const kill = () => {
    return new Promise(function (resolve, reject) {
        let child;
        if (PLATFORM == 'win')
            child = spawn('powershell.exe', ['Taskkill', '/IM', 'WindowsStress.exe', '/F'])
        else
            child = spawn('killall', [`${platform.stress()}`])
        child.stdout.on('data', data => {
            console.log(`stdout: ${data}`)
            resolve(data)
        });
        child.stderr.on('data', data => {
            console.log(`stderr: ${data}`)
            resolve(reject)
        });
    });
}

const usage = () => {
    return new Promise(function (resolve, reject) {
        const cpu = osu.cpu
        // const count = cpu.count()
        const mem = osu.mem

        const memUsage = mem.info()
            .then(memInfo => {
                return { "memory": memInfo.freeMemPercentage }
            })
        const cpuUsage = cpu.usage()
            .then(cpuPercentage => {
                return { "cpu": cpuPercentage }
            })
        Promise.all([cpuUsage, memUsage]).then(stats => {
            resolve(Object.assign({}, ...stats))
        })
    })
}

exports.stress = stress
exports.kill = kill
exports.usage = usage

