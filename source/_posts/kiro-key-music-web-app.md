---
title: 从零到合奏：用 Kiro AI 一小时搭建按键音乐 Web App
date: 2026-05-28 10:00:00
tags:
  - Kiro
  - AI 编程
  - Web Audio
  - React
  - TypeScript
categories:
  - AI 工具
description: 记录用 Kiro AI 辅助开发一个按键音乐 Web App 的全过程，从 Spec 工作流、Web Audio 音频引擎，到移动端适配和示范曲合奏。
---

## 前言

一直想做一个能在浏览器里玩的小乐器，不需要下载安装，打开网页就能按键演奏。今天用 Kiro AI 辅助开发，从一个想法到完整可用的按键音乐 App，整个过程大约一小时。记录一下这个过程，分享给同样对 Web Audio 感兴趣的朋友。

## 最终效果

一个纯前端的按键音乐 Web App：

- 8 个音垫对应键盘 A S D F J K L ;（Do Re Mi Fa Sol La Si 高音Do）
- 三种音色：钢琴、吉他、口琴
- 支持键盘、鼠标、触摸三种交互方式
- 带简谱标注，方便对照演奏
- 12 首示范曲目，部分支持双音色合奏
- 音量调节 + localStorage 持久化
- 深色乐器风格 UI，手机电脑都能用

技术栈：React + Vite + TypeScript + Web Audio API，零后端依赖。

## 第一步：Spec 驱动开发

没有直接写代码，而是先用 Kiro 的 Spec 工作流梳理需求：

**需求文档（requirements.md）** 定义了 9 个需求：

1. 音垫布局与展示
2. 键盘触发音频播放
3. 鼠标点击触发
4. 按键高亮动画
5. 音色切换
6. 音量调节
7. 纯前端运行
8. Web Audio API 音频合成
9. 移动端触摸支持

每个需求都有明确的验收标准，比如“触发后 50ms 内开始发声”、“高亮 150ms 后恢复”这种可测量的指标。

**设计文档（design.md）** 确定了分层架构：

```text
UI 组件层（Pad、PadGrid、ToneSelector、VolumeControl）
↓
Hook 逻辑层（useKeyboard、useTouchHandler、usePadState）
↓
服务层（AudioEngine 单例）
```

**任务列表（tasks.md）** 把实现拆成了 9 个阶段，带依赖关系图，可以并行推进。

这一步的价值：后面写代码时几乎没有返工，因为架构和接口都想清楚了。

## 第二步：搭建项目骨架

用 Vite 的 react-ts 模板初始化项目，然后创建核心文件结构：

```text
src/
├── types/index.ts # ToneType、PadConfig 等类型
├── constants/notes.ts # 音高映射 C4-C5、音色配置
├── services/AudioEngine.ts # Web Audio API 封装
├── components/ # React 组件
├── hooks/ # 自定义 hooks
└── styles/ # CSS
```

关键设计决策：

- AudioEngine 作为单例，不放在 React 状态里，避免重复创建 AudioContext
- 用 `useRef` 持有当前音色，避免 useCallback 的闭包陷阱
- 音高映射用常量数组，方便后续扩展

## 第三步：实现 Web Audio 音频引擎

这是整个项目最核心的部分。Web Audio API 的基本思路是构建音频节点图：

```text
振荡器(OscillatorNode) → 增益(GainNode) → 压缩器 → 混响 → 输出
```

### 三种音色的合成策略

**钢琴**：三角波基频 + 正弦波谐波 + 低通滤波：

```typescript
osc1.type = 'triangle'; // 基频，柔和
osc2.type = 'sine'; // 2次谐波，温暖
osc3.type = 'sine'; // 4次谐波，亮度
```

配合快速 attack（3ms）+ 指数衰减的包络，模拟击弦效果。

**吉他**：锯齿波 + 多谐波 + 滤波器频率衰减：

```typescript
// 滤波器频率随时间降低，模拟弦振动高频先衰减
filter.frequency.exponentialRampToValueAtTime(frequency * 2, now + totalDuration);
```

这个细节让吉他音色有了“弦在振动中逐渐变暗”的真实感。

**口琴**：方波 + 奇次谐波 + LFO 颤音 + 气息噪声：

```typescript
// 颤音 LFO 模拟手部颤动
lfo.frequency.value = 5.2; // 5.2Hz
lfoGain.gain.value = 4; // ±4Hz 频率偏移
```

口琴的特征是方波的奇次谐波结构 + 明显的颤音，加上一层极轻的白噪声模拟气息。

### 全局音频处理

为了让整体音质更好，加了两个全局效果：

- **动态压缩器**：防止多音同时发声时爆音
- **卷积混响**：用算法生成 1.5 秒的脉冲响应，模拟小房间空间感

## 第四步：组件和交互

UI 部分相对直接：

```tsx
// Pad 组件 - 显示简谱 + 按键标签
<button className={`pad ${isActive ? 'active' : ''}`} data-pad-key={padKey}>
  <span className="pad-notation">{notation}</span> {/* 简谱数字 */}
  <span className="pad-label">{keyLabel}</span> {/* 键盘按键 */}
</button>
```

高亮动画用 CSS transition + scale 实现，150ms 自动恢复：

```css
.pad.active {
  transform: scale(1.08);
  background: linear-gradient(145deg, #6c63ff, #4a42d4);
  box-shadow: 0 0 20px rgba(108, 99, 255, 0.5);
}
```

键盘事件用 `useKeyboard` hook 封装，维护 `pressedKeys` Set 防止长按重复触发。

## 第五步：移动端适配（踩坑记录）

移动端遇到了三个坑：

### 坑 1：touch-action: none 放错位置

最初把 `touch-action: none` 放在整个 `.app` 容器上，结果所有按钮和滑块在手机上都无法点击。

**解决**：只在 `.pad-grid` 上设置 `touch-action: none`，其他区域保持默认。

### 坑 2：onClick + onTouchEnd 双重触发

同时绑定 `onClick` 和 `onTouchEnd` 会导致触摸设备上事件冲突：要么触发两次，要么一次都不触发。

**解决**：统一使用 `onPointerUp` 事件。Pointer Events 是 W3C 的统一输入抽象，触摸和鼠标都只触发一次。

### 坑 3：iOS AudioContext 需要用户手势激活

移动端浏览器的 autoplay policy 要求 AudioContext 必须在用户交互事件中 resume。示范播放按钮需要在 `handlePlay` 里先调 `audioEngine.resume()`。

## 第六步：示范曲目与合奏

加了 12 首示范曲，按音色分组推荐：

- 钢琴：致爱丽丝、梦中的婚礼、欢乐颂、小蜜蜂、两只老虎、粉刷匠
- 吉他：童年、同桌的你、兰花草、小星星、生日快乐
- 口琴：天空之城、故乡的原风景、世上只有妈妈好、茉莉花

### 合奏实现

单音色播放听起来比较单薄，加了伴奏层后效果明显提升。关键是三个分离手段：

1. **音域分离**：伴奏频率减半（降一个八度），主旋律在中音区，伴奏在低音区
2. **音量分离**：伴奏音量为主旋律的 40%
3. **空间分离**：伴奏声像偏左（pan = -0.35），主旋律居中

```typescript
playAccompaniment(frequency: number, tone: ToneType): void {
  const lowFreq = frequency / 2; // 降八度
  accompGain.gain.value = 0.4; // 40% 音量
  panner.pan.value = -0.35; // 偏左声道
}
```

伴奏轨和主旋律各有独立的定时器，同时推进但互不干扰。

## 第七步：音质优化

最初版本用单个振荡器，听起来很“电子”。优化后每种音色都用 3-4 个振荡器叠加谐波，加上滤波器和包络塑形，质感提升很大。

几个关键的音质提升技巧：

- **指数衰减**比线性衰减自然得多（`exponentialRampToValueAtTime`）
- **低通滤波器**去掉数字合成的刺耳高频
- **混响**哪怕只加 25% 的湿信号，空间感就出来了
- **压缩器**让多音同时发声时不会爆音

## 项目结构总览

```text
kiro-key-music/
├── src/
│   ├── App.tsx # 主组件，状态管理
│   ├── App.css # 深色乐器风格样式
│   ├── types/index.ts # TypeScript 类型
│   ├── constants/
│   │   ├── notes.ts # 音高映射、音色配置
│   │   └── demos.ts # 12首示范曲 + 伴奏轨
│   ├── services/
│   │   └── AudioEngine.ts # Web Audio 引擎（300行核心）
│   ├── components/
│   │   ├── Pad.tsx # 音垫组件
│   │   ├── PadGrid.tsx # 音垫网格
│   │   ├── ToneSelector.tsx # 音色选择器
│   │   ├── VolumeControl.tsx # 音量控制
│   │   └── DemoPlayer.tsx # 示范播放器（含合奏）
│   └── hooks/
│       ├── useKeyboard.ts # 键盘事件
│       ├── useTouchHandler.ts # 触摸事件
│       └── usePadState.ts # Pad 状态管理
├── vite.config.ts # host: true 支持局域网访问
└── package.json
```

## 运行方式

```bash
# 安装依赖
npm install

# 启动开发服务器（局域网可访问）
npm run dev

# 手机访问：http://你的电脑IP:5173
```

## 总结

整个项目从想法到完成大约一小时，Kiro AI 帮助最大的地方：

1. **Spec 工作流**让我在写代码前就想清楚了架构和接口
2. **代码生成**处理了大量重复性工作（组件模板、CSS、示范曲数据）
3. **问题诊断**快速定位移动端兼容性问题的根因

如果你也想试试 Web Audio，这个项目是个不错的起点。核心就是理解“振荡器 → 滤波器 → 增益 → 输出”这条节点链，然后用包络和谐波叠加来塑造不同音色。

---

*技术栈：React 19 + Vite 8 + TypeScript 6 + Web Audio API*

*代码量：约 1500 行（含示范曲数据）*

*构建产物：约 65KB gzipped*
