---
title: "C++20 空基类优化：代码、测试与编译实践"
date: 2026-06-20 02:19:00
tags:
  - cpp
  - C++20
  - EBO
  - 编译器
categories:
  - C++
description: 用一份可运行的 C++20 示例比较普通空成员、传统 EBO 与 no_unique_address，并通过编译期检查、行为测试、Sanitizer 和布局信息验证结果。
---


## 一、实验目标

本实验比较五种情况：

1. 普通空成员；
2. 通过私有继承实现的传统 EBO；
3. C++20 `[[no_unique_address]]` 空成员；
4. 相同类型与不同类型的多个空成员；
5. 带有真实状态、不能被压缩为空的策略成员。

完整源代码可在这里下载：[ebo_cpp20.cpp](/blog/downloads/ebo_cpp20.cpp)。它同时包含编译期测试、运行时行为测试和对象布局观测。

## 二、核心代码

### 1. 普通成员

```cpp
struct EmptyPolicy {};

struct OrdinaryMember {
    EmptyPolicy policy;
    int value = 0;
};
```

即使 `EmptyPolicy` 没有数据成员，它作为完整对象时仍不能是零大小。作为普通成员时，它通常还会使 `int` 前后产生对齐填充。

### 2. 传统 EBO

```cpp
struct InheritanceEBO : private EmptyPolicy {
    int value = 0;

    EmptyPolicy& policy() noexcept {
        return *this;
    }
};
```

空策略被放进基类子对象。常见 ABI 会让空基类与派生对象使用相同起始地址，从而使整个对象通常只保留 `int` 所需的空间。

这里使用私有继承，是因为 `InheritanceEBO` 在业务语义上并不是一种 `EmptyPolicy`；继承只是存储实现。

### 3. C++20 成员压缩

```cpp
struct NoUniqueAddressMember {
    [[no_unique_address]] EmptyPolicy policy;
    int value = 0;
};
```

`[[no_unique_address]]` 表示该成员不必拥有独占的存储地址。编译器可以让它与其他成员或尾部填充复用空间。

它的优势是保留了组合语义：对象“拥有策略”，而不是“继承自策略”。现代 C++ 项目通常应优先考虑这种形式。

## 三、可复用的 C++20 策略容器

```cpp
template<class Policy>
class PolicyBox {
public:
    constexpr explicit PolicyBox(Policy policy = {})
        noexcept(std::is_nothrow_move_constructible_v<Policy>)
        : policy_(std::move(policy)) {}

    constexpr Policy& policy() noexcept { return policy_; }
    constexpr const Policy& policy() const noexcept { return policy_; }

    constexpr int& value() noexcept { return value_; }
    constexpr const int& value() const noexcept { return value_; }

private:
    [[no_unique_address]] Policy policy_;
    int value_ = 0;
};
```

该模板可以同时处理空策略和带状态策略：

```cpp
PolicyBox<EmptyPolicy> empty_box;
PolicyBox<StatefulPolicy> stateful_box{StatefulPolicy{7}};
```

空策略通常不增加对象大小；非空策略中的 `id` 必须被真实保存，不会因为属性而消失。

## 四、测试应该验证什么

### 1. 可移植的编译期测试

```cpp
static_assert(std::is_empty_v<EmptyPolicy>);
static_assert(!std::is_empty_v<StatefulPolicy>);
static_assert(sizeof(EmptyPolicy) >= 1);
```

这些结论可以作为严格测试。

### 2. 不应写成跨平台断言的内容

不要在通用库里假设：

```cpp
static_assert(sizeof(NoUniqueAddressMember) == sizeof(int));
```

`[[no_unique_address]]` 为实现提供布局优化能力，但具体 `sizeof` 仍受编译器、ABI、目标架构和对齐规则影响。因此示例程序打印大小和偏移量，却不会因为某个平台没有得到 `4` 字节而错误退出。

### 3. 行为测试

程序还验证了压缩存储没有破坏成员访问：

```cpp
PolicyBox<StatefulPolicy> box{StatefulPolicy{7}};
box.value() = 200;

assert(box.value() == 200);
assert(box.policy().id == 7);
```

源代码没有使用 `<cassert>`，而是在 `main` 中显式检查并返回非零退出码。这样即使使用 `-DNDEBUG` 编译，行为测试也不会被移除。

## 五、编译和运行

### Clang

```bash
clang++ -std=c++20 -Wall -Wextra -Wpedantic \
  -O2 ebo_cpp20.cpp -o ebo_cpp20_clang

./ebo_cpp20_clang
```

### GCC

```bash
g++ -std=c++20 -Wall -Wextra -Wpedantic \
  -O2 ebo_cpp20.cpp -o ebo_cpp20_gcc

./ebo_cpp20_gcc
```

### MSVC

在“x64 Native Tools Command Prompt for VS”中执行：

```bat
cl /std:c++20 /EHsc /W4 /O2 ebo_cpp20.cpp /Fe:ebo_cpp20_msvc.exe
ebo_cpp20_msvc.exe
```

## 六、验证标准版本

程序第一行会打印 `__cplusplus`：

```text
C++ version (__cplusplus): 202002
```

常见值包括：

- `201703L`：C++17；
- `202002L`：C++20；
- 更大的数值：更新的标准模式。

在 MSVC 中，如果需要让 `__cplusplus` 报告准确值，可增加 `/Zc:__cplusplus`：

```bat
cl /std:c++20 /Zc:__cplusplus /EHsc /W4 ebo_cpp20.cpp
```

## 七、使用 Sanitizer 检查

Clang 或 GCC 可以增加 AddressSanitizer 与 UndefinedBehaviorSanitizer：

```bash
clang++ -std=c++20 -Wall -Wextra -Wpedantic \
  -fsanitize=address,undefined -fno-omit-frame-pointer \
  -O1 -g ebo_cpp20.cpp -o ebo_cpp20_san

./ebo_cpp20_san
```

正常情况下，程序应输出 `behavior tests: PASSED`，并且 Sanitizer 不报告错误。

## 八、查看编译器布局信息

Clang 可以输出记录布局：

```bash
clang++ -std=c++20 -Xclang -fdump-record-layouts \
  -c ebo_cpp20.cpp -o /tmp/ebo_cpp20.o
```

输出较多，可筛选关键类型：

```bash
clang++ -std=c++20 -Xclang -fdump-record-layouts \
  -c ebo_cpp20.cpp -o /tmp/ebo_cpp20.o 2>&1 \
  | grep -E 'OrdinaryMember|InheritanceEBO|NoUniqueAddressMember'
```

GCC 的内部布局转储选项会随版本变化。对跨编译器实验而言，直接运行示例中的 `sizeof`、`alignof` 和偏移量打印通常更直观。

## 九、典型输出如何解读

在常见 64 位 Clang/GCC ABI 下，可能看到类似结果：

```text
EmptyPolicy                        sizeof=1   alignof=1   empty=true
OrdinaryMember                     sizeof=8   alignof=4   empty=false
InheritanceEBO                     sizeof=4   alignof=4   empty=false
NoUniqueAddressMember              sizeof=4   alignof=4   empty=false
TwoDifferentEmptyMembers           sizeof=4   alignof=4   empty=false
TwoSameEmptyMembers                sizeof=4/8 alignof=4   empty=false
StatefulMember                     sizeof=8   alignof=4   empty=false
```

重点不是记住具体数字，而是理解趋势：

- 普通空成员可能引入空间和填充；
- 空基类通常能通过 EBO 压缩；
- `[[no_unique_address]]` 通常能在组合设计中获得相似效果；
- 非空策略仍需保存真实状态；
- 相同类型的空子对象要保持地址可区分，布局会受到额外限制。

## 十、相同类型空成员的限制

```cpp
struct TwoSameEmptyMembers {
    [[no_unique_address]] EmptyPolicy first;
    [[no_unique_address]] EmptyPolicy second;
    int value;
};
```

程序会验证：

```cpp
&object.first != &object.second
```

即使两个成员都标记了 `[[no_unique_address]]`，两个相同类型的子对象仍必须能够区分。编译器可能把其中一个放进填充空间，也可能增加对象大小。

如果两个策略在语义上不同，最好直接使用两个不同类型：

```cpp
struct AllocatorPolicy {};
struct LoggingPolicy {};

struct Service {
    [[no_unique_address]] AllocatorPolicy allocator;
    [[no_unique_address]] LoggingPolicy logger;
    int state;
};
```

## 十一、调试版本与发布版本对比

对象的静态布局通常不会因为 `-O0` 与 `-O2` 改变，但仍建议分别实验：

```bash
clang++ -std=c++20 -O0 -g ebo_cpp20.cpp -o ebo_debug
clang++ -std=c++20 -O2    ebo_cpp20.cpp -o ebo_release

./ebo_debug
./ebo_release
```

如果结果不同，需要进一步检查编译器版本、目标架构、ABI 选项、打包选项以及类定义是否一致。

## 十二、工程选择

- 项目使用 C++20：优先使用组合加 `[[no_unique_address]]`。
- 项目只能使用 C++17：需要节省空间时，可以使用私有继承或成熟的压缩存储组件。
- 对象数量很少：优先普通组合，可读性更重要。
- 类型会在容器中大量出现：测量对象大小、缓存命中和整体内存后再决定。
- 不要把某台机器上的 `sizeof` 当成标准保证。

一句话总结：传统 EBO 借助继承压缩空类型；C++20 的 `[[no_unique_address]]` 则允许在更自然的成员组合设计中获得类似的空间优化。
