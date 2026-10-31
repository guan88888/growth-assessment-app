# 青少年长高测评 & 补剂推荐 App

UniApp + Vue 开发的前端应用，提供青少年成长测评和个性化补剂推荐功能。

## 项目结构

```
├── pages/                    # 页面目录
│   ├── onboarding/          # 启动引导页
│   ├── profile-setup/       # 建档页
│   ├── home/                # 首页（成长仪表盘）
│   ├── profile-edit/        # 档案编辑页
│   ├── quiz-start/          # 测评入口页
│   ├── quiz-question/       # 答题页
│   ├── report-result/       # 成长报告页
│   ├── report-history/      # 历史报告列表页
│   ├── action-plan/         # 30天行动计划页
│   ├── me/                  # 我的页面
│   └── disclaimer/          # 免责声明页
├── data/                    # 数据目录
│   └── mockData.js          # 题库、补剂库、组合库
├── utils/                   # 工具函数目录
│   ├── calcUtils.js         # 计算工具（年龄、BMI、靶身高）
│   └── evaluateResult.js    # 测评结果评估引擎
├── store/                   # 状态管理目录
│   └── index.js             # 本地存储管理
└── pages.json               # 页面配置（含 tabBar）
```

## 页面跳转结构

```
Onboarding(1)
 -> no profile -> ProfileSetup(2)
 -> has profile -> switchTab Home(3)

Home(3)
 -> QuizStart(5)
 -> ProfileEdit(4)
 -> ReportHistory(8)

ProfileSetup(2) -> Done -> switchTab Home(3)
ProfileEdit(4) -> Save -> Home(3)

TabBar:
Home -> switchTab Home(3)
Quiz -> if no profile -> ProfileSetup(2) else -> QuizStart(5)
Report -> if no report -> QuizStart(5) else -> ReportResult(7)
Me -> switchTab Me(10)

QuizStart(5) -> QuizQuestion(6, index=1)
QuizQuestion(6) -> Submit -> ReportResult(7, reportId)
ReportResult(7) -> ReportHistory(8) / ActionPlan(9)
ReportHistory(8) -> ReportResult(7, reportId)
ActionPlan(9) -> back -> ReportResult(7)
```

## 功能说明

### 1. 启动引导页 (Onboarding)
- 品牌 Slogan 展示
- 3 张亮点卡片
- 判断是否有档案，决定跳转路径

### 2. 建档页 (ProfileSetup)
- 三步表单：基本信息 → 身体数据 → 其他信息
- 实时计算：年龄、BMI、遗传靶身高
- 必填项校验

### 3. 首页 (Home)
- 成长状态展示
- 关键指标卡片（年龄、BMI、遗传靶身高）
- 快捷入口（编辑档案、历史报告）

### 4. 测评入口 (QuizStart)
- 测评说明
- 开始测评按钮

### 5. 答题页 (QuizQuestion)
- 一题一屏展示
- 进度条 + 题号
- A/B/C 大卡片选项
- 上一题/下一题导航
- 提交后生成报告

### 6. 成长报告 (ReportResult)
- 总览卡（状态标签 + 总结）
- 关键指标卡
- 推荐方案卡（复配组合优先，否则单品）
- 行动建议清单（可勾选）
- 注意事项折叠展开

### 7. 历史报告 (ReportHistory)
- 时间倒序列表
- 点击查看详情

### 8. 30天行动计划 (ActionPlan)
- 今日任务打卡
- 本周进度条
- 复测提醒

### 9. 我的 (Me)
- 用户信息展示
- 数据统计（测评次数、连续打卡）
- 功能入口

## 技术特点

- **纯前端实现**：使用本地存储（uni.getStorageSync/setStorageSync）
- **状态管理**：简单的 store 模块管理数据
- **UI 风格**：青少年健康科技风，蓝绿渐变主题
- **交互体验**：答题页面淡入动画，卡片式设计

## 数据存储

所有数据存储在本地：
- `growth_profile`: 用户档案
- `quiz_answers`: 答题记录（临时）
- `growth_reports`: 历史报告
- `action_plan`: 行动计划
- `quiz_count`: 测评次数
- `checkin_streak`: 连续打卡天数

## 开发说明

1. 使用 UniApp 框架开发
2. 支持多端运行（H5、小程序、App）
3. 所有页面使用 Vue 2 语法
4. 样式使用 SCSS
5. 图标使用 emoji（可替换为图片）

## 注意事项

- TabBar 图标需要放置在 `static/tabbar/` 目录
- 如需替换图标，请保持文件名一致
- 所有计算逻辑在 utils 目录
- 测评规则在 `evaluateResult.js` 中定义

