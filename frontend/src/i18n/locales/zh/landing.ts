export default {
  // 新版首页（数据统计条 + 价格公示牌）
  landing: {
    stats: {
      models: '在线模型数',
      uptime: '30 天可用率',
      ttft: '24 小时 TTFT 中位数',
      formats: '兼容 API 格式'
    },
    board: {
      liveLabel: '实时价格看板 — 每 60 秒更新',
      referenceLabel: '参考价格看板'
    },
    strip: {
      status: '所有系统正常运行 · 正常运行率 99.98%',
      latency: '河内 ⇄ us-east · 网关延迟 11ms'
    },
    nav: {
      modelBoard: '模型看板',
      pricing: '价格',
      docs: '文档',
      faq: '常见问题',
      login: '登录',
      getApiKey: '获取 API key'
    },
    hero: {
      eyebrow: '统一 API 网关 · 41 个模型在线',
      titleLine1: '全部模型。',
      titleLine2: '一个 {emphasis}。',
      titleLine3: '便宜 72%。',
      subtitle: 'Claude、GPT 和 Gemini 运行在真实订阅账号池上。保留你现在使用的 SDK — 只需修改一行 {code}。',
      ctaPrimary: '免费获取 API key',
      ctaSecondary: '查看价格 ↓',
      clockLabel: '价格最近更新时间'
    },
    steps: {
      secnum: '01 / 使用方法',
      heading: '三步，两分钟完成',
      step1: {
        title: '创建账户',
        desc: '使用邮箱或 Google 注册，立即获得试用额度，无需信用卡。'
      },
      step2: {
        title: '创建 API key',
        desc: '一个 key 即可解锁全部 41 个模型，可为每个 key 设置消费限额。'
      },
      step3: {
        title: '修改一行代码',
        desc: '将 base_url 指向 TrumCheat，SDK、工具调用和流式传输保持不变。'
      },
      code: {
        comment: '# 保留 OpenAI SDK，只修改 2 行',
        greeting: '你好！'
      }
    },
    compat: {
      secnum: '02 / 兼容性',
      heading: '与你正在使用的 SDK 语言完全兼容',
      badge: '兼容'
    },
    faq: {
      secnum: '03 / 常见问题',
      heading: '快问快答',
      q1: {
        question: '为什么能比原价便宜多达 72%？',
        answer: '系统运行在按月付费的订阅账号池上，而不是按牌价购买 token。差价直接返还给你。'
      },
      q2: {
        question: 'Key 会不会中途被锁？',
        answer: '账号池由 128 个账号自动轮换。某个账号出问题时，请求会在同一会话内切换到其他账号 — 你不会感知到中断。'
      },
      q3: {
        question: '如何计费？',
        answer: '按实际使用的 token 计费，在网关处实时计量。直接从余额扣除，可在"统计"中查看每个请求的明细。没有隐藏费用，没有维护费。'
      },
      q4: {
        question: '如何充值？',
        answer: '支持国内银行转账、电子钱包或兑换码充值，确认后余额立即到账。'
      },
      q5: {
        question: '有速率限制吗？',
        answer: '没有硬性限制。每个 key 都可以单独设置消费上限，避免运行 agent 时超支。'
      },
      q6: {
        question: '请求内容会被保存吗？',
        answer: '默认仅记录 token 数量和计费所需的元数据，不会保存 prompt 和响应内容。'
      }
    },
    support: {
      secnum: '04 / 支持',
      heading: '真人支持，真实回复',
      telegram: {
        channel: '主要渠道',
        title: 'Telegram',
        desc: '技术支持群，维护通知与新模型更新。',
        responseTime: '● 平均 4 分钟回复'
      },
      zalo: {
        channel: '国内',
        title: 'Zalo',
        desc: '以越南语提供充值、发票和支付问题支持。',
        hours: '● 每天 08:00 – 24:00'
      },
      email: {
        channel: '企业',
        title: 'Email',
        desc: '定制额度、合同、增值税发票及团队共享账户。',
        responseTime: '● 12 小时内回复'
      },
      sla: {
        statusPage: '公开状态页 · 12 个月事件历史',
        uptimeLabel: '30 天可用率',
        incidentsLabel: '次重大故障',
        updatedLabel: '更新于 04:12'
      }
    },
    cta: {
      heading: '60 秒即可开始',
      subtitle: '无需信用卡 · 免费试用额度 · 随时取消',
      button: '获取 API key →'
    },
    footer: {
      copyright: '© {year} TrumCheat API',
      links: '文档 · 状态 · 条款 · Telegram'
    }
  },

  batchImageGuide: {
    title: '图片批量生成',
    description: '一次提交多条提示词，任务完成后可统一下载图片结果'
  },
  // Home Page
  home: {
    viewOnGithub: '在 GitHub 上查看',
    viewDocs: '查看文档',
    docs: '文档',
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
    dashboard: '控制台',
    login: '登录',
    getStarted: '立即开始',
    goToDashboard: '进入控制台',
    // 新增：面向用户的价值主张
    heroSubtitle: '一个密钥，畅用多个 AI 模型',
    heroDescription: '无需管理多个订阅账号，一站式接入 Claude、GPT、Gemini 等主流 AI 服务',
    tags: {
      subscriptionToApi: '订阅转 API',
      stickySession: '会话保持',
      realtimeBilling: '按量计费'
    },
    // 用户痛点区块
    painPoints: {
      title: '你是否也遇到这些问题？',
      items: {
        expensive: {
          title: '订阅费用高',
          desc: '每个 AI 服务都要单独订阅，每月支出越来越多'
        },
        complex: {
          title: '多账号难管理',
          desc: '不同平台的账号、密钥分散各处，管理起来很麻烦'
        },
        unstable: {
          title: '服务不稳定',
          desc: '单一账号容易触发限制，影响正常使用'
        },
        noControl: {
          title: '用量无法控制',
          desc: '不知道钱花在哪了，也无法限制团队成员的使用'
        }
      }
    },
    // 解决方案区块
    solutions: {
      title: '我们帮你解决',
      subtitle: '简单三步，开始省心使用 AI'
    },
    features: {
      unifiedGateway: '一键接入',
      unifiedGatewayDesc: '获取一个 API 密钥，即可调用所有已接入的 AI 模型，无需分别申请。',
      multiAccount: '稳定可靠',
      multiAccountDesc: '智能调度多个上游账号，自动切换和负载均衡，告别频繁报错。',
      balanceQuota: '用多少付多少',
      balanceQuotaDesc: '按实际使用量计费，支持设置配额上限，团队用量一目了然。'
    },
    // 优势对比
    comparison: {
      title: '为什么选择我们？',
      headers: {
        feature: '对比项',
        official: '官方订阅',
        us: '本平台'
      },
      items: {
        pricing: {
          feature: '付费方式',
          official: '固定月费，用不完也付',
          us: '按量付费，用多少付多少'
        },
        models: {
          feature: '模型选择',
          official: '单一服务商',
          us: '多模型随意切换'
        },
        management: {
          feature: '账号管理',
          official: '每个服务单独管理',
          us: '统一密钥，一站管理'
        },
        stability: {
          feature: '服务稳定性',
          official: '单账号易触发限制',
          us: '多账号池，自动切换'
        },
        control: {
          feature: '用量控制',
          official: '无法限制',
          us: '可设配额、查明细'
        }
      }
    },
    providers: {
      title: '已支持的 AI 模型',
      description: '一个 API，多种选择',
      supported: '已支持',
      soon: '即将推出',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: '更多'
    },
    // CTA 区块
    cta: {
      title: '准备好开始了吗？',
      description: '注册即可获得免费试用额度，体验一站式 AI 服务',
      button: '免费注册'
    },
    footer: {
      allRightsReserved: '保留所有权利。'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key 用量查询',
    subtitle: '输入您的 API Key 以查看实时消费金额与使用状态',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: '查询',
    querying: '查询中...',
    privacyNote: '您的 Key 仅在浏览器本地处理，不会被存储',
    dateRange: '统计范围:',
    dateRangeToday: '今日',
    dateRange7d: '7 天',
    dateRange30d: '30 天',
    dateRange90d: '90 天',
    dateRangeCustom: '自定义',
    apply: '应用',
    used: '已使用',
    detailInfo: '详细信息',
    tokenStats: 'Token 统计',
    dailyDetail: '按日明细',
    modelStats: '模型用量统计',
    // Table headers
    date: '日期',
    model: '模型',
    requests: '请求数',
    inputTokens: '输入 Tokens',
    outputTokens: '输出 Tokens',
    cacheCreationTokens: '缓存创建',
    cacheReadTokens: '缓存读取',
    cacheWriteTokens: '缓存写入',
    totalTokens: '总 Tokens',
    cost: '费用',
    // Status
    quotaMode: 'Key 限额模式',
    walletBalance: '钱包余额',
    // Ring card titles
    totalQuota: '总额度',
    limit5h: '5 小时限额',
    limitDaily: '日限额',
    limit7d: '7 天限额',
    limitWeekly: '周限额',
    limitMonthly: '月限额',
    // Detail rows
    remainingQuota: '剩余额度',
    expiresAt: '过期时间',
    todayExpires: '(今日到期)',
    daysLeft: '({days} 天)',
    usedQuota: '已用额度',
    resetNow: '即将重置',
    subscriptionType: '订阅类型',
    subscriptionExpires: '订阅到期',
    // Usage stat cells
    todayRequests: '今日请求',
    todayInputTokens: '今日输入',
    todayOutputTokens: '今日输出',
    todayTokens: '今日 Tokens',
    todayCacheCreation: '今日缓存创建',
    todayCacheRead: '今日缓存读取',
    todayCost: '今日费用',
    rpmTpm: 'RPM / TPM',
    totalRequests: '累计请求',
    totalInputTokens: '累计输入',
    totalOutputTokens: '累计输出',
    totalTokensLabel: '累计 Tokens',
    totalCacheCreation: '累计缓存创建',
    totalCacheRead: '累计缓存读取',
    totalCost: '累计费用',
    avgDuration: '平均耗时',
    // Messages
    enterApiKey: '请输入 API Key',
    querySuccess: '查询成功',
    queryFailed: '查询失败',
    queryFailedRetry: '查询失败，请稍后重试',
    noDailyUsage: '暂无按日用量数据',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API 安装向导',
    description: '配置您的 Sub2API 实例',
    database: {
      title: '数据库配置',
      description: '连接到您的 PostgreSQL 数据库',
      host: '主机',
      port: '端口',
      username: '用户名',
      password: '密码',
      databaseName: '数据库名称',
      sslMode: 'SSL 模式',
      passwordPlaceholder: '密码',
      ssl: {
        disable: '禁用',
        require: '要求',
        verifyCa: '验证 CA',
        verifyFull: '完全验证'
      }
    },
    redis: {
      title: 'Redis 配置',
      description: '连接到您的 Redis 服务器',
      host: '主机',
      port: '端口',
      username: '用户名（可选）',
      password: '密码（可选）',
      database: '数据库',
      usernamePlaceholder: '默认用户留空',
      passwordPlaceholder: '密码',
      enableTls: '启用 TLS',
      enableTlsHint: '连接 Redis 时使用 TLS（公共 CA 证书）'
    },
    admin: {
      title: '管理员账户',
      description: '创建您的管理员账户',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      passwordPlaceholder: '至少 8 个字符',
      confirmPasswordPlaceholder: '确认密码',
      passwordMismatch: '密码不匹配'
    },
    ready: {
      title: '准备安装',
      description: '检查您的配置并完成安装',
      database: '数据库',
      redis: 'Redis',
      adminEmail: '管理员邮箱'
    },
    status: {
      testing: '测试中...',
      success: '连接成功',
      testConnection: '测试连接',
      installing: '安装中...',
      completeInstallation: '完成安装',
      completed: '安装完成！',
      redirecting: '正在跳转到登录页面...',
      restarting: '服务正在重启，请稍候...',
      timeout: '服务重启时间超出预期，请手动刷新页面。'
    }
  },

  // Common
}
