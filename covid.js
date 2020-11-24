/*
COVID-19 Datasource
*/
const fetch = require("node-fetch");
const population = require('./population');
const SCALER_DEATH = 50 
const SCALER_INFECTIONS = 100

const getAll = (location) => {
    return new Promise(function (resolve, reject) {
        get(location).then(data => {
            const today = data[0].deathIncrease
            const last = data[14].deathIncrease
            const daily = data.map(d => d.deathIncrease)
            const change = Math.round((today - last) / today * 100.0);
            resolve(Math.round(Math.max(0, change)))
        })
            .catch(err => {
                reject(err)
            })
    })
}

const getRate = (location) => {
    return new Promise(function (resolve, reject) {
        get(location).then(data => {
            if (!data)
                reject(location, data)
            const deaths = calculateDeaths(location, data)
            const infections = calculateInfections(location, data)
            const covid = Object.assign({}, deaths, infections);
            resolve(covid)
        })
            .catch(err => {
                reject(err)
            })
    })
}

const calculateDeaths = (location, data) => {
    const deathsTwoWeeks = data.slice(0, 13)
        .map(d => d.deathIncrease)
        .reduce((sum, deaths) => sum + deaths)
    const positiveTwoWeeks = data.slice(0, 13)
        .map(d => d.positiveIncrease)
        .reduce((sum, deaths) => sum + deaths)
    const deathRate = ((deathsTwoWeeks / positiveTwoWeeks) * 100).toFixed(2)
    const deathRateScaled = (deathRate * SCALER_DEATH).toFixed(2)
    const all = data[0].death
    const today = data[0].deathIncrease
    const deathsFortnightly = data.slice(0, 13).map(d => d.deathIncrease)
    console.log(`death rate ${deathRate}`)
    console.log(`deaths fortnightly ${data.slice(0, 13).map(d => d.deathIncrease)}`)
    return {
        "deaths": deathRate,
        "deathsToday": today,
        "deathsScaled": deathRateScaled,
        "deathsFortnightly": deathsFortnightly,
        "deathsAll": all
    }
}

const calculateInfections = (location, data) => {
    const infectionTwoWeeks = data.slice(0, 13)
        .map(d => d.positiveIncrease)
        .reduce((sum, deaths) => sum + deaths)
    const infectionRate = ((infectionTwoWeeks / population.state(location)) * 100).toFixed(2)
    const infectionRateScaled = (infectionRate * SCALER_INFECTIONS).toFixed(2)
    const all = data[0].positive
    const today = data[0].positiveIncrease
    const infectionsFortnightly = data.slice(0, 13).map(d => d.positiveIncrease)
    const infectionsAllDaily = data.map(d => d.positiveIncrease)
    console.log(`infection rate ${infectionRate}`)
    console.log(`infections fortnightly ${data.slice(0, 13).map(d => d.positiveIncrease)}`)
    return {
        "infections": infectionRate,
        "infectionsToday": today,
        "infectionsScaled": infectionRateScaled,
        "infectionsFortnightly": infectionsFortnightly,
        "infectionsAll": all,
        "infectionsAllDaily": infectionsAllDaily,
    }
}


const get = (location) => {
    return new Promise(function (resolve, reject) {
        let url;
        if (location == 'us' || !location)
            url = `https://covidtracking.com/api/v1/us/daily.json`
        else
            url = `https://covidtracking.com/api/v1/states/${location}/daily.json`
        fetch(url)
            .then(response => response.json())
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    });
}

exports.get = get
exports.getRate = getRate