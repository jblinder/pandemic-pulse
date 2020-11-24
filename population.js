const csvToJSON = require('csvtojson')
const path = require('path')
const rootPath = path.resolve(__dirname)
const dataPath = path.join(rootPath, 'resources', 'uscensus-2019-pops.csv')
let pops

csvToJSON().fromFile(dataPath)
    .then(users => {
        pops = users
    })
    .catch(err => {
        console.log("popluation load failed", err)
    })

exports.state = (code) => {
    return pops.filter(p => p.code == code.toUpperCase())[0].popluation
}