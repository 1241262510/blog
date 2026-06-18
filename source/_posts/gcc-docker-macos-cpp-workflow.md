---
title: 在 Mac 上用 Docker 跑 GCC：一套干净的 C++ 编译环境
date: 2026-06-18 10:00:00
tags:
  - docker
  - gcc
  - cpp
  - macos
categories:
  - 工具教程
description: 记录在 macOS 上通过官方 GCC Docker 镜像编译和运行 C++ 代码的完整流程，顺便解释 M 系列 Mac 上容易遇到的可执行文件格式问题。
---

在 macOS 上，尤其是 M 系列芯片的 Mac 上，用 Docker 配置 GCC 编译环境是一种很省心的方案。它可以把编译环境和宿主机隔离开，避免污染系统，同时也能让项目在接近 Linux 的环境里编译和运行。

这篇文章记录一套最小可用流程：通过 [gcc 官方 Docker 镜像](https://hub.docker.com/_/gcc/) 搭建环境，并编译运行一段 C++ 代码。

## 第一步：准备 macOS 和 Docker

需要先准备好三件事：

1. 安装 Docker Desktop。如果还没有安装，可以去 Docker 官网下载适用于 Mac 的 Docker Desktop，M 芯片用户选择 Apple Chip 版本。
2. 启动 Docker。确认菜单栏里的 Docker 图标已经正常运行。
3. 打开终端。可以使用 macOS 自带 Terminal，也可以使用 Ghostty 或 iTerm2。

先创建一个测试目录：

```bash
mkdir -p ~/lessons/docker/cpp
cd ~/lessons/docker/cpp
```

## 第二步：编写一段 C++ 测试代码

在当前目录下创建 `main.cpp`：

```bash
cat <<EOF > main.cpp
#include <iostream>

int main() {
    std::cout << "Hello from GCC Docker inside macOS!" << std::endl;
    return 0;
}
EOF
```

代码很简单，只负责打印一行文本。重点不在 C++ 本身，而在后面的编译和运行方式。

## 第三步：用 Docker 编译并运行

直接执行下面这行命令：

```bash
docker run --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp gcc:latest sh -c "g++ -o myapp main.cpp && ./myapp"
```

这条命令会完成两件事：

- 在 Docker 容器里用 `g++` 编译 `main.cpp`
- 编译成功后，立刻在同一个容器里运行生成的 `myapp`

运行结果应该类似这样：

```text
Hello from GCC Docker inside macOS!
```

## 命令拆解

这行命令虽然长，但结构很清楚：

- `--rm`：容器运行结束后自动删除，避免留下无用容器。
- `-v "$PWD":/usr/src/myapp`：把 Mac 当前目录挂载到容器里的 `/usr/src/myapp`，这样容器可以直接读写你的源码文件。
- `-w /usr/src/myapp`：把容器启动后的工作目录设置为 `/usr/src/myapp`。
- `gcc:latest`：使用 Docker Hub 上的官方 GCC 镜像。
- `sh -c "..."`：让容器内的 shell 连续执行多条命令。
- `g++ -o myapp main.cpp`：把源码编译成名为 `myapp` 的可执行文件。
- `&& ./myapp`：只有编译成功，才继续运行 `myapp`。

这里最关键的一点是：编译和运行都发生在容器内。

## 为什么不要直接在 Mac 上运行 myapp

执行完上面的命令后，你会发现本地目录里多了一个 `myapp` 文件。这是因为目录被挂载进了容器，容器里生成的文件会同步出现在 Mac 本地目录。

但不要直接在 Mac 终端里执行：

```bash
./myapp
```

大概率会看到类似报错：

```text
zsh: exec format error: ./myapp
```

原因不是 C++ 写错了，而是这个文件是容器里的 Linux 工具链编译出来的 Linux 可执行文件。macOS 不能直接运行 Linux ELF 格式的二进制文件。

在 M 系列 Mac 上还需要额外注意一点：默认情况下，Docker 通常会拉取和当前机器匹配的 Linux ARM64 镜像；如果你显式加上 `--platform linux/amd64`，才会进入 x86_64 Linux 环境。无论是哪一种，只要产物是 Linux 可执行文件，macOS 都不能直接运行。

所以这套工作流的原则很简单：

- 用 Docker 编译 Linux 程序，就在 Docker 里运行它。
- 想在 macOS 本地运行，就使用 macOS 原生工具链，例如 Xcode Command Line Tools 里的 `clang++`。

## 进阶：用 Dockerfile 固化流程

如果你在做一个正式 C++ 项目，每次手敲一长串 `docker run` 命令并不舒服。可以用 `Dockerfile` 固化编译和运行流程。

在 `main.cpp` 同级目录下创建 `Dockerfile`：

```dockerfile
FROM gcc:latest

WORKDIR /app

COPY . .

RUN g++ -o myapp main.cpp

CMD ["./myapp"]
```

然后构建镜像：

```bash
docker build -t my-cpp-app .
```

运行镜像：

```bash
docker run --rm my-cpp-app
```

这样源码、编译环境和运行命令都被封装进镜像里。只要对方机器上有 Docker，就可以用同样方式运行。

## 关于镜像体积

官方 `gcc:latest` 镜像包含完整 GNU 工具链，体积不会太小。学习、测试和本地编译完全够用，但如果要把程序部署到生产环境，可以考虑多阶段构建。

常见做法是：

1. 第一阶段使用 `gcc` 镜像编译程序。
2. 第二阶段使用 `debian:slim` 或 `ubuntu:slim` 之类的轻量镜像。
3. 只把编译好的二进制文件复制到最终镜像里。

这样最终镜像会小很多，也更适合分发。

## 总结

在 Mac 上用 Docker 跑 GCC，最重要的是理解边界：

- Docker 负责提供隔离的 Linux 编译环境。
- 挂载目录让容器能读写本地源码。
- Linux 编译产物应该在 Linux 容器里运行。
- macOS 本地运行需要 macOS 原生工具链。

对学习 C++、测试 Linux 编译环境，或者临时验证一段代码来说，这套方案足够干净，也足够高效。
