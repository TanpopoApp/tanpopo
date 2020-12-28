export default {
  common: {
    title: 'Tanpopo',
    add: 'Add',
    update: 'Update',
    cancel: 'Cancel',
    delete: 'Delete',
    colon: ': ',
    timeout: 'Timeout',
    ok: 'OK',
    on: 'On',
    off: 'Off',
    enable: 'Enable',
    disable: 'Disable',
    onLine: 'OnLine',
    offLine: 'OffLine',
    option: 'Option',
    confirmation: 'Confirmation',
    inputError: 'Input error, please check your input.'
  },
  layout: {
    sidebar: {
      dashboard: 'Dashboard',
      servers: 'Servers',
      subscriptions: 'Subscriptions',
      settings: 'Settings',
      logs: 'Logs',
      about: 'About'
    }
  },
  views: {
    dashboard: {
      title: 'Dashboard',
      networkStatus: 'Network Status',
      proxySettings: 'Proxy Settings',
      notConnected: 'Not Connected',
      startTips: 'Before start proxy, please select a server.',
      usedPort:
        '{port} port already used, please change port or close related application.'
    },
    servers: {
      title: 'Servers',
      serverInfo: 'Server Info',
      addServer: 'Add Server',
      editServer: 'Edit Server',
      deleteServer: 'Delete Server',
      emptyServer: 'There is no server info yet, please add one.',
      sureToDelete: 'Are you sure you want to delete?',
      name: 'Name',
      host: 'Host',
      port: 'Port',
      password: 'Password',
      sni: 'SNI',
      URL: 'URL',
      allowUnsafe: 'Allow Unsafe',
      verifyHostname: 'Verify Hostname',
      fastOpen: 'Fast Open',
      json: 'JSON',
      portNotMatch:
        'JSON config local_port not same with config port, please be careful!'
    },
    subscriptions: {
      title: 'Server Subscriptions',
      addSubscription: 'Add Subscription',
      editSubscription: 'Edit Subscription',
      deleteSubscription: 'Delete Subscription',
      emptySubscription: 'There is no subscription info yet, please add one.',
      sureToDelete: 'Are you sure you want to delete?',
      URL: 'URL',
      name: 'Name'
    },
    logs: {
      title: 'Logs',
      clearLogs: 'Clear Logs'
    },
    settings: {
      title: 'Settings',
      saveSettings: 'Save Settings',
      saved: 'Settings saved',
      preferredLanguages: 'Preferred Language',
      proxyMode: 'Proxy Mode',
      proxyModes: {
        local: 'Local Mode',
        global: 'Global Mode',
        pac: 'PAC Mode'
      },
      listeningIPAddress: 'Listening IP Address',
      socksPort: 'SOCKS Port',
      HTTPPort: 'HTTP Port',
      PACPort: 'PAC File Port',
      PACURL: 'PAC URL',
      sureToChangeLang: 'Change language requires reboot App, are you sure?',
      autoStartup: 'Auto Startup',
      defaultPACURL: 'Default use gfwlist as pac rule.'
    },
    about: {
      title: 'About',
      version: 'Version'
    }
  },
  tray: {
    showPanel: 'Show Panel',
    quit: 'Quit'
  }
};
