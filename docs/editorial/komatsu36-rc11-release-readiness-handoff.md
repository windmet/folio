# Komatsu36 RC 0.11 Release-readiness handoff

> 状态：REVIEW BRANCH ACCEPTANCE COMPLETE
> 分支：`codex/komatsu36-project-archive`
> 当前检查点：R9 Final QA 与 handoff 已完成；Release Gate 仍 CLOSED

## 已完成

- RC 0.10 A0 / A / B / C / D / E：本地验收完成。
- RC 0.11 UX11-A / B：`effa314`；UX11-C：`1162ba2`；R1：opaque Player / Lead Person hierarchy。
- R2 UX11-P0 payload audit；R3 UX11-P1 Dynamic Source Event Index；R4 UX11-P2 lazy static Search JSON；R5 UX11-D Desktop proportional Timeline Navigator。
- R6 UX11-E：基于 390×844 实测裁决 `NO ADDITIONAL MOBILE NAV FOR V1`；R7 不创建空实现。
- R8：F `DEFERRED BY DEFAULT`；G `NOT NEEDED FOR V1`。
- R9：四视口、五 View、Search、三 Source、Source Index、Player Rail、People lead、Cast mobile、Thread/Person overlay、focus/Escape、overflow、console 与 build gates 已记录在 `docs/qa/komatsu36-rc11/r9/README.md`。

## 当前 publication / payload

最终 review-branch baseline：raw `261,080`，Gzip `46,163`，Brotli `29,420`，raw hard gate `358,400`，余量 `97,320`。初始 HTML 不含 Source Event buttons 或 Search result buttons；静态 Search JSON 158 项；Timeline / Thread / Person reader content 保留。

## 仍需用户明确授权或真实环境执行

- 生产 preview / Cloudflare Pages 部署后的真实路由、缓存、headers 与回归；
- 真实音频播放、长时 soak、播放器自动同步与媒体网络噪声分类；
- Search JSON 网络失败注入与公开 0-Thread Space consumer sample；
- merge、`project.status` 变更、Release Gate 开启、正式 deploy。

这些边界不能由本地 build、静态 validator、noAudio 或短时浏览器 preview 推断为 `release-accepted`。下一步若要发布，只应以本 handoff 为输入另开发布事务，不在 review branch 自动 merge/deploy。
