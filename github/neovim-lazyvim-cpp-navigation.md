---
title: 用 C++ 项目测试 Neovim LazyVim 的代码跳转
date: 2026-06-26 10:00:00
tags:
  - C++
  - Neovim
  - LazyVim
  - clangd
categories:
  - 编程
description: 用一个小型 C++ 项目练习 LazyVim 里的 LSP 代码跳转，包括 gd、gD、gr、gI、gy、Telescope 符号搜索和跳转历史。
---

在学习 Neovim 的过程中，代码跳转是最核心的日常操作之一。光靠文档记快捷键很枯燥，不如动手建一个真实的 C++ 项目来边用边学。

## 项目结构

```text
nav_demo/
├── CMakeLists.txt
├── compile_commands.json
├── animal.hpp / animal.cpp   ← 抽象基类
├── dog.hpp / dog.cpp         ← 继承子类
├── utils.hpp / utils.cpp     ← 工具函数（命名空间）
└── main.cpp                  ← 入口
```

三层结构刚好覆盖跳转的几个典型场景：**跨文件跳转**、**虚函数跳转到实现**、**命名空间内的函数引用**。

![用小型 C++ 项目练习 LazyVim 代码跳转](/assets/neovim-lazyvim-cpp-navigation-illustrations/01-code-practice-field.png)

## 前置：让 clangd 认识你的项目

LazyVim 的跳转依赖 `clangd` LSP，clangd 需要 `compile_commands.json` 才能理解项目的编译依赖关系。

```bash
cmake -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
cp build/compile_commands.json .
cmake --build build && ./build/nav_demo
```

输出：

```text
Rex (age 3) says: Woof!
Buddy (age 7) says: Woof!
Max (age 1) says: Woof!
Animals older than 2: 2
```

把 `compile_commands.json` 放到项目根目录，clangd 启动时会自动找到它。没有这个文件，跳转功能会大打折扣。

![compile_commands.json 让 clangd 读懂项目](/assets/neovim-lazyvim-cpp-navigation-illustrations/02-clangd-project-pass.png)

## 跳转命令实战

![LazyVim LSP 跳转命令像代码地下通道](/assets/neovim-lazyvim-cpp-navigation-illustrations/03-lsp-jump-tunnels.png)

```bash
nvim nav_demo/main.cpp
```

### gd - 跳转到定义

`main.cpp` 里调用了 `utils::printAll`：

```cpp
// main.cpp
utils::printAll(animals);   // 光标在 printAll 上，按 gd
```

按 `gd` 后跳进 `utils.cpp`，看到函数体：

```cpp
// utils.cpp
void printAll(const std::vector<std::unique_ptr<Animal>>& animals) {
    for (const auto& a : animals)
        printAnimal(*a);       // 再按 gd 可以继续跳进 printAnimal
}
```

光标在 `Dog` 类名上按 `gd`，跳到 `dog.hpp` 的类定义：

```cpp
// dog.hpp
class Dog : public Animal {   // gd 落点
public:
    Dog(const std::string& name, int age, const std::string& breed);
    std::string speak() const override;
    ...
};
```

### gD - 跳转到声明

在 `utils.cpp` 里光标放在 `printAnimal` 上，按 `gD` 跳回头文件的声明行：

```cpp
// utils.hpp  gD 落点
void printAnimal(const Animal& animal);
```

`.cpp` ↔ `.hpp` 来回切换，比手动搜索快得多。

### gr - 查找所有引用

光标放在 `Animal` 类名上，按 `gr`，弹出列表：

```text
animal.hpp:4   class Animal {
dog.hpp:2      #include "animal.hpp"
dog.hpp:4      class Dog : public Animal {
utils.hpp:2    #include "animal.hpp"
utils.hpp:7    void printAnimal(const Animal& animal);
main.cpp:7     std::vector<std::unique_ptr<Animal>> animals;
```

这是重构前的必备操作：改名之前先看清楚影响范围。

### gI - 跳转到实现

`animal.hpp` 里声明了纯虚函数：

```cpp
// animal.hpp
virtual std::string speak() const = 0;   // 光标在 speak 上，按 gI
```

列出所有具体实现：

```cpp
// dog.cpp  gI 落点
std::string Dog::speak() const { return "Woof!"; }
```

项目有多个子类时，这个命令能快速找到“到底谁实现了这个接口”。

### gy - 跳转到类型定义

`main.cpp` 里光标放在变量 `animals` 上：

```cpp
std::vector<std::unique_ptr<Animal>> animals;   // 光标在 animals 上，按 gy
```

跳到 `Animal` 的类型定义，也就是 `animal.hpp`。遇到不熟悉的类型时最好用。

## 符号搜索（Telescope）

上面的命令都是“从当前光标出发”，下面两个是“主动搜索”：

| 快捷键 | 功能 |
|--------|------|
| `<leader>ss` | 列出当前文件所有符号 |
| `<leader>sS` | 全局搜索符号 |

`<leader>sS` 输入 `speak`，会列出声明和所有实现，基于 LSP 语义，不是文本匹配，比 `grep` 精准。

## 跳转历史：来回穿梭

连续跳了几层，比如 `main → utils.cpp → animal.hpp` 之后：

- `<C-o>`：跳回上一个位置
- `<C-i>`：向前跳

养成习惯：跳过去看完，`<C-o>` 回来继续，不要迷失在文件里。

## 速查表

| 场景 | 命令 |
|------|------|
| 看函数/类的具体实现 | `gd` |
| 从实现跳回声明 | `gD` |
| 找这个符号被谁用了 | `gr` |
| 虚函数找子类实现 | `gI` |
| 不认识这个类型 | `gy` |
| 当前文件有哪些符号 | `<leader>ss` |
| 全局找某个符号 | `<leader>sS` |
| 跳回来 | `<C-o>` |

`gd` 和 `gr` 是最高频的两个，先把这两个练熟就够用了。
