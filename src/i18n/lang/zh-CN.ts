export default {
  common: {
    title: 'Tanpopo',
    copy: '复制',
    add: '添加',
    update: '更新',
    cancel: '取消',
    delete: '删除',
    colon: '：',
    timeout: '超时',
    ok: '确定',
    on: '开启',
    off: '关闭',
    enable: '启用',
    disable: '禁用',
    online: '在线',
    offline: '离线',
    option: '可选',
    confirmation: '确认',
    inputError: '输入有误，请检查您的输入。',
    copySuccess: '复制成功！',
    copyFailed: '复制失败。'
  },
  layout: {
    sidebar: {
      dashboard: '控制面板',
      servers: '服务器',
      subscriptions: '订阅列表',
      settings: '设置',
      logs: '日志',
      about: '关于'
    }
  },
  views: {
    dashboard: {
      title: '控制面板',
      networkStatus: '网络状态',
      proxySettings: '代理设置',
      notConnected: '未连接',
      startTips: '开启代理之前，请先选择代理服务器。',
      usedPort: '端口{port}已被使用, 请更换端口或者关闭相关程序。'
    },
    servers: {
      title: '服务器',
      serverInfo: '服务器信息',
      addServer: '添加服务器',
      editServer: '编辑服务器',
      deleteServer: '删除服务器',
      emptyServer: '还没有服务器信息，请先添加。',
      sureToDelete: '您确定要删除服务器{name}吗？',
      qrCode: '二维码',
      name: '服务器名称',
      host: '主机名',
      port: '端口号',
      password: '密码',
      sni: 'SNI',
      URL: '服务器URL',
      allowUnsafe: '允许不安全',
      verifyHostname: '检查是否匹配主机名',
      fastOpen: 'Fast Open',
      json: 'JSON',
      portNotMatch: 'JSON文件的端口号和程序配置的端口号不一致，请注意！',
      add: {
        manual: '手动添加',
        URL: '使用Trojan URL添加',
        json: '导入JSON'
      },
      updateSuccess: '服务器信息已更新。',
      addSuccess: '服务器信息已添加。',
      deleteSuccess: '{name}已删除。'
    },
    subscriptions: {
      title: '服务器订阅',
      addSubscription: '添加订阅',
      editSubscription: '编辑订阅',
      deleteSubscription: '删除订阅',
      emptySubscription: '还没有订阅信息，请先添加。',
      sureToDelete: '您确定要删除订阅{name}吗？',
      errorURL: '订阅地址无法获取到有效的服务器信息。',
      URL: '订阅URL',
      name: '订阅名称',
      updateSuccess: '订阅信息已更新。',
      addSuccess: '订阅信息已添加。',
      deleteSuccess: '{name}已删除。'
    },
    logs: {
      title: '日志',
      clearLogs: 'Clear Logs'
    },
    settings: {
      title: '设置',
      clearAll: '清空所有数据',
      resetSettings: '重置设置',
      saveSettings: '保存设置',
      saved: '设置已保存',
      preferredLanguages: '首选语言',
      proxyMode: '代理模式',
      proxyModes: {
        local: '本地模式',
        global: '全局模式',
        pac: 'PAC模式'
      },
      listeningIPAddress: '监听IP地址',
      socksPort: 'SOCKS端口',
      HTTPPort: 'HTTP端口',
      PACPort: 'PAC文件端口',
      PACURL: 'PAC 地址',
      autoStartup: '开机自启',
      hiddenWindows: '开启时隐藏窗口',
      defaultPACURL: '默认使用gfwlist作为PAC规则。',
      saveSuccess: '设置已保存。',
      resetSuccess: '设置已重置。',
      sureToReset: '您确定要重置设置么？',
      sureToClear: '您确定要清除所有数据么？?',
      clearSuccess: '数据已清除。'
    },
    about: {
      title: '关于',
      version: '版本'
    }
  },
  validation: {
    required: '此项目不能为空',
    type: '输入内容格式不符合要求',
    charCount: '输入内容过长 ({count}字符以内)'
  },
  tray: {
    showPanel: '显示窗口',
    quit: '退出'
  }
};
