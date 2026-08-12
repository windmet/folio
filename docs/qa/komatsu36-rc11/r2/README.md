# RC 0.11 R2 QA — Payload Audit Instrumentation

> 状态：通过，随 R2 工程批次提交
> 范围：仅 audit script、package entry、文档；不改页面 DOM、URL、schema 或运行时行为

## 固定命令

```text
npm run build
npm run audit:payload -- komatsu36
npm run validate
npm exec -- tsc --noEmit
git diff --check
```

## 当前 audit 输出

| 指标 | 结果 |
|---|---:|
| Raw HTML | 354,388 bytes |
| Gzip level 9 | 69,334 bytes |
| Brotli quality 11 | 35,690 bytes |
| Raw hard gate / remaining | 358,400 / 4,012 bytes |
| Timeline Event cards / bytes | 104 / 101,551 |
| Source Event Index buttons / bytes | 124 / 24,973 |
| Search items / bytes | 158 / 73,355 |
| Thread details / node buttons / bytes | 16 / 84 / 33,903 |
| Person details / Event rows / bytes | 18 / 213 / 66,983 |
| Controller JSON bytes / Event records | 22,090 / 124 |

审计输出为 `schema_version: 1` JSON。Raw 使用 UTF-8 byte length；压缩参数固定为 Gzip level 9 与 Brotli quality 11；section bytes 和 projection counts 使用脚本内固定 marker / data attribute 规则。构建输出 mtime 晚于最新 source input，`stale: false`。

## 失败边界

- `node scripts/audit-payload.mjs missing-project` 以非零退出，并明确输出 `build output is missing ... Run npm run build first`；
- source mtime 晚于 `dist/projects/<slug>/index.html` 时以非零退出，并明确要求先 build；
- 不存在静默读取缺失或过期 dist 的路径。

浏览器 UI、真实音频、长时播放与 production preview 不属于 P0 批次；R1 的浏览器证据仍保存在 `docs/qa/komatsu36-rc11/r1/`。
