---
title: 免费试用 Claude Code 一个月：Kiro 注册教程
date: 2026-05-19 10:00:00
tags:
  - claude-code
  - kiro
  - ai
  - 教程
categories:
  - AI 工具
description: 记录如何通过亚马逊 Kiro 平台注册并免费试用一个月 Pro 套餐，以及国内用户支付验证和取消自动续费的操作过程。
index_img: /assets/kiro-signin-home.png
---

通过亚马逊 `Kiro` 平台，国内用户可以免费体验一个月 `Pro` 套餐，享受完整的 `Claude Code` 能力。

官网地址：

```text
https://kiro.dev/
```

## 前置条件

- 一个 Google 邮箱，或其他支持的登录方式
- 一张可用于国际验证的银行卡，详见下方支付章节
- 需要是新注册账号，老账号可能不适用这次试用政策

## 注册流程

1. 访问 `https://kiro.dev/`，点击 `Sign-in` 进行注册登录。

![](/assets/kiro-signin-home.png)

2. 选择登录方式，支持 `Google` 邮箱等多种方式。

![](/assets/kiro-signin-methods.png)

3. 我这里选择了 `Google` 邮箱注册登录。

![](/assets/kiro-google-login.png)

4. 注册完成后进入对话页面，风格与 `Codex`、`Claude Code` 类似，同时也提供了 `CLI` 命令行交互方式。

![](/assets/kiro-chat-ui.png)

![](/assets/kiro-cli-ui.png)

## 模型选择

平台集成了多个主流大模型，可以根据需求灵活切换：

- **Auto 模式**：日常开发推荐，费用最低，约为其他模型的一半
- **高级模型**：遇到复杂问题时切换使用，效果更好，但消耗更多额度

建议策略是：日常用 `Auto` 省额度，关键问题再切高级模型突破。

## 支付验证

注册时需要绑定一张银行卡用于验证。关于国内卡的兼容性，实测结果如下：

| 卡类型 | 结果 |
| --- | --- |
| 中信银行单币借记卡 | ✅ 通过 |
| 银联卡（页面有银联标识） | ❌ 无法通过 |
| 虚拟代币卡 | ❌ 无法通过 |

结论是：网页端订阅验证较严格，建议优先使用正规银行发行的 `Visa` 或 `Mastercard` 借记卡、信用卡。

填写信息时，我的经验是：

- **姓名**：填拼音，且要和银行卡持卡人一致
- **账单地址**：直接填写国内地址，中文即可
- **其他信息**：中文即可

点击订阅后会触发手机短信验证码。由于我申请中信借记卡时预留的是国内手机号，所以验证一次通过。

![](/assets/kiro-billing-form.png)

![](/assets/kiro-sms-verify.png)

## 取消订阅

如果只是想免费试用一个月，建议注册后立即取消自动续费，不影响当月使用。

1. 访问账户管理页面：

```text
https://app.kiro.dev/account/usage
```

![](/assets/kiro-account-usage.png)

2. 点击“管理计划”，选择更改订阅。

![](/assets/kiro-manage-plan.png)

3. 选择更改为 `Free` 套餐。逻辑是：当前免费试用的 `Pro` 套餐在到期后自动降级为 `Free`，期间 `Pro` 功能仍然可以正常使用。

![](/assets/kiro-change-to-free.png)

![](/assets/kiro-plan-confirm.png)

4. 按照提示确认更改即可。

## 总结

| 要点 | 说明 |
| --- | --- |
| 适用卡种 | 国内 Visa/Mastercard 信用卡，或单币种外币借记卡 |
| 填写信息 | 姓名填拼音，地址等信息可直接填中文 |
| 账号要求 | 需要新注册账号，老号可能没有试用资格 |
| 试用时长 | 一个月 Pro 套餐，建议注册后立即改为 Free，避免到期自动扣费 |
| 优势 | 通过亚马逊 Kiro 中转使用 Claude Code，整体注册和试用流程更顺手 |
