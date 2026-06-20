---
title: "C++ 空基类优化：从继承、成员组合到 [[no_unique_address]]"
date: 2026-06-20 01:56:37
tags:
  - cpp
  - C++20
  - EBO
  - 对象布局
categories:
  - C++
description: 从普通空成员、空基类优化到 C++20 的 no_unique_address，梳理空类型压缩的原理、限制与工程选择。
index_img: /assets/cpp-empty-base-optimization-cover.png
---

![](/assets/cpp-empty-base-optimization-cover.png)

在 C++ 中，一个没有非静态数据成员的类通常被称为空类：

```cpp
struct Empty {};
```

它没有需要保存的业务数据，但它的大小并不是 0：

```cpp
#include <iostream>

int main() {
    std::cout << sizeof(Empty) << '\n';
}
```

在常见实现中，输出是 `1`。原因是 C++ 需要让同类型的不同完整对象拥有不同地址。如果空对象完全不占空间，连续创建两个空对象时，就无法满足这一要求。

但在泛型库中，空类型经常只是一个无状态策略，例如删除器、比较器、分配器或日志策略。如果每个空策略都额外占用空间，就会造成不必要的对象膨胀。

C++ 为此提供了两条主要路径：传统的空基类优化，以及 C++20 的 `[[no_unique_address]]`。

## 1. 普通成员为什么可能增加对象大小

先看最自然的组合写法：

```cpp
struct Empty {};

struct MemberVersion {
    Empty policy;
    int value;
};
```

`policy` 是一个普通成员，通常需要具有自己的地址，因此它仍会占据空间。除此之外，`int` 还可能要求按 4 字节对齐，于是对象中可能产生填充字节。

在常见的 64 位环境中，可能观察到：

```text
sizeof(Empty)         == 1
sizeof(MemberVersion) == 8
```

这些数值只是常见结果，不是 C++ 标准对所有平台的保证。真正可靠的结论是：普通空成员可能增加对象大小。

## 2. 从继承角度理解 EBO

如果将空类型作为基类，编译器通常可以不为它分配额外空间：

```cpp
struct Empty {};

struct BaseVersion : private Empty {
    int value;
};
```

在常见实现中，`BaseVersion` 的大小可能与一个 `int` 相同：

```text
sizeof(BaseVersion) == sizeof(int)
```

这种优化称为空基类优化（Empty Base Optimization，EBO）。

这里通常使用私有继承，因为派生类并不一定在概念上“是一个”策略对象。继承只是实现层面的存储手段，私有继承可以避免把这种关系暴露给调用者。

一个典型的策略类设计如下：

```cpp
#include <utility>

struct LoggingPolicy {
    void beforeRun() const {
        // 记录日志
    }
};

template<class Policy>
class Widget : private Policy {
public:
    explicit Widget(Policy policy = {})
        : Policy(std::move(policy)) {}

    void run() {
        policy().beforeRun();
        // 执行主要逻辑
    }

private:
    Policy& policy() {
        return static_cast<Policy&>(*this);
    }
};
```

当 `Policy` 是无状态空类时，它通常不会增加 `Widget` 的大小；当 `Policy` 包含状态时，这套设计仍然可以正常保存状态。

EBO 常用于保存以下对象：

- 智能指针的删除器；
- 容器的分配器；
- 比较器和哈希函数；
- 无状态函数对象；
- 策略类和标签类型。

## 3. 继承式 EBO 的局限

EBO 并非在任何继承结构中都能生效。

首先，基类必须是空类型。只要它包含需要存储的非静态数据成员，编译器就必须为这些数据保留空间。

其次，同类型子对象的地址规则可能阻止重叠。例如：

```cpp
struct Empty {};

struct Derived : Empty {
    Empty member;
};
```

`Derived` 中同时存在一个 `Empty` 基类子对象和一个 `Empty` 成员子对象。它们需要能够被区分，因此编译器不能简单地让二者完全占据同一个位置。

此外，为了压缩成员而使用继承，会引入额外的工程成本：

- 继承表达的语义不如组合直接；
- 多个策略需要多重继承；
- 相同类型的多个策略需要额外的包装类型；
- 构造函数、访问函数和类型转换更复杂。

因此，EBO 是有效的底层实现技巧，但不应无条件替代组合。

## 4. `compressed_pair`：传统库的常见设计

C++20 之前，库实现经常借助 EBO 构造压缩二元组。它可以用于保存“资源＋无状态策略”，例如“指针＋删除器”。

下面是一个简化版本：

```cpp
#include <utility>

template<class First, class Second>
class CompressedPair : private First {
public:
    CompressedPair(First first, Second second)
        : First(std::move(first)),
          second_(std::move(second)) {}

    First& first() {
        return static_cast<First&>(*this);
    }

    const First& first() const {
        return static_cast<const First&>(*this);
    }

    Second& second() {
        return second_;
    }

    const Second& second() const {
        return second_;
    }

private:
    Second second_;
};
```

假设第一个类型是无状态删除器：

```cpp
struct EmptyDeleter {
    void operator()(int* pointer) const {
        delete pointer;
    }
};

CompressedPair<EmptyDeleter, int*> storage{
    EmptyDeleter{},
    new int{42}
};
```

`EmptyDeleter` 作为空基类，通常不产生额外存储开销。标准库的具体实现并不要求采用这段代码，但这解释了许多泛型库为什么需要类似的压缩存储工具。

生产级 `compressed_pair` 还要处理更多问题，例如两个类型都为空、两个类型相同、引用类型、异常规格和完美转发，因此不建议直接将这个教学版本用作通用库组件。

## 5. C++20：让成员组合也能被压缩

C++20 引入了 `[[no_unique_address]]` 属性。它允许一个非静态数据成员不必占据独立地址，使编译器可以复用其尾部填充或让空成员与其他成员重叠。

```cpp
struct Empty {};

struct ModernVersion {
    [[no_unique_address]] Empty policy;
    int value;
};
```

在常见实现中：

```text
sizeof(ModernVersion) == sizeof(int)
```

与私有继承相比，这种方式保留了更清晰的组合语义：`ModernVersion` 拥有一个策略，而不是继承自策略。

一个更实际的资源包装器可以写成：

```cpp
#include <utility>

template<class Resource, class Deleter>
class UniqueResource {
public:
    UniqueResource(Resource resource, Deleter deleter = {})
        : resource_(std::move(resource)),
          deleter_(std::move(deleter)) {}

    UniqueResource(const UniqueResource&) = delete;
    UniqueResource& operator=(const UniqueResource&) = delete;

    ~UniqueResource() {
        deleter_(resource_);
    }

private:
    Resource resource_;
    [[no_unique_address]] Deleter deleter_;
};

struct FileCloser {
    void operator()(int descriptor) const {
        // close(descriptor);
    }
};
```

当 `FileCloser` 为空时，它通常不会增加包装器的大小；当删除器带有状态时，例如保存统计信息或运行时配置，它仍会像普通成员一样占据必要空间。

## 6. `[[no_unique_address]]` 也不是“大小必为零”

这个属性授予编译器优化空间，但不承诺某个成员一定被完全压缩。

尤其是相同类型的成员，仍需要遵守地址唯一性要求：

```cpp
struct Empty {};

struct Example {
    [[no_unique_address]] Empty first;
    [[no_unique_address]] Empty second;
    int value;
};
```

`first` 和 `second` 是同类型的两个子对象，它们必须能够被区分，因此编译器未必能把二者都压缩到同一地址。

不同类型的空策略更适合这种布局：

```cpp
struct AllocatorPolicy {};
struct LoggingPolicy {};

struct Service {
    [[no_unique_address]] AllocatorPolicy allocator;
    [[no_unique_address]] LoggingPolicy logger;
    int state;
};
```

另外，代码不应依赖空成员与其他成员具有相同地址。对象布局属于实现细节，真正需要验证大小时，应在目标编译器、目标架构和目标编译选项下进行测试。

## 7. 三种设计方式的比较

|方式|语义|空类型空间优化|适用场景|
|:--|:--|:--|:--|
|普通成员|清晰的组合关系|传统实现中通常不能完全压缩|不关心少量空间，或需要兼容旧标准|
|私有继承|实现层面的继承关系|通常可以利用 EBO|C++17 及以前的压缩策略存储|
|`[[no_unique_address]]` 成员|清晰的组合关系|允许编译器压缩|C++20 及以上的首选方案|

三种写法可以简化为：

```cpp
struct Empty {};

// 普通组合：空成员可能增加对象大小
struct A {
    Empty policy;
    int value;
};

// 传统 EBO：通过私有继承压缩空策略
struct B : private Empty {
    int value;
};

// C++20：保留组合语义并允许压缩
struct C {
    [[no_unique_address]] Empty policy;
    int value;
};
```

## 8. 工程实践中的选择

如果项目使用 C++20 或更高标准，优先考虑成员组合加 `[[no_unique_address]]`。它既表达了正确的所有权关系，又允许编译器完成空类型压缩。

如果项目停留在 C++17 或更早版本，并且对象大小确实重要，可以使用私有继承实现 EBO，或者封装一个经过充分测试的压缩存储组件。

如果对象数量很少，或者节省几个字节不会影响缓存命中率和总体内存占用，则普通组合往往更值得选择。可读性通常比没有测量依据的微优化更重要。

判断是否值得使用压缩存储时，可以按以下顺序处理：

1. 先用清晰的组合方式完成设计；
2. 测量对象大小和实际内存占用；
3. 确认对象会被大量创建，或处于缓存敏感的数据结构中；
4. 再根据语言标准选择 EBO 或 `[[no_unique_address]]`；
5. 在所有目标 ABI 上验证布局和性能。

## 总结

空类不是零大小对象，因为完整对象通常需要独立地址。传统 C++ 通过空基类优化，让空基类不必增加派生类的大小；这也是删除器、分配器和策略类经常采用私有继承的原因。

C++20 的 `[[no_unique_address]]` 将类似的优化能力带到了成员组合中，使代码不必为了空间布局而牺牲设计语义。

可以记住一句话：

> EBO 是借助继承压缩空类型，`[[no_unique_address]]` 是在组合中允许编译器压缩成员。

二者解决的是对象布局问题，而不是业务建模问题。先选择正确、清晰的类型关系，再通过测量决定是否需要压缩，通常才是更可靠的 C++ 设计方式。
