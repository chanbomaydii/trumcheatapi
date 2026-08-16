export default {
  // New landing page (stats strip + pricing departure board)
  landing: {
    stats: {
      models: 'Models served',
      uptime: '30-day uptime',
      ttft: '24h median TTFT',
      formats: 'Compatible API formats'
    },
    board: {
      liveLabel: 'Live pricing board — updated every 60s',
      unit: 'USD / 1M tokens',
      columns: {
        model: 'Model',
        provider: 'Provider',
        input: 'Input price',
        output: 'Output price',
        // Must name the output price explicitly — savingPct is computed from
        // the output price only, and a bare "Saving" would read as a claim
        // about the whole row when the input-side saving can differ.
        savingOutput: 'Output saving'
      }
    },
    strip: {
      status: 'All systems operational',
      // Shown when the measured uptime ratio falls below the operational bar.
      statusDegraded: 'Degraded service',
      statusUptime: '{uptime} uptime',
      latency: 'Hanoi ⇄ us-east',
      // Must mean the same thing as the "24h median TTFT" stat tile: one number
      // cannot carry two names on one screen. "Gateway latency" is the abolished
      // label — nothing measures gateway overhead, and TTFT includes the model's
      // own generation time.
      latencyTtft: 'TTFT {ttft}'
    },
    nav: {
      modelBoard: 'Model board',
      pricing: 'Pricing',
      docs: 'Docs',
      faq: 'FAQ',
      login: 'Log in',
      getApiKey: 'Get API key'
    },
    hero: {
      eyebrow: 'Unified API gateway',
      eyebrowModelCount: '{count} models live',
      titleLine1: 'Every model.',
      titleLine2: 'One {emphasis}.',
      titleLine3: '{pct}% cheaper.',
      titleLine3Plain: 'Dramatically cheaper.',
      subtitle: 'Claude, GPT and Gemini run on real subscription account pools. Keep the SDK you already use — change exactly one line: {code}.',
      ctaPrimary: 'Get a free API key',
      ctaSecondary: 'See pricing ↓',
      clockLabel: 'Last price update'
    },
    steps: {
      secnum: '01 / HOW IT WORKS',
      heading: 'Three steps, done in two minutes',
      step1: {
        title: 'Create an account',
        desc: 'Sign up with email or Google. Get trial credit instantly, no card required.'
      },
      step2: {
        title: 'Create an API key',
        descWithCount: 'One key unlocks all {count} models. Set a spending limit per key.',
        descPlain: 'One key unlocks every supported model. Set a spending limit per key.'
      },
      step3: {
        title: 'Change one line',
        desc: 'Point base_url to {siteName}. SDK, tool calls and streaming stay the same.'
      },
      code: {
        comment: '# Keep the OpenAI SDK, change exactly 2 lines',
        greeting: 'Hi!'
      }
    },
    compat: {
      secnum: '02 / COMPATIBILITY',
      heading: 'Speaks the exact SDK language you already use',
      badge: 'Compatible'
    },
    faq: {
      secnum: '03 / FAQ',
      heading: 'Quick questions, straight answers',
      q1: {
        question: 'Why is it cheaper than list price?',
        answer: 'The system runs on a pool of monthly subscription accounts instead of buying tokens at list price. The difference is passed back to you.'
      },
      q2: {
        question: 'Can a key get locked mid-session?',
        answer: 'The account pool auto-rotates. If one account has an issue, the request fails over to another account within the same session — you see no interruption.'
      },
      q3: {
        question: 'How is billing calculated?',
        answer: 'By actual tokens used, measured right at the gateway. Deducted straight from your balance; see per-request detail in Usage. No hidden fees, no maintenance fees.'
      },
      q4: {
        question: 'How do I top up?',
        answer: 'Domestic bank transfer, e-wallet, or a redeem code. Balance lands in your account right after confirmation.'
      },
      q5: {
        question: 'Is there a rate limit?',
        answer: 'No hard limit. Each key can set its own spending cap to avoid blowing the budget when running agents.'
      },
      q6: {
        question: 'Is request content stored?',
        answer: 'By default only token counts and metadata are logged for billing. Prompt and response content is never stored.'
      }
    },
    support: {
      secnum: '04 / SUPPORT',
      heading: 'Real people, real answers',
      telegram: {
        channel: 'Main channel',
        title: 'Telegram',
        desc: 'Technical support group, maintenance notices and new model updates.',
        note: '● Monitored directly by the technical team'
      },
      zalo: {
        channel: 'Domestic',
        title: 'Zalo',
        desc: 'Support for top-ups, invoices and payment issues in Vietnamese.',
        note: '● Support available throughout the day'
      },
      email: {
        channel: 'Business',
        title: 'Email',
        desc: 'Custom limits, contracts, VAT invoices and shared team accounts.',
        note: '● For business inquiries'
      }
    },
    cta: {
      heading: 'Get started in 60 seconds',
      subtitle: 'No card required · Free trial credit · Cancel anytime',
      button: 'Get API key →'
    },
    footer: {
      copyright: '© {year} {siteName}',
      links: 'Docs · Status · Terms · Telegram'
    }
  },

  batchImageGuide: {
    title: 'Batch Image Generation',
    description: 'Submit multiple prompts in one job and download the generated images when complete'
  },
  // Home Page
  home: {
    viewOnGithub: 'View on GitHub',
    viewDocs: 'View Documentation',
    docs: 'Docs',
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    dashboard: 'Dashboard',
    login: 'Login',
    getStarted: 'Get Started',
    goToDashboard: 'Go to Dashboard',
    // User-focused value proposition
    heroSubtitle: 'One Key, All AI Models',
    heroDescription: 'No need to manage multiple subscriptions. Access Claude, GPT, Gemini and more with a single API key',
    tags: {
      subscriptionToApi: 'Subscription to API',
      stickySession: 'Session Persistence',
      realtimeBilling: 'Pay As You Go'
    },
    // Pain points section
    painPoints: {
      title: 'Sound Familiar?',
      items: {
        expensive: {
          title: 'High Subscription Costs',
          desc: 'Paying for multiple AI subscriptions that add up every month'
        },
        complex: {
          title: 'Account Chaos',
          desc: 'Managing scattered accounts and API keys across different platforms'
        },
        unstable: {
          title: 'Service Interruptions',
          desc: 'Single accounts hitting rate limits and disrupting your workflow'
        },
        noControl: {
          title: 'No Usage Control',
          desc: "Can't track where your money goes or limit team member usage"
        }
      }
    },
    // Solutions section
    solutions: {
      title: 'We Solve These Problems',
      subtitle: 'Three simple steps to stress-free AI access'
    },
    features: {
      unifiedGateway: 'One-Click Access',
      unifiedGatewayDesc: 'Get a single API key to call all connected AI models. No separate applications needed.',
      multiAccount: 'Always Reliable',
      multiAccountDesc: 'Smart routing across multiple upstream accounts with automatic failover. Say goodbye to errors.',
      balanceQuota: 'Pay What You Use',
      balanceQuotaDesc: 'Usage-based billing with quota limits. Full visibility into team consumption.'
    },
    // Comparison section
    comparison: {
      title: 'Why Choose Us?',
      headers: {
        feature: 'Comparison',
        official: 'Official Subscriptions',
        us: 'Our Platform'
      },
      items: {
        pricing: {
          feature: 'Pricing',
          official: 'Fixed monthly fee, pay even if unused',
          us: 'Pay only for what you use'
        },
        models: {
          feature: 'Model Selection',
          official: 'Single provider only',
          us: 'Switch between models freely'
        },
        management: {
          feature: 'Account Management',
          official: 'Manage each service separately',
          us: 'Unified key, one dashboard'
        },
        stability: {
          feature: 'Stability',
          official: 'Single account rate limits',
          us: 'Multi-account pool, auto-failover'
        },
        control: {
          feature: 'Usage Control',
          official: 'Not available',
          us: 'Quotas & detailed analytics'
        }
      }
    },
    providers: {
      title: 'Supported AI Models',
      description: 'One API, Multiple Choices',
      supported: 'Supported',
      soon: 'Soon',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: 'More'
    },
    // CTA section
    cta: {
      title: 'Ready to Get Started?',
      description: 'Sign up now and get free trial credits to experience seamless AI access',
      button: 'Sign Up Free'
    },
    footer: {
      allRightsReserved: 'All rights reserved.'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key Usage',
    subtitle: 'Enter your API Key to view real-time spending and usage status',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: 'Query',
    querying: 'Querying...',
    privacyNote: 'Your Key is processed locally in the browser and will not be stored',
    dateRange: 'Date Range:',
    dateRangeToday: 'Today',
    dateRange7d: '7 Days',
    dateRange30d: '30 Days',
    dateRange90d: '90 Days',
    dateRangeCustom: 'Custom',
    apply: 'Apply',
    used: 'Used',
    detailInfo: 'Detail Information',
    tokenStats: 'Token Statistics',
    dailyDetail: 'Daily Detail',
    modelStats: 'Model Usage Statistics',
    // Table headers
    date: 'Date',
    model: 'Model',
    requests: 'Requests',
    inputTokens: 'Input Tokens',
    outputTokens: 'Output Tokens',
    cacheCreationTokens: 'Cache Creation',
    cacheReadTokens: 'Cache Read',
    cacheWriteTokens: 'Cache Write',
    totalTokens: 'Total Tokens',
    cost: 'Cost',
    // Status
    quotaMode: 'Key Quota Mode',
    walletBalance: 'Wallet Balance',
    // Ring card titles
    totalQuota: 'Total Quota',
    limit5h: '5-Hour Limit',
    limitDaily: 'Daily Limit',
    limit7d: '7-Day Limit',
    limitWeekly: 'Weekly Limit',
    limitMonthly: 'Monthly Limit',
    // Detail rows
    remainingQuota: 'Remaining Quota',
    expiresAt: 'Expires At',
    todayExpires: '(expires today)',
    daysLeft: '({days} days)',
    usedQuota: 'Used Quota',
    resetNow: 'Resetting soon',
    subscriptionType: 'Subscription Type',
    subscriptionExpires: 'Subscription Expires',
    // Usage stat cells
    todayRequests: 'Today Requests',
    todayInputTokens: 'Today Input',
    todayOutputTokens: 'Today Output',
    todayTokens: 'Today Tokens',
    todayCacheCreation: 'Today Cache Creation',
    todayCacheRead: 'Today Cache Read',
    todayCost: 'Today Cost',
    rpmTpm: 'RPM / TPM',
    totalRequests: 'Total Requests',
    totalInputTokens: 'Total Input',
    totalOutputTokens: 'Total Output',
    totalTokensLabel: 'Total Tokens',
    totalCacheCreation: 'Total Cache Creation',
    totalCacheRead: 'Total Cache Read',
    totalCost: 'Total Cost',
    avgDuration: 'Avg Duration',
    // Messages
    enterApiKey: 'Please enter an API Key',
    querySuccess: 'Query successful',
    queryFailed: 'Query failed',
    queryFailedRetry: 'Query failed, please try again later',
    noDailyUsage: 'No daily usage data',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API Setup',
    description: 'Configure your Sub2API instance',
    database: {
      title: 'Database Configuration',
      description: 'Connect to your PostgreSQL database',
      host: 'Host',
      port: 'Port',
      username: 'Username',
      password: 'Password',
      databaseName: 'Database Name',
      sslMode: 'SSL Mode',
      passwordPlaceholder: 'Password',
      ssl: {
        disable: 'Disable',
        require: 'Require',
        verifyCa: 'Verify CA',
        verifyFull: 'Verify Full'
      }
    },
    redis: {
      title: 'Redis Configuration',
      description: 'Connect to your Redis server',
      host: 'Host',
      port: 'Port',
      username: 'Username (optional)',
      password: 'Password (optional)',
      database: 'Database',
      usernamePlaceholder: 'Leave empty for default user',
      passwordPlaceholder: 'Password',
      enableTls: 'Enable TLS',
      enableTlsHint: 'Use TLS when connecting to Redis (public CA certs)'
    },
    admin: {
      title: 'Admin Account',
      description: 'Create your administrator account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      passwordPlaceholder: 'Min 8 characters',
      confirmPasswordPlaceholder: 'Confirm password',
      passwordMismatch: 'Passwords do not match'
    },
    ready: {
      title: 'Ready to Install',
      description: 'Review your configuration and complete setup',
      database: 'Database',
      redis: 'Redis',
      adminEmail: 'Admin Email'
    },
    status: {
      testing: 'Testing...',
      success: 'Connection Successful',
      testConnection: 'Test Connection',
      installing: 'Installing...',
      completeInstallation: 'Complete Installation',
      completed: 'Installation completed!',
      redirecting: 'Redirecting to login page...',
      restarting: 'Service is restarting, please wait...',
      timeout: 'Service restart is taking longer than expected. Please refresh the page manually.'
    }
  },

  // Common
}
