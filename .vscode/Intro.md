# How to debug a Wails application (golang)

In the following you will find all the configs and script to fully debug your wails application (Both the frontend and the backend) in vs code while also having live reload.

## What you need

- install [delve](https://github.com/go-delve/delve) if you haven't already
- python3.x

## How it works

- We first execute the `wails dev` command to start build the app in development mode with a watcher (for the live reload)
- using `problemMatcher` we get the state of the `wails dev` command to know when the watcher started
- as we now know that the process started, we execute the python script to get the pid of our application and we attach delve to it by starting a local server
- we again use `problemMatcher` to get the state of the delve to notify the vs code that it can continue and it will then attach the vs code debugger  to delve

## And done, happy debugging!

# IMPORTANT

Change the variables `${YOUR_PROCESS_NAME}` and `${PORT}` in both `debug.py` and `tasks.json`
