export default {
  reseller: {
    profile: { affiliateCode: '经销商邀请码' },
    status: { active: '正常', disabled: '已禁用', unused: '未使用', used: '已使用' },
    users: {
      title: '用户管理',
      description: '查看通过您的邀请码注册的用户用量，并向他们转入余额。',
      empty: '暂时没有用户通过您的邀请码注册。',
      user: '用户', status: '状态', balance: '余额', totalRecharged: '累计转入', invitedAt: '加入时间', actions: '操作',
      viewUsage: '查看用量', transfer: '转入余额', usageTitle: '{user} 的使用记录', noUsage: '暂无使用记录。',
      transferTitle: '转入余额', transferTo: '向 {user} 转入余额。此操作不可撤销。', amount: '金额',
      confirmTitle: '确认转账', confirmMessage: '确认向 {user} 转入 {amount}？这是单向转账。', transferSuccess: '余额转入成功。'
    },
    usage: { model: '模型', tokens: 'Token', cost: '费用', time: '时间' },
    codes: {
      title: '码管理', description: '创建、查看、复制和导出永久余额兑换码。',
      searchPlaceholder: '搜索完整CDKey', allStatuses: '全部状态', export: '导出 CSV', createBatch: '创建CDKey', createCDKeys: '创建CDKey', empty: '未找到CDKey。',
      code: 'CDKey', value: '面值', status: '状态', usedBy: '使用者', usedAt: '使用时间', expiresAt: '过期时间', createdAt: '创建时间',
      count: '数量', codeType: '类型', balance: '余额', amount: '金额 ($)', codeExpiry: 'CDKey有效期', neverExpires: '永不过期', oneDay: '1天', threeDays: '3天', sevenDays: '7天', custom: '自定义', customDays: '自定义有效天数', totalValue: '总扣款：{total}', createdTitle: '已创建CDKey', createdMessage: '已创建 {count} 个CDKey，之后仍可在列表中查看。',
      copy: '复制', copyAll: '复制全部', copied: '已复制到剪贴板。', copyFailed: '复制失败。', createSuccess: '兑换码创建成功。'
    }
  }
}