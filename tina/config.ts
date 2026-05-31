import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'posts',
        label: '文章',
        path: 'src/content/posts',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: '标题',
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: '发布日期',
          },
          {
            type: 'string',
            name: 'description',
            label: '描述',
          },
          {
            type: 'image',
            name: 'heroImage',
            label: '头图',
          },
          {
            type: 'string',
            name: 'heroImageCaption',
            label: '头图说明（可选）',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: '正文',
            isBody: true,
            description: '工具栏可选荧光笔，"+" 菜单插入「引言卡片」「提问句」。',
            templates: [
              {
                name: 'QuoteLine',
                label: '引言卡片',
                fields: [
                  {
                    type: 'string',
                    name: 'text',
                    label: '引言内容',
                    required: true,
                    ui: { component: 'textarea' },
                  },
                ],
              },
              {
                name: 'Question',
                label: '提问句',
                fields: [
                  {
                    type: 'string',
                    name: 'content',
                    label: '提问内容',
                    required: true,
                    ui: { component: 'textarea' },
                  },
                ],
              },
              {
                name: 'Annotation',
                label: '作者注',
                fields: [
                  {
                    type: 'string',
                    name: 'content',
                    label: '注释内容',
                    required: true,
                    ui: { component: 'textarea' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
