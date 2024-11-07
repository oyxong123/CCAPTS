# This script will find the process id and start delve for debugging
# ${YOUR_PROCESS_NAME} = your app name, no need for the extention like .exe
# ${PORT} = the listening port for the delve server, we need this to attach the vs code debugger

import psutil
import subprocess

process = filter(lambda p: "CCAPTS" in p.name(), psutil.process_iter())
for i in process:
    cmd = ['dlv', '--listen=:2345', '--headless=true', '--api-version=2', '--check-go-version=false', '--only-same-user=false', 'attach', str(i.pid)]
    subprocess.run(cmd)