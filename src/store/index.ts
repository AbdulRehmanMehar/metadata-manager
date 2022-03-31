import { createStore } from 'vuex'

let counter = 0;

function optimizeData(d) {
    if (d.optimized) return d;
    if (!!d.dataValues) d = d.dataValues;
    let obj = {
        name: d.name,
        id: d.id,
        optimized: true,
        groups: !!d.groups && d.groups.length > 0 ? d.groups.map(sp => {
          if (sp.dataValues) {
            sp = sp.dataValues;

            let gobj = {
              id: sp.id,
              title: sp.title,
              data: !!sp.data && sp.data.length > 0 ? sp.data.map(dta => dta.dataValues): []
            };
            return gobj;
          } else return sp;
        }) : [],
        // applications: !!d.applications && d.applications.length > 0 ? d.applications.map(app => {
        //
        //     if (!!app.dataValues) {
        //         app = app.dataValues;
        //
        //
        //         let abj = {
        //             id: app.id,
        //             processName: app.process_name,
        //             processType: app.process_type,
        //             data: !!app.data ? app.data.map(dta => dta.dataValues) : []
        //         }
        //         return abj;
        //     } else return app;
        // }) : [],
    }

    return obj;
};

function optimizeWorkspaces(arr) {
    return arr.map(d => optimizeData(d));
};

export default createStore({
  state: {
    uiMode: 'standard',
    workspaces: [],
    currentWorkspace: null
  },
  mutations: {
    SET_WORKSPACES(state, workspaces) {
      state.workspaces = workspaces
    },
    SET_CURRENT_WORKSPACE(state, workspaceId) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const workspace = state.workspaces.filter(w => w.id == workspaceId)[0];
      if (workspace) {
        state.currentWorkspace = workspace
      }
    },

    SET_UI_MODE(state, mode) {
      state.uiMode = mode
    }
  },
  actions: {
    async createWorkspace({ commit, state, dispatch }, workspaceName) {
      if (!workspaceName) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        workspaceName = await window.general.promptDialogue('Workspace', 'Name your Workspace');
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const workspace = await window.database.createWorkspace(workspaceName);
      // console.log(workspace)
      // await dispatch('addMetaData', {workspaceId: workspace.id, GroupTitle: workspaceName});
      await dispatch('loadWorkspaces');
    },

    async loadWorkspaces({ commit, state, dispatch }) {
      ++counter;
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      let workspaces = await window.database.loadWorkspaces();
      workspaces = optimizeWorkspaces(workspaces);
      console.log(`loadWorkspaces ${counter} workspaces`, workspaces);
      if (!workspaces || workspaces.length == 0) {
        // await dispatch('createWorkspace', 'Default');
        // console.log(`loadWorkspaces ${counter} dispatching createWorkspace`);
      } else {
        commit('SET_WORKSPACES', workspaces);
        if (!state.currentWorkspace) {
          dispatch('setDefaultWorkspace');
          console.log(`loadWorkspaces ${counter} dispatching setDefaultWorkspace`);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          dispatch('setCurrentWorkspace', state.currentWorkspace.id);
          console.log(`loadWorkspaces ${counter} dispatching setCurrentWorkspace`);
        }
      }
    },

    setCurrentWorkspace({ commit }, workspaceId) {
      commit('SET_CURRENT_WORKSPACE', workspaceId)
    },

    setDefaultWorkspace({ commit, state, dispatch }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      dispatch('setCurrentWorkspace', state.workspaces[0].id);
    },

    async addMetaData({ commit, state, dispatch }, {workspaceId, GroupTitle, data, urlsTitle}) {
      const reload = !!!GroupTitle;
      if (!GroupTitle) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        GroupTitle = await window.general.promptDialogue('Group', 'Name your Group');
      }

      if (!urlsTitle) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        urlsTitle = await window.general.promptDialogue('Urls', 'Name your Urls');
      }
      // const data = await window.darwin_scripts.getChromeData();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      await window.database.addMetaData(workspaceId, data, GroupTitle, urlsTitle);
      if (reload) dispatch('loadWorkspaces');
    },

    async destroyGroup({ dispatch }, groupId) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise( async (resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          await window.database.deleteGroup(groupId);
          resolve(true);

      });


      // await dispatch('loadWorkspaces');
    },

    async createGroupByImportedData({dispatch}, { workspaceId, GroupTitle, data, urlTitle }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      await window.database.addMetaData(workspaceId, data, GroupTitle, urlTitle);
      await dispatch('loadWorkspaces');
    },
    setMode({ commit }, mode) {
      commit('SET_UI_MODE', mode);
    },

    async updateTitle({ dispatch }, { typeofTitle, groupId, newTitle }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      await window.database.updateTitle(typeofTitle, groupId, newTitle);
      await dispatch('loadWorkspaces');
    },

    async moveUrlToGroup({ dispatch }, { groupId, urlId }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      await window.database.moveUrlToGroup(groupId, urlId);
      await dispatch('loadWorkspaces');
    }
  },
  modules: {
  },
  getters: {
    mode: state => state.uiMode,
    workspaces: state => state.workspaces,
    currentWorkspace: state => state.currentWorkspace,
  }
})
