# Pandemic Pulse

**Pandemic Pulse** infects your computer's resources at the rate of COVID-19 infections and deaths in your location. It exhausts your CPU power at the rate of local infections and lowers your screen’s brightness at the rate of local COVID-19- related deaths. 

## Table of Contents

- [Background](#background)
- [Usage](#usage)
- [Acknowledgments](#acknowledgments)
- [Disclaimer](#disclaimer)

## Background

Since the World Health Organization declared COVID-19 an international health emergency on January 30, 2020, the virus has dominated the news. The pandemic has profoundly shaped our “new normal”-- forcing us to socially distance and wear masks to stay safe, shutting down workplaces and institutions, pausing most travel, etc. News reports frame the virus’ effects chiefly in terms of either epidemiological rates (of morbidity and mortality) or lost capital: store closures and profits lost, jobs lost. Simultaneously, especially outside of COVID-19 “hot spots” like New York City in April (when ambulance sirens blared every few minutes, neighbors left and did not come back, and trailer trucks were filled with corpses on hospital parking lots), the virus has somehow remained abstract, invisible, and intangible to so many-- so that large swaths of Americans, following our current President, claim that it is nothing more than a “typical flu,” a conspiracy, and/ or alien and “Chinese.” 

National figures for COVID-19 infections and deaths are so large that they strike many of us as simultaneously overwhelming and meaningless or incomprehensible. Meanwhile, lockdowns have made our everyday lives devoid of in-person interactions (handshakes, hugs, physical touch), and have instead rendered our computers and phones as the primary or even sole means through which we experience, understand, or engage with the larger, “outside” world during this global pandemic. 

## How does it work?

**Pandemic Pulse** does not alter any persistent data on your hard drive, nor does it permanently change anything on your computer. It is malware in that strains your computer’s resources. Once you start the application, Pandemic Pulse runs background processes that stress your CPU (via [common diagnostic tools](https://github.com/jblinder/pandemic-pulse#acknowledgments)) and adjusts your screen’s brightness (by applying an overlay on top of your desktop), based on COVID-19 statistics in your selected region. When you stop or close the application, these processes end completely and your CPU and display return to their original states. The code does not do anything to intentionally damage your computer, however as with any software, please use at your own risk.

## Usage

Installation and development requires:
- [electron](https://www.electronjs.org/)
- [electron-packager](https://github.com/electron/electron-packager) 

To run locally:

```sh
$ npm run start
```

To build binaries:

```sh
# macOS
$ npm run build-mac
# Windows
$ npm run build-win
# Linux
$ npm run build-linux
```

## Acknowledgments

The project makes use of the following tools for CPU stressing:
- [stress-ng](https://manpages.ubuntu.com/manpages/artful/man1/stress-ng.1.html) (macOS, Linux)
- [WindowsStress.exe](https://github.com/RichardKav/Stress-for-Windows) (Windows)

The COVID-19 data is being accessed from:
- [https://covidtracking.com/](https://covidtracking.com/) 

## Disclaimer

Pandemic Pulse does not alter any persistant data on your hard drive. However, as with any software, use at your own risk.