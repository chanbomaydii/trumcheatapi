export default {
  reseller: {
    profile: { affiliateCode: 'Reseller invitation code' },
    status: { active: 'Active', disabled: 'Disabled', unused: 'Unused', used: 'Used' },
    users: {
      title: 'Managed Users',
      description: 'Review usage and transfer balance to users registered with your code.',
      empty: 'No users have registered with your code yet.',
      user: 'User', status: 'Status', balance: 'Balance', totalRecharged: 'Transferred', invitedAt: 'Joined', actions: 'Actions',
      viewUsage: 'Usage', transfer: 'Transfer', usageTitle: '{user} usage', noUsage: 'No usage records.',
      transferTitle: 'Transfer balance', transferTo: 'Transfer balance to {user}. This operation cannot be reversed.', amount: 'Amount',
      confirmTitle: 'Confirm transfer', confirmMessage: 'Transfer {amount} to {user}? This is a one-way transfer.', transferSuccess: 'Balance transferred successfully.'
    },
    usage: { model: 'Model', tokens: 'Tokens', cost: 'Cost', time: 'Time' },
    codes: {
      title: 'Codes', description: 'Create, review, copy, and export permanent balance codes.',
      searchPlaceholder: 'Search full CDKey', allStatuses: 'All statuses', export: 'Export CSV', createBatch: 'Create CDKeys', createCDKeys: 'Create CDKeys', empty: 'No CDKeys found.',
      code: 'Code', value: 'Value', status: 'Status', usedBy: 'Used by', usedAt: 'Used at', expiresAt: 'Expires at', createdAt: 'Created at',
      count: 'Count', codeType: 'Code Type', balance: 'Balance', amount: 'Amount ($)', codeExpiry: 'Code Expiry', neverExpires: 'Never expires', oneDay: '1 day', threeDays: '3 days', sevenDays: '7 days', custom: 'Custom', customDays: 'Custom expiry days', totalValue: 'Total debit: {total}', createdTitle: 'Created CDKeys', createdMessage: '{count} CDKeys were created. They remain available in the list.',
      copy: 'Copy', copyAll: 'Copy all', copied: 'Copied to clipboard.', copyFailed: 'Could not copy to clipboard.', createSuccess: 'Codes created successfully.'
    }
  }
}