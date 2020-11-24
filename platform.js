/*
Environoment 
*/
const get = () => {
  switch (process.platform) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
    case 'win64':
      return 'win';
    default:
      return 'win';
  }
};

const stress = () => {
  const platform = get()
  switch (platform) {
    case 'linux':
    case 'mac':
      return 'stress-ng';
    case 'win32':
    case 'win64':
      return 'WindowsStress.exe';
    default:
      return 'WindowsStress.exe';
  }
}

exports.get = get;
exports.stress = stress;
