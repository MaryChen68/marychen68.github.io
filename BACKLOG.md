# marychen68.github.io — Backlog

> **目标 / Goals**
> 1. 展示能力：面试官点开就能看出"这个人能独立做完一个完整产品"
>    Show my skills: a recruiter can tell I can build a complete product on my own
> 2. 真正学会做网站：前端、后端、数据库、测试、部署全流程
>    Truly learn how websites are built: frontend, backend, database, testing, deployment
> 3. 为下一步铺路：做一个 app 上架 App Store
>    Prepare for the next goal: ship an app on the App Store
>
> **原则 / Principle：Complexity is the biggest enemy.**
> 能不加的库就不加，能不做的功能就不做，真遇到问题再加。
> Don't add a library or feature until a real problem needs it.
>
> **节奏 / Pace**：4 周，每周约 10–12 小时；每周结束都要有一个能上线、能演示的版本。
> 4 weeks, ~10–12 hours/week. Every week ends with something live and demoable.
>
> **用法 / How to use**：完成一项就把 `[ ]` 改成 `[x]`，做到「✅」才算完成。
> Change `[ ]` to `[x]` when done. An item is done only when its ✅ is met.

---

## 技术栈 / Tech Stack

| 层 / Layer | 技术 / Tech | 为什么 / Why |
|---|---|---|
| 语言 / Language | **TypeScript** | 前端、后端、app 都用同一种语言 / One language for web, API, and app |
| 前端 / Frontend | **Vite + React + React Router** | 业界主流，可直接迁移到 React Native / Industry standard; carries over to React Native |
| 样式 / Styling | **Tailwind CSS**（+ 少量 shadcn/ui / a few shadcn/ui components） | 快速做出统一、专业的界面 / Consistent, professional UI, fast |
| 动效 / Motion | **Framer Motion** | 一个库就能做出专业感 / One library is enough for polish |
| 后端 / Backend | **Hono on Cloudflare Workers** | 轻量、免费，app 可复用同一套 API / Light, free; the app can reuse the same API |
| 数据库 / Database | **Cloudflare D1 (SQLite)**，直接写 SQL / raw SQL | 不用 ORM，先学扎实 SQL / No ORM; learn SQL itself first |
| 测试 / Testing | **Vitest**（+ 1 个 Playwright 测试 / one Playwright test） | 够用就好 / Enough, not more |
| CI/CD | **GitHub Actions** | push 后自动检查、部署 / Auto check and deploy on push |

**仓库结构 / Repo layout**（一个仓库，两个文件夹 / one repo, two folders）：

```
marychen68.github.io/
├── web/   # React frontend → GitHub Pages
└── api/   # Hono API → Cloudflare Workers
```

**刻意不用 / Deliberately not using**：Lenis、TanStack Query、Drizzle、React Hook Form、Sentry、R2、monorepo 工具 / tooling。
真的需要、并能说出原因时再加。/ Add one only when it's truly needed and you can explain why.

---

## Week 1 — 基础 & 项目地基 / Foundations & Setup

**交付 / Deliverable**：一个 React 空壳网站，push 后自动部署到 `marychen68.github.io`。
A React skeleton site that auto-deploys to `marychen68.github.io` on every push.

- [ ] **1.1 HTML / CSS / JavaScript 基础 / Basics**
  - 学 / Learn：语义化标签、盒模型、Flexbox、Grid、media query；JS 变量、函数、`map` `filter`、对象、`async/await`、`fetch`
    Semantic tags, box model, Flexbox, Grid, media queries; JS variables, functions, `map`/`filter`, objects, `async/await`, `fetch`
  - 做 / Do：手写一个个人卡片页面，再用 JS 把项目数据渲染成列表
    Hand-write a profile card page, then render a project list from data with JS
  - 为什么 / Why：React 和 Tailwind 最终生成的都是 HTML/CSS/JS
    React and Tailwind both end up as HTML/CSS/JS
  - ✅ 不看教程写出一个两栏、在手机上自动变单栏的页面
    Build a two-column page that turns single-column on phones, without a tutorial

- [ ] **1.2 TypeScript 入门 / TypeScript Basics**
  - 学 / Learn：基本类型、`type`、数组和对象类型、可选属性、函数参数类型
    Basic types, `type`, arrays and objects, optional fields, typed function params
  - 做 / Do：写一个 `Project` 类型，故意写错字段，看编辑器怎么报错
    Write a `Project` type, misspell a field on purpose, and see the editor catch it
  - ✅ 能解释 / Can explain `type Project = { title: string; tags: string[]; url?: string }`

- [ ] **1.3 Git 工作流 / Git Workflow**
  - 学 / Learn：`status / add / commit / push / pull`、分支 / branches、Pull Request、清楚的 commit message
  - 做 / Do：每个功能都在新分支开发 → 开 PR → 合并到 `main`
    Every feature: new branch → PR → merge to `main`
  - 为什么 / Why：团队协作的标准流程，commit 历史本身就是作品
    The standard team workflow; your commit history is part of your portfolio
  - ✅ GitHub 上至少有 1 个自己开并合并的 PR / At least one PR opened and merged

- [x] **1.4 创建 React 项目 / Create the React Project**
  - 做 / Do：在 `web/` 里用 `npm create vite@latest` 建 React + TS 项目，加上 Prettier（Vite 模板自带 ESLint）
    Scaffold React + TS in `web/` with `npm create vite@latest`; add Prettier (ESLint comes with the template)
  - 学 / Learn：`package.json`、`node_modules`、`src/` 和 `public/` 的区别，`dev` 和 `build` 的区别
    What `package.json`, `node_modules`, `src/` vs `public/`, and `dev` vs `build` mean
  - ✅ `npm run dev` 能看到页面，`npm run build` 成功，保存时自动格式化
    Dev server works, build succeeds, files format on save

- [ ] **1.5 GitHub Actions 自动部署 / Auto-Deploy with GitHub Actions**
  - 学 / Learn：CI/CD 是什么、workflow YAML 的结构 / What CI/CD is; how a workflow YAML is structured
  - 做 / Do：push 到 `main` 时自动执行 lint → build → 部署到 GitHub Pages
    On push to `main`: lint → build → deploy to GitHub Pages
  - ✅ 改一行字 → push → 几分钟后网站自动更新 / Change a line → push → site updates in minutes

- [x] **1.6 README**
  - 做 / Do：项目简介、技术栈、本地运行步骤 / Intro, tech stack, how to run locally
  - ✅ 别人照着能在自己电脑上跑起来 / Someone else can run it from the README alone

---

## Week 2 — 前端：完整的静态网站 / Frontend: Complete Static Site

**交付 / Deliverable**：所有页面完成、手机适配、有暗色模式（内容先写在代码里）。
All pages done, mobile-friendly, with dark mode (content lives in code for now).

- [ ] **2.1 React 核心 / React Core**
  - 学 / Learn：组件、JSX、props、`useState`、`useEffect`、列表渲染和 `key`、条件渲染
    Components, JSX, props, `useState`, `useEffect`, lists and `key`, conditional rendering
  - 做 / Do：`Navbar`、`Footer`、`ProjectCard`、`Section` 组件 / components
  - 为什么 / Why：组件化是 React 和 React Native 的共同核心 / Components are the core of both React and React Native
  - ✅ 首页由组件拼成，没有重复代码 / Home page built from components, no copy-paste

- [ ] **2.2 内容和界面分离 / Separate Content from UI**
  - 做 / Do：个人信息、项目、经历放进 `web/src/content.ts`，组件只负责展示
    Put bio, projects, and experience in `web/src/content.ts`; components only display them
  - ✅ 新增一个项目只需在 `content.ts` 加一个对象 / Adding a project = adding one object

- [ ] **2.3 路由 / Routing**
  - 学 / Learn：React Router、动态路由 / dynamic routes（`/projects/:slug`）、404 页面
  - 做 / Do：`/`、`/projects`、`/projects/:slug`、`/about`、404
  - 注意 / Note：GitHub Pages 不认识前端路由，要加 `404.html` 回退，否则刷新会 404
    GitHub Pages doesn't know client routes; add a `404.html` fallback or refreshes will 404
  - ✅ 页面能互相跳转，刷新任何页面都不会 404 / All pages link up; refreshing any page works

- [ ] **2.4 设计：你自己的风格 / Design: Your Own Style**
  - 做 / Do：定 1 个背景色、1 个文字色、1 个强调色，1 个标题字体 + 1 个正文字体，写进 Tailwind 主题
    Pick 1 background, 1 text, 1 accent color, plus a heading font and a body font; put them in the Tailwind theme
  - 为什么 / Why：专业感来自统一；可以借鉴同学的网站，但要有自己的风格
    Polish comes from consistency; borrow ideas, but make it yours
  - ✅ 代码里没有随手写的颜色值 / No hard-coded colors anywhere

- [ ] **2.5 Tailwind + 响应式 / Responsive Layout**
  - 学 / Learn：常用工具类、`sm:` `md:` `lg:` 断点、移动优先 / utility classes, breakpoints, mobile-first
  - ✅ 375px、768px、1440px 三种宽度都好看，没有横向滚动条 / Looks good at all three widths, no horizontal scroll

- [ ] **2.6 暗色模式 / Dark Mode**
  - 做 / Do：默认跟随系统，加切换按钮并记住选择 / Follow system by default; add a toggle that remembers the choice
  - ✅ 亮、暗模式下所有页面都清晰可读 / Every page readable in both modes

- [ ] **2.7 填入真实内容 / Real Content**
  - 首页 / Home：自我介绍、"现状"信息卡（在做什么 / 学历 / 在找什么）、精选项目、联系方式
    Intro, "now" cards (current work / education / looking for), featured projects, contact
  - 项目详情 / Project page：背景 → 我做了什么 → 难点 → 结果 → 链接 / 截图
    Context → what I did → challenges → results → links/screenshots
  - 关于 / About：经历、教育背景 / Experience, education
  - 图片放在 `web/public/` / Images go in `web/public/`
  - ✅ 没有任何占位文字 / No placeholder text left

---

## Week 3 — 后端：API + 数据库 / Backend: API + Database

**交付 / Deliverable**：部署在 Cloudflare 上的 API，联系表单和浏览量由它驱动。
A live API on Cloudflare powering the contact form and page views.

**为什么要做 / Why**：静态网站只能"展示"，不能"记住"任何东西。有人给你留言，消息要存在哪里？这周学的就是服务器和数据库，也就是全栈里"后"的那一半。
A static site can only display, not remember. When someone sends you a message, where does it go? This week is the "back" half of full-stack.

- [ ] **3.1 后端基础概念 / Backend Concepts**
  - 学 / Learn：客户端和服务器、HTTP 方法、状态码（200 / 201 / 400 / 401 / 404 / 500）、JSON、REST
    Client vs server, HTTP methods, status codes, JSON, REST
  - 做 / Do：用 DevTools 的 Network 面板观察真实网站发出的请求 / Watch real requests in the DevTools Network tab
  - ✅ 能讲清楚"点击提交之后发生了什么" / Can explain what happens after clicking Submit

- [ ] **3.2 Hono API**
  - 做 / Do：在 `api/` 里建 Hono 项目，写 `GET /health`，部署到 Cloudflare Workers
    Create a Hono project in `api/`, add `GET /health`, deploy to Workers
  - 学 / Learn：路由、中间件、环境变量 / Routing, middleware, environment variables
  - ✅ `<API>/health` 返回 / returns `{"ok": true}`

- [ ] **3.3 数据库：D1 + SQL / Database**
  - 学 / Learn：表、主键、索引；`SELECT` `INSERT` `UPDATE` `DELETE`；迁移 / migrations
  - 做 / Do：建 `messages` 和 `page_views` 两张表，用 `.sql` 迁移文件管理
    Create `messages` and `page_views` tables, managed with `.sql` migration files
  - ✅ 能解释每张表、每个字段的用途 / Can explain every table and column

- [ ] **3.4 两个接口 / Two Endpoints**
  - `POST /messages`：校验 → 存库 → 返回 201 / validate → save → 201
  - `GET` / `POST /views/:slug`：页面浏览量 / page views
  - 校验用一个简单函数（或 Zod），出错返回 400 和清楚的信息
    Validate with a simple function (or Zod); return 400 with a clear message on bad input
  - ✅ 用 curl 测试，正常和出错都符合预期 / curl tests pass for both good and bad input

- [ ] **3.5 安全基础 / Security Basics**
  - 学 / Learn：CORS、密钥管理、SQL 注入（永远用参数化查询）
    CORS, secrets, SQL injection (always use parameterized queries)
  - 做 / Do：CORS 只允许你的网站；密钥只放在环境变量里 / CORS allows only your site; secrets live only in env vars
  - ✅ 仓库里没有密钥，其他网站调用会被拒绝 / No secrets in the repo; other origins are blocked

- [ ] **3.6 前端接入 API / Connect Frontend to API**
  - 做 / Do：用 `fetch` + `useState` 处理 loading / error / success 三种状态
    Handle loading / error / success with `fetch` + `useState`
  - ✅ API 出错时显示友好提示，不白屏 / Friendly message on errors, never a blank page

- [ ] **3.7 API 自动部署 / Auto-Deploy the API**
  - 做 / Do：GitHub Actions 加上 API 部署 / Add API deploy to GitHub Actions
  - ✅ 修改后端并 push 后自动上线 / Backend changes go live on push

---

## Week 4 — 动效、测试 & 正式发布 / Motion, Tests & Launch

**交付 / Deliverable**：有质感、有测试、可以放进简历的正式版本。
A polished, tested version ready for your résumé.

- [ ] **4.1 Framer Motion 动效 / Motion**
  - 做 / Do：滚动淡入、卡片悬停反馈、页面切换过渡，要克制 / Scroll fade-ins, card hover, page transitions; keep it restrained
  - 尊重 `prefers-reduced-motion` / Respect `prefers-reduced-motion`
  - ✅ 流畅不卡；开启「减少动态效果」后动画关闭 / Smooth; animations turn off with reduced motion

- [ ] **4.2 测试 / Testing**
  - Vitest：校验函数和每个 API 接口 / validation and every API endpoint
  - Playwright：1 个端到端测试：首页 → 项目页 → 提交联系表单 / one E2E test: home → project → submit contact form
  - 为什么 / Why：会写测试是学生和工程师最明显的差距 / Tests are the clearest gap between students and engineers
  - ✅ 测试在 CI 里自动运行，不通过就不部署 / Tests run in CI; failures block deploy

- [ ] **4.3 性能 + SEO + 无障碍 / Performance + SEO + Accessibility**
  - 做 / Do：图片转 WebP 并懒加载；每页有 title 和 description；Open Graph 分享图；图片有 alt；对比度达标；能只用键盘操作
    WebP + lazy images; per-page title/description; OG share image; alt text; good contrast; keyboard-only navigation works
  - ✅ Lighthouse 四项都 ≥ 90；LinkedIn 贴链接有预览卡片 / All four Lighthouse scores ≥ 90; link preview shows on LinkedIn

- [ ] **4.4 访问统计 / Analytics**
  - 做 / Do：加 Cloudflare Web Analytics（一行 script）/ Add Cloudflare Web Analytics (one script tag)
  - ✅ 能看到访问数据 / Visit data shows up

- [ ] **4.5（可选 / Optional）自定义域名 / Custom Domain**
  - ✅ 用自己的域名访问，并且是 HTTPS / Reachable on your own domain over HTTPS

- [ ] **4.6 发布 / Launch**
  - 做 / Do：README 加架构图和截图；更新简历和 LinkedIn；发给 3 个人收集反馈
    Add an architecture diagram and screenshots to the README; update résumé and LinkedIn; get feedback from 3 people
  - ✅ 网站正式上线，简历上有链接 / Site is live and linked on your résumé

---

## 之后：App Store / Next: App Store

| 网站里学到的 / Learned here | 在 app 里怎么用 / Used in the app |
|---|---|
| TypeScript + React | → **React Native + Expo** |
| Hono API + D1 | → 同一套后端 / same backend |
| 测试 + CI/CD / Tests + CI/CD | → **EAS Build** 自动打包、上传 TestFlight / auto-build to TestFlight |

app 里要新学 / New for the app：用户登录（Sign in with Apple）/ user login (Sign in with Apple)。

提前准备 / Prepare：Apple Developer Program（$99/年 / year）、App Review Guidelines、想好 app 要解决什么问题 / decide what problem the app solves。

> 到时候再单独开一个 backlog。/ It gets its own backlog later.
