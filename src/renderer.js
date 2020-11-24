const { remote, ipcRenderer, shell } = require('electron')
const UsaStates = require('usa-states').UsaStates
const usStates = new UsaStates({ includeTerritories: true })
let refreshID;
let cpuStats = (new Array(100).fill(0)).concat([100]);
// let memStats = (new Array(100).fill(0)).concat([100]);

ipcRenderer.send('app-loaded')

ipcRenderer.on('app-ready', (event, data) => {
    console.log(event, data)
    let infectionsAll = remote.getGlobal('sharedObj').covid.infectionsAll
    let infectionsAllDaily = remote.getGlobal('sharedObj').covid.infectionsAllDaily
    let infectionsFortnightly = remote.getGlobal('sharedObj').covid.infectionsFortnightly
    // TODO: Fix values
    let deathsFortnightly = remote.getGlobal('sharedObj').covid.deathsFortnightly
    const navOpts = {
        "type": 'line',
        "lineWidth": .5,
        "width": '50',
        "height": '10',
        "fillColor": false,
        "lineColor": '#f24333',
        "spotColor": false,
        "minSpotColor": false,
        "maxSpotColor": false,
        "highlightSpotColor": false,
        "highlightLineColor": false,
        "disableInteraction": true
    };
    const statusOpts = {
        "type": 'line',
        "lineWidth": .5,
        "width": '50',
        "height": '10',
        "fillColor": false,
        "lineColor": '#f1dede',
        "spotColor": false,
        "minSpotColor": false,
        "maxSpotColor": false,
        "highlightSpotColor": false,
        "highlightLineColor": false,
        "disableInteraction": true
    };
    const rateOpts = {
        ...navOpts,
        "width": "60",
        "height": "20",
        "fillColor": '#2b0d0a'
    }
    const brightnessOpts = {
        ...navOpts,
        "width": "20%",
        "height": "20",
        "fillColor": '#2b0d0a'
    }
    const usageOpts = {
        ...navOpts,
        "width": "100%",
        "height": "20",
        "lineWidth": 1,
    }

    init();

    function init() {
        console.log("init")
        ipcRenderer.send('version-check')
        const deathsText = (isNaN(remote.getGlobal('sharedObj').covid.deaths)) ? 'N/A' : `${remote.getGlobal('sharedObj').covid.deaths}%`
        const infectionsText = (isNaN(remote.getGlobal('sharedObj').covid.infections)) ? 'N/A' : `${remote.getGlobal('sharedObj').covid.infections}%`
        document.getElementById('infection-rate').innerText = infectionsText;
        document.getElementById('death-rate').innerText = deathsText;
        document.getElementById('brightness').innerText = `${100 - Math.round(remote.getGlobal('sharedObj').covid.deathsScaled)}%`
        document.getElementById('deaths-total').innerText = `${remote.getGlobal('sharedObj').covid.deathsAll.toLocaleString()}`
        document.getElementById('infections-total').innerText = `${remote.getGlobal('sharedObj').covid.infectionsAll.toLocaleString()}`
        document.getElementById('deaths-today').innerText = `${remote.getGlobal('sharedObj').covid.deathsToday.toLocaleString()}`
        document.getElementById('infections-today').innerText = `${remote.getGlobal('sharedObj').covid.infectionsToday.toLocaleString()}`
        // document.getElementById('current-location').innerText = `${remote.getGlobal('sharedObj').location.toUpperCase()}`;

        setInterval(function () {
            $('#sparkline').sparkline(infectionsAllDaily, statusOpts);
            infectionsAllDaily = infectionsAllDaily.slice(-1).concat(infectionsAllDaily.slice(0, -1));
        }, 50);

        $('#sparkline-brightness').sparkline([0, 0], { ...brightnessOpts, "width": `${100 - remote.getGlobal('sharedObj').covid.deaths}%`, "lineWidth": 20, "lineColor": "#b52e22" })
        $('#sparkline-infections').sparkline(infectionsFortnightly, rateOpts)
        ipcRenderer.on('location-completion', data => {
            infectionsFortnightly = remote.getGlobal('sharedObj').infectionsFortnightly
            $('#sparkline-infections').sparkline(infectionsFortnightly, rateOpts)
        });

        console.log(infectionsFortnightly, deathsFortnightly)
        $('#sparkline-deaths').sparkline(deathsFortnightly, rateOpts)
        ipcRenderer.on('location-completion', data => {
            deathsFortnightly = remote.getGlobal('sharedObj').deathsFortnightly
            $('#sparkline-deaths').sparkline(deathsFortnightly, rateOpts)
        });
        watchCPU()
    }

    document.querySelector('#exit-button').addEventListener('click', (e) => {
        ipcRenderer.send('exit-app')
    })
    document.querySelector('#about-button').addEventListener('click', (e) => {
        shell.openExternal('https://pandemicpulse.io')
    })
    document.querySelector('#update-button').addEventListener('click', (e) => {
        shell.openExternal('https://github.com/jblinder/pandemic-pulse/releases')
    })
    // Enable executable
    document.querySelector('#toggle-process').addEventListener('click', (e) => {
        const el = e.target
        const stop = "Stop"
        const start = "Start"
        let styles = {}
        styles[stop] = "btn-danger"
        styles[start] = "btn-primary"

        let run;
        if (el.innerText == start) {
            el.innerText = stop;
            el.classList.add(styles[stop])
            el.classList.remove(styles[start])
            document.getElementById('sparkline').classList.add('sparkline-show')
            // document.getElementById('cpu').style.display = 'block';
            run = true
        }
        else {
            el.innerText = start;
            el.classList.add(styles[start])
            el.classList.remove(styles[stop])
            document.getElementById('sparkline').classList.remove('sparkline-show')
            // document.getElementById('cpu').style.display = 'none';
            run = false
        }
        // run os stress executable
        ipcRenderer.send('execute-request', run);
        // watchCPU(run)
    });

    // Request CPU status loop
    function watchCPU(watch) {
        refreshID = setInterval(function () {
            // if (!watch)
            // clearInterval(refreshID)
            ipcRenderer.send('usage-request')
        }, 1000);
    }

    // Select state
    document.querySelector('#location-select').addEventListener('change', (e) => {
        const el = e.target
        const location = el.options[el.selectedIndex].value.toLowerCase()
        console.log("location changed to state: ", location)
        ipcRenderer.send('location-request', location)
        ipcRenderer.send('execute-request', false);
    });

    ipcRenderer.on('version-checked', (event, newVersion) => {
        console.log(document.getElementById('new-version'))
        if (newVersion) document.getElementById('new-version').style.display = 'block';
    });

    // Event listener for executable completion 
    ipcRenderer.on('execute-completion', (event, arg) => {
        // console.log('done', event, arg)
    });

    // Event listener for location change 
    ipcRenderer.on('location-completion', (event, data) => {
        const covid = data.covid
        console.log('location-completion', covid)
        if (!covid) {
            console("No covid data found for location");
            document.querySelector('#infection-rate').innerText = `N/A`
            document.querySelector('#death-rate').innerText = `N/A`
            document.getElementById('brightness').innerText = `100`
            $('#sparkline-brightness').sparkline([0, 0], { ...brightnessOpts, "width": `${100 - remote.getGlobal('sharedObj').covid.deaths}%`, "lineWidth": 20, "lineColor": "#b52e22" })
            $('#sparkline-infections').sparkline(infectionsFortnightly, rateOpts)
            $('#sparkline-deaths').sparkline(deathsFortnightly, rateOpts)
            return;
        }

        const state = usStates.states.filter(s => {
            return s.abbreviation === data.location.toUpperCase()
        })[0]
        infectionsAll = covid.infectionsAll
        infectionsFortnightly = covid.infectionsFortnightly
        deathsFortnightly = covid.deathsFortnightly
        // document.querySelector('#current-location').innerText = state.name.toUpperCase() || "United States"
        const deathsText = (isNaN(covid.deaths)) ? 'N/A' : `${covid.deaths}%`
        const infectionsText = (isNaN(covid.infections)) ? 'N/A' : `${covid.infections}%`
        document.getElementById('infection-rate').innerText = infectionsText;
        document.getElementById('death-rate').innerText = deathsText;
        document.getElementById('brightness').innerText = `${100 - Math.round(covid.deathsScaled)}%`
        document.getElementById('deaths-total').innerText = `${covid.deathsAll.toLocaleString()}`
        document.getElementById('infections-total').innerText = `${covid.infectionsAll.toLocaleString()}`
        document.getElementById('deaths-today').innerText = `${covid.deathsToday.toLocaleString()}`
        document.getElementById('infections-today').innerText = `${covid.infectionsToday.toLocaleString()}`
        $('#sparkline-brightness').sparkline([0, 0], { ...brightnessOpts, "width": `${100 - remote.getGlobal('sharedObj').covid.deaths}%`, "lineWidth": 20, "lineColor": "#b52e22" })
        $('#sparkline-infections').sparkline(infectionsFortnightly, rateOpts)
        $('#sparkline-deaths').sparkline(deathsFortnightly, rateOpts)
    });

    // Event listener for cpu status
    ipcRenderer.on('usage-completion', (event, stats) => {
        cpu = Math.round(stats.cpu)
        cpuStats.push(cpu)
        cpuStats.shift()
        // cpuStats = cpuStats.slice(-1).concat(cpuStats.slice(0, -1));
        document.getElementById('cpu-usage').innerText = `${cpu}%`
        $('#sparkline-cpu').sparkline(cpuStats, usageOpts)
    });
});

