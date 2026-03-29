# Vue 3 入门教程 🚀

> 一份适合 **零基础 / 初学者** 的 Vue 3 入门教程  
> 技术栈：Vue 3 + Vite  
> 适用于：GitHub、学习笔记、教学示例

---

## 📌 目录

- [Vue 是什么](#vue-是什么)
- [学习前准备](#学习前准备)
- [5 分钟快速上手](#5-分钟快速上手)
- [Vue 核心语法](#vue-核心语法)
- [组件基础](#组件基础)
- [使用 Vite 开发 Vue 3 项目](#使用-vite-开发-vue-3-项目)
- [Composition API](#composition-api)
- [学习路线建议](#学习路线建议)
- [学习资源](#学习资源)

---

## Vue 是什么

**Vue.js** 是一个用于构建用户界面的渐进式 JavaScript 框架，主要特点：

- ✅ 组件化开发
- ⚡ 响应式数据绑定
- 🧩 易学易用
- 📦 适合中大型 Web 项目

---

## 学习前准备

### 建议具备的基础

- HTML 基础
- CSS 基础
- JavaScript 基础（变量、函数、数组、对象）

> 没有基础也可以学，但建议边学边补。

---

## 5 分钟快速上手

使用 CDN 的方式体验 Vue 3。

### 示例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Vue 入门</title>
</head>
<body>

<div id="app">
  <h1>{{ message }}</h1>
  <button @click="changeMsg">点我</button>
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp } = Vue

  createApp({
    data() {
      return {
        message: '你好，Vue！'
      }
    },
    methods: {
      changeMsg() {
        this.message = 'Vue 真香 😄'
      }
    }
  }).mount('#app')
</script>

</body>
</html>
```
