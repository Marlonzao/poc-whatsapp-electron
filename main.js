// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('node:path')

const wa_version = require('@wppconnect/wa-version');
const semver = require("semver");
const fs = require('fs');

function getPagePath(versionMatch, includePrerelease = true) {
	if (!versionMatch) {
		versionMatch = wa_version.getLatestVersion();
	}

	const versions = wa_version.getAvailableVersions();

	const max = semver.maxSatisfying(versions, versionMatch, {
		includePrerelease,
	});

	if (!max) {
		throw new Error(`Version not available for ${versionMatch}`);
	}

	return path.join(wa_version.constants.HTML_DIR, max + '.html');
}


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.webContents.loadURL(`https://web.whatsapp.com`, {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3'
	})

  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
		if(details.url.startsWith('https://web.whatsapp.com/check-update')){
			callback({ cancel: true });
			return;
		}

		if(details.url.startsWith('https://web.whatsapp.com/')){
			console.log("teste");
			let path = getPagePath();
			console.log(path);
			callback({ webContents: fs.readFileSync(path, 'utf8') });
			return;
		}

		callback({});
	});

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
