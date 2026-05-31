import typography from '@tailwindcss/typography';

const sans = [
  '"Hiragino Sans GB"', '"Noto Sans CJK SC"', '"Microsoft YaHei"', 'sans-serif',
];
const serif = [
  '"Songti SC"', '"Noto Serif CJK SC"', '"SimSun"', '"Source Han Serif SC"', 'ui-serif',
];
const mincho = [
  '"Hiragino Mincho ProN"', '"Mincho"', '"Noto Serif CJK JP"', '"Source Han Serif JP"', 'serif',
];

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: { serif, mincho, sans },
      maxWidth: { prose: '42rem' },
    },
  },
  plugins: [typography],
};
