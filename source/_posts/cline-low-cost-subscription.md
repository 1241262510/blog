---
title: Cline 的低成本订阅：该不该买？如何和 Claude Code 搭配
date: 2026-07-20
tags:
  - Cline
  - Claude Code
  - AI 编程
  - 订阅
categories:
  - AI 工具
description: 说明 ClinePass 与 Claude Pro/Max 的额度区别，介绍如何在 Cline 中复用 Claude Code 订阅，并给出不同使用场景的选择建议。
---

![Cline 的低成本订阅示意图](/assets/cline-low-cost-subscription-xiaohei.png)

## 先说结论

**ClinePass 是一张“开源模型月票”，不是 Claude 或 ChatGPT 的通票。**

如果已经有 **Claude Pro 或 Claude Max**，并且日常主要使用 Claude Code，那么通常**不需要再买 ClinePass**：在 Cline 中选择 `Claude Code` 作为 Provider，就可以复用 Claude 订阅的额度。

如果想用较低成本在 Cline 里做代码任务，或想集中体验 DeepSeek、Kimi、GLM、Qwen 等模型，ClinePass 值得作为补充。

> **关键区别：**不同 Provider 的额度彼此独立。购买 ClinePass 不会增加 Claude Code 的额度；Claude Pro/Max 也不会解锁 ClinePass 的开源模型月票。

## 终端安装与启动

官网提供 Cline CLI，也可以在 VS Code / Cursor 内安装扩展。

```bash
npm i -g cline
```

启动交互式会话：

```bash
cline
```

首次运行一般需要在浏览器中完成登录或授权。若使用 VS Code，则安装 Cline 扩展，打开其侧边栏后在设置中选择模型 Provider。

![Cline CLI 登录界面](/assets/cline-cli-login.png)

![Cline Provider 设置](/assets/cline-provider-settings.png)

## ClinePass：低价，但模型范围很明确

![ClinePass 订阅页面](/assets/clinepass-subscription.png)

首月有优惠，后续为按月订阅。它面向的是一组开源权重模型，常见选择包括：

- GLM
- Kimi
- DeepSeek
- MiniMax
- MiMo
- Qwen

这些模型适合在 Cline 的“读代码—修改—运行命令—验证”工作流里完成日常开发任务。它的优势是**省掉多家 API 账户、密钥与账单管理**，而不是用月费替代所有闭源大模型。

![ClinePass 可选模型](/assets/clinepass-models.png)

## 已经使用 Claude Code，怎样接入 Cline？

你不必购买 ClinePass。前提是你拥有 **Claude Pro 或 Claude Max**，并且本机的 Claude Code CLI 已经安装、登录。

在 Cline 中按下面操作：

1. 打开 Cline 侧边栏，进入设置。
2. 在 **API Provider** 中选择 **Claude Code**，不要选 `Anthropic`。
3. 填写 Claude CLI 路径；通常直接填 `claude` 即可。
4. 若 Cline 找不到命令，在终端执行：

   ```bash
   which claude
   ```

   将输出的完整路径填回 Cline。
5. 保存设置，发一条测试任务。

此模式会消耗你的 Claude Pro/Max 订阅额度，而不是 Anthropic API token 费用。限制是：部分图片上传、提示词缓存能力可能受限，回复也可能不是逐 token 流式出现。

## 三种方案，怎么选？

| 你的情况 | 推荐方案 | 是否需要 ClinePass |
| --- | --- | --- |
| 已有 Claude Pro/Max，主力用 Claude Code | 在 Cline 中选 `Claude Code` Provider | **不需要** |
| 希望低成本使用多种开源模型 | 订阅 ClinePass | **需要** |
| 偶尔用 Claude / GPT，按量付费可接受 | Cline Provider、Anthropic API 或 OpenAI API | **不需要** |
| 同时需要 Claude Code 与开源模型 | Claude Code 作为主力，ClinePass 作补充 | 可选 |

## 支付提醒：国内卡能不能用？

支付页会显示 Visa、Mastercard、American Express 和银联标识，因此国内银行卡并非一定不能用。但订阅扣款能否成功仍取决于发卡行：

- 优先使用带 Visa / Mastercard / UnionPay 标识的信用卡或双币卡；
- 确认已开通线上支付、跨境支付与自动续费；
- 账单姓名按卡面英文名填写；美元扣款可能产生换汇或跨境手续费；
- 纯银联卡若失败，通常是发卡行限制跨境或订阅扣款，而不是 Cline 页面本身不支持该卡种。

## 一句话建议

**Claude Code 用户：先接入已有订阅，别为用 Claude 重复付费。**

**想低成本多模型开发：把 ClinePass 当作开源模型补充，而不是 Claude/GPT 替代品。**

## 参考链接

- [ClinePass 模型与价格说明](https://cline.bot/aie-event)
- [Cline：Anthropic / Claude Code 配置](https://docs.cline.bot/provider-config/anthropic)
- [Cline Provider 与模型选择](https://docs.cline.bot/getting-started/authorizing-with-cline)
- [Cline 官方支付条款](https://cline.bot/tos)
