# Megazine Blog

一个用于保存声优采访、电台／播客与多线活动档案的 Astro 静态站点。当前最完整的专题档案是小松昌平 36 岁生日企划：它把主直播、两段 X Space、事件、人物和编辑 Thread 组织成一个可追溯的 Project Archive。

## 当前检查点

- Komatsu36：RC 0.9；发布层编辑审计、桌面／窄屏 QA 和本地发布门禁已通过。
- 审阅分支：[codex/komatsu36-project-archive](https://github.com/windmet/folio/tree/codex/komatsu36-project-archive)
- 专题路由：`/projects/komatsu36/`
- Visual QA 与编辑审计：`docs/qa/komatsu36-rc08/`
- 详细合同与剩余 Release Gate：`docs/komatsu36-archive-development.md`

## 本地开发

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4321
```

常用验证命令：

```sh
npm run validate:projects   # 内容关系、时间范围、隐私边界
npm run build               # 生成 dist/
npm run validate:publication # 发布 HTML、检索项和单页预算
npm run validate            # 按上述顺序执行完整门禁
```

构建后的本地预览可以使用另一个端口，避免打断长期运行的开发服务器：

```sh
npm run preview -- --host 127.0.0.1 --port 4322
```

## 发布边界

`project.json` 中的 `status: published` 会让首页显示该专题，因此合并到部署分支可能等同于正式发布。独立 `codex/` 分支只用于审阅，不代表 production-accepted；合并前必须确认内容公开权、production URL 抽查和部署意图。

Komatsu36 的 X Space 在 RC 中采用 first-class external source：页面保留 canonical Space 链接、来源帖 provenance 和事件目标时间，不伪造站内回放、seek 或 X 私有接口。Transcript、Evidence、Chat 浏览器和本地大文件托管不属于本 RC 的发布范围。

## 内容结构

专题数据位于 `src/content/projects/`，按 Project、Act、Event、Thread、Person、Source 和 Track 分层。发布层不得包含原始 ASR 文件标记、本机源档路径、字幕文件名或其他私有来源信息；新增内容后应重新执行 `npm run validate`。
