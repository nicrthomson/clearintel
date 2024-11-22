const { exec } = require('child_process');
const os = require('os');

const PORT = 3000;

function killPort() {
  const platform = os.platform();
  const command = platform === 'win32'
    ? `netstat -ano | findstr :${PORT} | findstr LISTENING && FOR /F "tokens=5" %a in ('netstat -ano | findstr :${PORT} | findstr LISTENING') do taskkill /F /PID %a`
    : `lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Ignore errors as they likely mean no process was found
      console.log('No process found on port 3000');
      return;
    }
    if (stdout) {
      console.log('Killed process on port 3000');
    }
  });
}

killPort();
