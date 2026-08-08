---
project: komatsu36
title: "内田修一 LINE 电话：跨平台召唤惇太"
category: cross-platform
deck: 因为内田没有 X，主桌改用 LINE 电话；一声“想听惇太”又把另一房间的人召回 Space。
nodes:
  - event: komatsu36/yt-020555-uchida-call-announced
    role: setup
    transition: 主桌宣布电话后，小松转入 SP2——
  - event: komatsu36/sp2-011242-uchida-connected
    role: development
  - event: komatsu36/sp2-011723-terashima-requested
    role: development
  - event: komatsu36/sp2-012010-terashima-arrives
    role: payoff
featured: true
---

这条 Thread 的顺序是编辑顺序。YT 与 SP2 各自保留原生时钟，程序禁止按数值大小跨 Track 自动排序。
