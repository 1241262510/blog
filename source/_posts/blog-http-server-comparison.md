---
title: 三种语言实现 HTTP 服务对比：C++ vs Rust vs Go
date: 2026-06-25 10:00:00
tags:
  - C++
  - Rust
  - Go
  - HTTP
  - 后端开发
categories:
  - 编程实践
description: 用 C++、Rust、Go 分别实现同一个 HTTP 服务，从代码量、上手难度、编译速度、内存安全、并发模型和部署体验几个维度做一次直观对比。
index_img: /assets/01-same-http-exam.svg
---

## 缘起

最近在做一个 HTTP 服务的小项目，想选一个上手快、性能好、适合落地的语言。于是用 **C++ (cpp-httplib)**、**Rust (tiny_http)**、**Go (net/http)** 分别实现了一个功能相同的 HTTP 服务，记录一下体验。

## 功能需求

三种语言实现相同的四个接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/hi` | GET | 返回 "Hello World!" |
| `/json` | GET | 返回 JSON `{"message":"...","status":"ok"}` |
| `/echo?msg=xxx` | GET | 返回 query 参数 msg 的值 |
| `/post` | POST | 接收 body，返回 JSON `{"received":"..."}` |
| 其他路径 | 任意 | 返回 404 |

![同一组 HTTP 接口需求](/assets/01-same-http-exam.svg)

## C++ (cpp-httplib)

**源码位置**: `cpp-httplib/example.cc`

```cpp
#include "httplib.h"

int main() {
    httplib::Server svr;

    svr.Get("/hi", [](const auto& req, auto& res) {
        res.set_content("Hello World! From C++", "text/plain");
    });

    svr.Get("/json", [](const auto& req, auto& res) {
        res.set_content(R"({"message":"Hello from C++","status":"ok"})", "application/json");
    });

    svr.Get("/echo", [](const auto& req, auto& res) {
        auto msg = req.has_param("msg") ? req.get_param_value("msg") : "no message";
        res.set_content(msg, "text/plain");
    });

    svr.Post("/post", [](const auto& req, auto& res) {
        res.set_content(R"({"received":")" + req.body + R"("})", "application/json");
    });

    svr.listen("0.0.0.0", 8080);
}
```

**特点**:
- 代码最简洁，**lambda + 链式调用**，非常直观
- 单头文件库，零配置引入
- 跨平台，无外部依赖
- 需要手动处理 JSON 序列化（没有标准库 json）

![C++ cpp-httplib 工具箱](/assets/02-cpp-httplib-toolbox.svg)

## Rust (tiny_http)

**源码位置**: `/tmp/rust-server/src/main.rs`

```rust
use tiny_http::{Header, Method, Response, Server};

fn main() {
    let server = Server::http("0.0.0.0:8080").unwrap();

    for mut request in server.incoming_requests() {
        let full_url = request.url().to_string();
        let path = full_url.split('?').next().unwrap().to_string();
        let query = full_url.split('?').nth(1).unwrap_or("");
        let json_h = "Content-Type: application/json".parse::<Header>().unwrap();
        let text_h = "Content-Type: text/plain; charset=utf-8".parse::<Header>().unwrap();

        let response = match (request.method(), path.as_str()) {
            (&Method::Get, "/hi") =>
                Response::from_string("Hello World! From Rust").with_header(text_h),

            (&Method::Get, "/json") =>
                Response::from_string(r#"{"message":"Hello from Rust","status":"ok"}"#)
                    .with_header(json_h),

            (&Method::Get, "/echo") => {
                let msg = query.split('&')
                    .find(|p| p.starts_with("msg="))
                    .map(|p| &p[4..]).unwrap_or("no message");
                Response::from_string(msg).with_header(text_h)
            }

            (&Method::Post, "/post") => {
                let mut body = String::new();
                request.as_reader().read_to_string(&mut body).unwrap();
                Response::from_string(format!(r#"{{"received":"{}"}}"#, body.trim()))
                    .with_status_code(201).with_header(json_h)
            }

            _ => Response::from_string(r#"{"error":"Not Found"}"#)
                    .with_status_code(404).with_header(json_h),
        };

        request.respond(response).unwrap();
    }
}
```

**特点**:
- 类型安全，编译期捕获错误
- 需要手动处理 `mut`、`unwrap`、query 解析等样板代码
- 生态库质量高，但选择成本高
- 编译较慢，二进制体积小

![Rust tiny_http 安全闸机](/assets/03-rust-safety-gate.svg)

## Go (net/http)

**源码位置**: `cpp-httplib/my_server_go/main.go`

```go
package main

import (
    "encoding/json"
    "io"
    "log"
    "net/http"
    "strings"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/hi", handleHi)
    mux.HandleFunc("/json", handleJSON)
    mux.HandleFunc("/echo", handleEcho)
    mux.HandleFunc("/post", handlePost)
    log.Fatal(http.ListenAndServe(":8080", mux))
}

func handleHi(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.Write([]byte("Hello World! From Go"))
}

func handleJSON(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Hello from Go", "status": "ok",
    })
}

func handleEcho(w http.ResponseWriter, r *http.Request) {
    msg := r.URL.Query().Get("msg")
    if msg == "" { msg = "no message" }
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    w.Write([]byte(msg))
}

func handlePost(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    json.NewEncoder(w).Encode(map[string]string{
        "received": strings.TrimSpace(string(body)),
    })
}
```

**特点**:
- 标准库即框架，`net/http` + `encoding/json` 开箱即用
- 语法极简，无泛型/宏/生命周期负担
- goroutine 实现高并发，性能接近 C++
- 编译极快，单二进制部署

![Go net/http 标准库工作台](/assets/04-go-standard-workbench.svg)

## 对比总结

| 维度 | C++ (cpp-httplib) | Rust (tiny_http) | Go (net/http) |
|------|------------------|------------------|---------------|
| 代码量 | 最少 | 最多 | 中等 |
| 上手难度 | 低（有 C 基础） | 高（所有权/借用） | **最低** |
| 编译速度 | 快 | 慢 | **极快** |
| 内存安全 | 手动管理 | 编译期保证 | GC 保证 |
| 并发模型 | 线程池 | async/线程 | **goroutine** |
| 标准库 HTTP | 无（第三方库） | 无（第三方库） | **内置** |
| 部署 | 动态/静态链接 | 单二进制 | **单二进制** |
| 适合场景 | 嵌入式/存量 C++ | 高安全需求 | **通用后端** |

## 个人推荐

如果不用 C++ 或 Rust，**Go 是最平衡的选择**：

- 上手速度：几天即可产出
- 运行性能：接近 C++，远高于 Python/Node
- 生产成熟度：Docker/K8s/Terraform 等顶级项目均用 Go
- 开发体验：`go fmt` / `go test` / `go build` 一站式体验

> 当然，最终选择取决于团队背景和业务场景。没有银弹，只有最适合的工具。

*2026.06.25*
