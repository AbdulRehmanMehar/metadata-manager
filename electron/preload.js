'use strict'
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const prompt = require('electron-prompt');
const { exec } = require('child_process');
const osascript = require('node-osascript');
const { contextBridge, ipcRenderer, shell, dialog } = require('electron');
const {json} = require("sequelize");
const isPackaged = require('electron-is-packaged').isPackaged;
let osxGrabBrowserUrls = path.resolve("./resources/osx/grabBrowserUrls.sh");
let osxGrabRunningProcesses = path.resolve("./resources/osx/grabCurrentlyActiveProcesses.scpt");
if (isPackaged) {
    osxGrabBrowserUrls = path.join(__dirname, '..', '..', 'resources', 'osx', 'grabBrowserUrls.sh')
    osxGrabRunningProcesses = path.join(__dirname, '..', '..', 'resources', 'osx', 'grabCurrentlyActiveProcesses.scpt')
}


const DarwinExecutors = {
  getBrowserData: (browser) => {
       let  supported_browsers = ["Google Chrome"];
       if (supported_browsers.includes(browser)) {
           return new Promise((resolve, reject) => {
              exec(`bash ${osxGrabBrowserUrls} "${browser}"`,
               (error, stdout, stderr) => {
                    resolve(stdout);
                   if (error !== null) {
                       reject(error);
                   }
               });
           });
       }
       return Promise.reject("Application Not Supported");
   },
    getRunningProcesses: () => {
        return new Promise((resolve, reject) => {
            osascript.executeFile(osxGrabRunningProcesses, function (err, data, raw) {
                if (err) reject(err);
                resolve(data);
            });
        });
    },
}

const DatabaseExecutors = {
    loadModels() {
        const { Sequelize } = require('sequelize');
        let s = new Sequelize({
            dialect: 'sqlite',
            storage: !isPackaged ? path.resolve("./resources/db0.sqlite"): path.join(__dirname, '..', '..', 'resources', 'db.sqlite')
        });

        const m = require('./models');
        return {
            sequelize: s,
            ...m(s)
        };
    }
};


contextBridge.exposeInMainWorld("darwin_scripts", {
  getChromeData: () => {
        return new Promise((resolve, reject) => {
            DarwinExecutors.getRunningProcesses().then(async processes => {
                let metadata = []
                if (processes.includes('Google Chrome')) {
                    let data  = await DarwinExecutors.getBrowserData('Google Chrome');
                    data = data.split("\n").filter(d => d != null && d != "");

                    data = data.map(d => {
                        const values = d.split('%sep%');
                        return {
                            title: values[0],
                            url: values[1]
                        };
                    });

                    metadata = data;
                }
                resolve(metadata)
            }).catch(error => reject(error));

        });
  },

  restoreApplicationWithData: (payload) => {
    payload = JSON.parse(payload)
    let scpt = `
        tell application "System Events"
          set theID to (unix id of processes whose name is "Google Chrome")
          try
            do shell script "kill -9 " & theID
          end try
        end tell
        delay 3
        `;
    let urls = payload.data.map(d => d.url);
    if (payload.data.length == 0) {
      scpt += `
            tell application "Google Chrome"
                activate
            end tell
        `;
      console.log(scpt)
      osascript.execute(scpt, null, () => {
      });
      return;
    }
    for (let url of urls) {
      scpt += `
            tell application "Google Chrome"
              activate
              set theUrl to "${url}"
              
              if (count every window) = 0 then
                make new window
              end if
              
              set found to false
              set theTabIndex to -1
              repeat with theWindow in every window
                set theTabIndex to 0
                repeat with theTab in every tab of theWindow
                  set theTabIndex to theTabIndex + 1
                  if theTab's URL = theUrl then
                    set found to true
                    exit
                  end if
                end repeat
                
                if found then
                  exit repeat
                end if
              end repeat
              
              if found then
                tell theTab to reload
                set theWindow's active tab index to theTabIndex
                set index of theWindow to 1
              else
                tell window 1 to make new tab with properties {URL:theUrl}
              end if
            end tell
        `;


    }
    osascript.execute(scpt, null, () => {
      console.log('hope...')
    })
  }
});

contextBridge.exposeInMainWorld("general", {
  promptDialogue: async (title, msg, defaultValue = '') =>
        await prompt({
            title: title,
            label: msg,
            value: defaultValue,
            type: 'input'
        }),
  openExternalLink(link) {
    shell.openExternal(link)
  },
});

contextBridge.exposeInMainWorld("database", {
  createWorkspace: async (name) => {
    const { sequelize, Workspace } = DatabaseExecutors.loadModels();
    await sequelize.sync();

    const workspace = await Workspace.create({name});
    return workspace.toJSON();
  },

  loadWorkspaces: async () => {
    const { sequelize, Workspace, Group, MetaData } = DatabaseExecutors.loadModels();
    await sequelize.sync();

    const workspaces =  await Workspace.findAll({
      include: [
        {
          model: Group,
          as: 'groups',
          include: [
            {
              model: MetaData,
              as: 'data'
            }
          ]
        }
      ]
    });

    console.log(workspaces)
    return workspaces;
  },

  addMetaData: async (WorkspaceId, metadata, GroupTitle, urlsTitle) => {
    const { sequelize, MetaData, Group } = DatabaseExecutors.loadModels();
    await sequelize.sync();

    let group = await Group.create({
      title: !!GroupTitle ? GroupTitle : 'Default',
      WorkspaceId,
    });

    group = group.toJSON();

    for (let data of metadata) {
      const mdata = await MetaData.create({
        GroupId: group.id,
        title: !!urlsTitle ? urlsTitle : 'Default',
        url: data.url
      });
    }
  },

  deleteGroup: async (groupId) => {
    const { sequelize, Group } = DatabaseExecutors.loadModels();
    await sequelize.sync();
    await Group.destroy({where: { id: groupId }});
  },

  updateTitle: async (typeofTitle, groupId, newTitle) => {
    const { sequelize, Group, MetaData } = DatabaseExecutors.loadModels();
    await sequelize.sync();
    if (typeofTitle == 'group') {
      await Group.update({ title: newTitle }, { where: { id: groupId } });
    } else {
      await MetaData.update({ title: newTitle }, { where: { GroupId: groupId } });
    }
  },

  moveUrlToGroup: async (groupId, url_id) => {
    const { sequelize, Group, MetaData } = DatabaseExecutors.loadModels();
    await sequelize.sync();

    const group = await Group.findOne({ where: { id: groupId }, include: [
        {
              model: MetaData,
              as: 'data'
        }
    ]});



    if (!!group) {
      let old_title = group.title;
      if (!!group.dataValues.data && group.dataValues.data.length > 0) {
        old_title = group.dataValues.data[0].title;
      }


      await MetaData.update({ title: old_title, GroupId: groupId }, { where: { id: url_id } });
    }
  }
})