---
title: CMake + C++23 + LazyVim 的最小配置流程
date: 2026-06-25 10:00:00
tags:
  - C++
  - CMake
  - LazyVim
  - clangd
categories:
  - 编程
description: 记录一套最小 CMake + C++23 + LazyVim/clangd 项目配置流程，让编译参数、编辑器提示和日常练习保持一致。
---

## 摘要

这是一套适合日常学习 C++23 的最小配置：用 `CMake` 负责真实编译，用 `clangd` 负责 LazyVim 里的语法检查和代码提示，再用 `compile_commands.json` 把两边的编译参数统一起来。

目标不是搭一个复杂工程，而是先把“能写、能提示、能编译、能运行”这条链路打通。

![](/assets/cpp23-cmake-lazyvim-workflow-illustrations/01-compile-params-align.png)

## 项目结构

一个最小项目可以长这样：

```text
cpp23-cmake-study/
├── CMakeLists.txt
├── .clangd
├── compile_commands.json
├── build/
└── src/
    └── main.cpp
```

几个关键文件的作用：

```text
CMakeLists.txt          控制编译，指定 C++23
.clangd                 告诉 clangd / LazyVim 按 C++23 检查
compile_commands.json   给 clangd 提供真实编译参数
src/main.cpp            日常写代码的位置
build/                  CMake 生成的构建目录
```

## 第一次配置

先进入项目目录。这里用通用路径举例，实际按自己的目录替换：

```bash
cd ~/code/cpp23-cmake-study
```

生成构建目录，并导出 `compile_commands.json`：

```bash
cmake -S . -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
```

把编译参数文件链接到项目根目录，方便 `clangd` 读取：

```bash
ln -sf build/compile_commands.json compile_commands.json
```

编译项目：

```bash
cmake --build build
```

运行程序：

```bash
./build/cpp23_study
```

## 日常使用

平时打开代码：

```bash
nvim src/main.cpp
```

修改代码后，回到终端编译：

```bash
cmake --build build
```

再运行：

```bash
./build/cpp23_study
```

多数时候，日常循环只需要这两个命令：

```bash
cmake --build build
./build/cpp23_study
```

![](/assets/cpp23-cmake-lazyvim-workflow-illustrations/02-daily-build-loop.png)

## 在 LazyVim 里检查 LSP

打开 `src/main.cpp` 后执行：

```vim
:LspInfo
```

如果能看到 `clangd`，说明 C++ 语法检查和提示已经启动。

常用快捷键：

```text
<Space> c d    查看当前行错误
<Space> c a    尝试自动修复
<Space> c f    格式化代码
]d             跳到下一个错误
[d             跳到上一个错误
```

## 写新练习

初学阶段可以先直接改：

```text
src/main.cpp
```

例如这些内容都可以先放在 `main.cpp` 里练：

- 变量
- 函数
- `vector`
- `string`
- `class`
- `ranges`
- `std::println`
- `std::expected`

等练习变多之后，再考虑拆成多个源文件或多个小项目。

## 新建另一个练习项目

如果已经有一个可用模板，可以直接复制一份：

```bash
cp -R cpp23-cmake-study cpp23-vector-study
cd cpp23-vector-study
rm -rf build compile_commands.json
cmake -S . -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
ln -sf build/compile_commands.json compile_commands.json
cmake --build build
```

然后打开：

```bash
nvim src/main.cpp
```

这样新项目会重新生成自己的构建目录和编译参数文件，避免复用旧项目里的缓存。

![](/assets/cpp23-cmake-lazyvim-workflow-illustrations/03-copy-template-clean-cache.png)

## 最重要的顺序

可以把整个流程记成下面这几步：

```text
1. cd 到项目目录
2. nvim src/main.cpp 写代码
3. :LspInfo 确认 clangd 正常
4. cmake --build build 编译
5. ./build/cpp23_study 运行
6. 根据错误提示修改代码
7. 重复 4-6
```

## 总结

这套配置的核心只有一句话：

```text
CMake 负责真实编译，clangd 负责编辑器提示，compile_commands.json 负责让两者使用同一套编译参数。
```

只要这三者对齐，LazyVim 里的提示和终端里的真实编译结果就不会各说各话。后面无论是练 C++ 基础，还是逐步学习 C++23 的新特性，都可以从这个最小工程开始。
