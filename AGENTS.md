# AGENTS.md

## 项目概述

PasswordNote —— 基于 React Native 0.84.1 的移动端应用，用于存储并快速复制敏感笔记/密码。界面为中文。**仅支持 Android —— iOS 不在范围内，不要编写任何 iOS 兼容代码。**

## 包管理器与镜像源

- **Yarn 3.6.4**，使用 `node-modules` 链接模式（非 PnP）。配置在 `.yarnrc.yml`。
- 使用 npm 镜像：`https://registry.npmmirror.com`
- `postinstall` 会运行 `patch-package` —— `patches/` 下有 `react-native-document-picker` 的补丁。

```sh
yarn install
```

## 常用命令

```sh
yarn test          # Jest（react-native 预设），单个用例：yarn test -- <路径>
yarn lint          # ESLint（@react-native 配置）
yarn start         # Metro 开发服务器
yarn android       # 构建并运行 Android
yarn build:debug   # Android Gradle assembleDebug
yarn build:release # Android Gradle assembleRelease
yarn clean         # Android Gradle clean
```

未定义 typecheck 脚本 —— 手动执行 `npx tsc --noEmit`。

## 架构

```
index.js          → AppRegistry 入口
App.tsx           → Provider 栈：GestureHandler → Redux → Tamagui → Navigation
src/
  stores/         → Redux Toolkit 切片（note、quickCopy），通过 AsyncStorage 持久化
  views/          → 页面组件（Home、AllNotes、NoteDetail）
  components/     → 共享 UI 组件（AddBtn、ConfirmDialog、Header、NoteCard 等）
  utils/          → storage.ts（导出/导入 JSON）、haptic.ts
  interface.ts    → 核心类型：Note、QuickCopyItem
components/ui/    → Gluestack 风格 UI 基础组件（未使用或很少使用 —— 使用前先确认）
```

## 约定与注意事项

- **路径别名**：`@/` → `src/`（在 `tsconfig.json` 和 `babel.config.js` 中通过 `module-resolver` 配置）。使用 `@/` 导入，不要用相对路径进入 src。
- **Tamagui 处于 rc 阶段**（`^2.0.0-rc.31`）。升级后 API 可能变化。
- **reanimated/plugin** 必须是 `babel.config.js` 中最后一个插件 —— 不要调整顺序。
- **没有 CI 工作流**，没有 pre-commit 钩子。改动完成前先运行 `yarn lint` 和 `npx tsc --noEmit`。
- **Prettier**：单引号、尾逗号、单参数箭头函数不加括号。
- **状态持久化**：Redux store 通过 `redux-persist` 自动持久化到 AsyncStorage。不要手动添加保存/加载逻辑。
- **仅支持 Android**：iOS 不是目标平台 —— 不要写 `Platform.OS === 'ios'` 分支或任何 iOS 专属兼容代码。键盘处理依赖 Android 的 `windowSoftInputMode="adjustResize"`（已在 AndroidManifest.xml 中配置）；避免使用 `KeyboardAvoidingView`。
- **Node >= 22.11.0**（见 `package.json` 的 `engines`）。
