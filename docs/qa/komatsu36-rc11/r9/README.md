# RC 0.11 R9 QA — Final review-branch acceptance

> 状态：通过；RC 0.11 review branch acceptance complete
> 路由：`/projects/komatsu36/`
> 构建方式：Astro build 后 `astro preview`，不是 dev route

## Source / build gates

```text
npm ci
npm audit --omit=dev
npm run validate
npm exec -- tsc --noEmit
git diff --check
npm run audit:payload -- komatsu36
```

- `npm ci`：通过；安装 1,382 packages。完整 dev dependency audit 报告仍含 dev-only Tina/GraphQL 风险，不作为生产依赖结论。
- `npm audit --omit=dev`：`found 0 vulnerabilities`。
- `npm run validate`：项目、52/52 reader-copy、Astro 7 pages、publication gate 全部通过。
- publication：raw `261,080` bytes；`search.json` 158 项；初始 Source Event buttons `0`；controller coverage 124；无 private source markers。
- `npm exec -- tsc --noEmit` 与 `git diff --check`：通过。
- `audit:payload`：Gzip level 9 `46,163`，Brotli quality 11 `29,420`，raw hard gate `358,400`，余量 `97,320`；Timeline 104 cards / 104,738 bytes，Source Index 0 initial buttons + 3 hosts / 609 bytes，Search 0 initial items / 1,232 bytes，Thread 16 / 33,903 bytes，Person 18 / 66,983 bytes，Controller 124 / 22,090 bytes；`stale: false`。

## Viewport matrix

| Viewport | Timeline Navigator | Navigator segments | Project overflow | Rail initial |
|---|---|---:|---:|---|
| 1366×768 | visible | 8 | 0 | hidden until Event |
| 1440×900 | visible | 8 | 0 | hidden until Event |
| 1920×1080 | visible | 8 | 0 | hidden until Event |
| 390×844 | hidden by R6 contract | 8 in DOM, not rendered | 0 | mobile fallback |

桌面 Navigator 按 Act 真实时长比例显示；A08 jump 后 header 在 sticky Navigator 下方约 188px，URL 保持 `?view=timeline` 且没有 `act=`。R6 已明确手机不增加第三条 sticky bar。

## Interaction matrix

- 五 View：Overview / Timeline / Storylines / People / Transcript 均可切换，URL 与 visible panel 同步，overflow `0`。
- Source Index：构建后首次浏览生成 YT `104`、SP1 `8`、SP2 `12`，每轨只显示自身 host，重复展开不重复追加；Space 公开 fixture 为 19 个 1-Thread、1 个 2-Thread、0 个 0-Thread Event。
- Search：focus 首次加载公开 JSON `158` 项；`章鱼烧` 生成 8 项，Event TARGET `01:15:22`；从该 Space/Event 状态再搜 `时限炸弹` 并打开 Thread，URL 为 `?view=storylines&event=yt-011522-takoyaki-proposed&thread=russian-takoyaki`。
- People：Lead `komatsu-shohei` 可见，Birthday participant grid 不重复 lead；390px Cast mobile 显示且页面 overflow `0`。打开 `uchida-shuichi` 后按 Escape 关闭，URL 恢复 `?view=people`，焦点回到原按钮。
- Thread / source：Storyline `russian-takoyaki` 可打开 overlay/detail；页面包含 2 个 canonical `/i/spaces/` 外链；Thread / Person 面板与外部来源路径不污染 URL schema。
- Player Rail：有 Event 时显示 Node、Axx、Thread slot、原链四类动作（前三个直接/slot 结构），无 Event 时隐藏；1440px overflow `0`。
- 应用 console：`tabP1.dev.logs()` 返回 `[]`；浏览器外部 Statsig telemetry timeout 不计入应用错误。

## F/G/E 与未执行边界

- UX11-E：R6 已裁决 `NO ADDITIONAL MOBILE NAV FOR V1`，R7 `NOT REQUIRED`。
- UX11-F Playback playhead：`DEFERRED BY DEFAULT`，保留 Media Position / Reading Position 分离；本批不接播放器自动 current time。
- UX11-G Quick / Detail：`NOT NEEDED FOR V1`；R5 Navigator 已解决 Act 找回问题，未证明需要折叠 reader content。
- Search JSON 故障注入、真实 0-Thread Space consumer sample、真实音频/长时播放、自动播放器同步不滚动与 history 证据：`TODO consumer-check` 或 `NOT EXECUTED`，不提升为 release-accepted。
- production preview、merge、deploy、Cloudflare Pages 真实回归与 Release Gate：`NOT EXECUTED`，仍等待用户独立授权。
