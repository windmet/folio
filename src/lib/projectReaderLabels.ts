export const threadCategoryLabels: Record<string, string> = {
  'running-gag': '连续笑点',
  'perfect-callback': '前后回收',
  'cross-platform': '跨平台',
  'making-of': '制作幕后',
};

export const threadRoleLabels: Record<string, string> = {
  setup: '起点',
  development: '发展',
  payoff: '回收',
};

export const participationKindLabels: Record<string, string> = {
  'ore-shiri-cast': '《俺知》出演',
  production: '制作',
  ensemble: 'Ensemble',
  'birthday-live': '生日会来宾',
  'space-guest': 'Space 来宾',
  'remote-call': 'LINE 电话',
  'space-account': '账号出现',
  'submitted-comment': '事前投稿',
};

export const readerLabel = (labels: Record<string, string>, value: string) => labels[value] || value;
