# Cloudflare Pages Git 部署

这个项目适合直接用 Git 部署到 Cloudflare Pages。

## 域名不用改

你后面仍然可以继续使用：

- `wmumu.uno`
- `www.wmumu.uno`

## 这套方式的好处

- 你改完代码后，只要 `git push`
- Cloudflare Pages 会自动重新部署
- 不需要本机一直开着
- 不需要继续依赖本地 Python 服务和 Tunnel

## 推荐做法

建议把 `homepage-main` 单独作为一个 Git 仓库，然后推到 GitHub。

Cloudflare 官方文档：

- Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Static HTML: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Cloudflare Pages 建议配置

这个项目是纯静态站点，推荐：

- Framework preset: `None`
- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `.`

说明：

- 这里整个仓库根目录本身就是网站根目录
- 首页文件就是 `index.html`
- `static/`、`blog/`、`resume/` 等目录都直接从仓库根目录提供

## GitHub 连接步骤

1. 在 GitHub 新建一个空仓库，例如 `wmumu-home`
2. 本地进入 `F:\Dr. wang\homepage-main`
3. 初始化 Git 仓库并提交
4. 添加 GitHub 远程地址
5. 推送到 `main`
6. 到 Cloudflare Pages 里选择 `Connect to Git`
7. 选中这个 GitHub 仓库
8. 按上面的配置完成首次部署
9. 在 `Custom domains` 里绑定 `wmumu.uno` 和 `www.wmumu.uno`

## 以后怎么更新

以后改完站点内容后，只要：

```powershell
git add .
git commit -m "update homepage"
git push
```

Cloudflare Pages 就会自动部署新版本。

## 迁移完成后

等你确认 Pages 版本已经正常通过 `wmumu.uno` 对外提供后，再停掉本机这套 Tunnel：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "F:\Dr. wang\homepage-main\deploy\stop-homepage-cloudflare.ps1"
```
