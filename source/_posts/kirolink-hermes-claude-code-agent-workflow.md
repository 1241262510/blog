---
title: 使用 kirolink 打通 Hermes、Kiro 与 Claude Code
date: 2026-05-25 02:20:00
tags:
  - kirolink
  - hermes
  - claude-code
  - kiro
  - agent
categories:
  - AI 工具
description: 记录如何用 kirolink 读取 Kiro 的 SSO token，暴露 Anthropic 兼容 API，让 Hermes Agent 和 Claude Code 通过 Kiro 后端运行。
index_img: /assets/kirolink-hermes-claude-code-cover.png
---

![](/assets/kirolink-hermes-claude-code-cover.png)

> 让 Hermes Agent 和 Claude Code 通过 Kiro（AWS CodeWhisperer 后端）运行，绕过 Anthropic 原生计费。

## 概述

| 组件 | 作用 |
| --- | --- |
| **Kiro CLI** | AWS CodeWhisperer 驱动的 AI 编程助手，通过 AWS SSO 认证 |
| **kirolink** | 轻量级 Go 代理，读取 Kiro 的 SSO token，暴露 Anthropic 兼容 API |
| **Hermes Agent** | Nous Research 的 AI Agent 框架，支持多 provider |
| **Claude Code** | Anthropic 官方 CLI 编程助手 |

架构链路：

```text
Hermes / Claude Code -> kirolink (:9090) -> Kiro/AWS SSO -> AWS CodeWhisperer
```

## 前提条件

- Linux / macOS 系统
- AWS Builder ID 或 IAM Identity Center 账号（用于 Kiro 登录）
- 能够访问 `codewhisperer.us-east-1.amazonaws.com`

## 1. 安装 Go

`kirolink` 用 Go 编写，需要先安装 Go 来编译：

```bash
curl -fsSL https://go.dev/dl/go1.23.3.linux-amd64.tar.gz -o /tmp/go.tar.gz
rm -rf ~/.local/go
mkdir -p ~/.local
tar -C ~/.local -xzf /tmp/go.tar.gz
rm /tmp/go.tar.gz
echo 'export PATH=$HOME/.local/go/bin:$PATH' >> ~/.bashrc
export PATH=$HOME/.local/go/bin:$PATH
go version
# 输出: go version go1.23.3 linux/amd64
```

如果系统有 `sudo` 权限，也可以安装到 `/usr/local`。

## 2. 安装 Kiro CLI

使用官方一键安装脚本：

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

安装完成后，命令为 `kiro-cli`，位于 `~/.local/bin/`。

验证安装：

```bash
kiro-cli version
```

## 3. 编译 kirolink

克隆仓库并编译：

```bash
git clone https://github.com/alexandephilia/kiro-claude-proxy.git /tmp/kiro-claude-proxy
cd /tmp/kiro-claude-proxy
go build -o ~/.local/bin/kirolink kirolink.go
kirolink
# 输出帮助信息即编译成功
```

## 4. 登录 Kiro

这一步需要浏览器进行 AWS SSO 认证：

```bash
kiro-cli login
```

执行后会在浏览器打开登录页面，使用 AWS Builder ID 或 IAM 账号登录。

登录成功后 token 文件位于：

```bash
~/.aws/sso/cache/kiro-auth-token-cli.json
```

## 5. 处理 Token 文件

`kirolink` 默认读取 `kiro-auth-token.json`，而 Kiro CLI 生成的文件名带 `-cli` 后缀。创建软链接解决：

```bash
ln -sf ~/.aws/sso/cache/kiro-auth-token-cli.json ~/.aws/sso/cache/kiro-auth-token.json
```

验证 token 可读：

```bash
kirolink read
# 输出 Access Token / Refresh Token / Expires at
```

## 6. 启动 kirolink 代理

默认端口 8080，如果被占用可指定其他端口：

```bash
kirolink server 9090 &
```

验证代理运行正常：

```bash
curl -s http://localhost:9090/health
# OK

curl -s http://localhost:9090/v1/models | python3 -m json.tool
# 列出 14 个可用模型
```

测试一次 API 调用：

```bash
curl -s -X POST http://localhost:9090/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","messages":[{"role":"user","content":"hi"}],"max_tokens":50}'
```

正常响应示例：

```json
{
  "content": [
    {
      "text": "Hey! I'm Kiro. What are you working on?",
      "type": "text"
    }
  ],
  "model": "claude-sonnet-4.5",
  "role": "assistant",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 17,
    "output_tokens": 7
  }
}
```

## 7. 配置 Hermes Agent

> 如果你还没有安装 Hermes Agent，参考 [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/)。

### 修改 config.yaml

编辑 `~/.hermes/config.yaml`，修改 model 配置指向 `kirolink`：

```yaml
model:
  default: claude-sonnet-4-6
  provider: anthropic
  base_url: http://localhost:9090
```

### 设置 API Key

Hermes 使用 `ANTHROPIC_API_KEY` 环境变量。获取当前 Kiro token 并写入 `.env`：

```bash
TOKEN=$(kirolink read | grep "Access Token:" | cut -d' ' -f3)
echo "ANTHROPIC_API_KEY=$TOKEN" >> ~/.hermes/.env
echo "ANTHROPIC_BASE_URL=http://localhost:9090" >> ~/.hermes/.env
```

### 测试 Hermes

```bash
hermes -z "say hello in 3 words"
# 输出: Hey there, friend.
```

## 8. 配置 Claude Code

> Claude Code 的安装参见[官方文档](https://code.claude.com/)。

通过环境变量指向 `kirolink` 代理：

```bash
export ANTHROPIC_BASE_URL=http://localhost:9090
export ANTHROPIC_API_KEY=$(kirolink read | grep "Access Token:" | cut -d' ' -f3)
claude "介绍一下你自己"
```

也可以使用 `kirolink` 的 `claude` 命令自动配置：

```bash
kirolink claude
eval "$(kirolink export)"
claude
```

## 9. Token 刷新

Kiro 的 token 有过期时间。`kirolink` 会自动从 Kiro CLI 的 SQLite 数据库同步 token：

```bash
kirolink refresh
```

如果 Hermes 或 Claude Code 遇到 403 错误，重新运行 `refresh` 并更新环境变量即可。

## 10. 日常使用

每次新开终端时：

```bash
# 确保代理在运行
kirolink server 9090 &

# 使用 Hermes
hermes

# 或使用 Claude Code
export ANTHROPIC_BASE_URL=http://localhost:9090
export ANTHROPIC_API_KEY=$(kirolink read | grep "Access Token:" | cut -d' ' -f3)
claude
```
