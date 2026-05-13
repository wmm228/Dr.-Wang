# Cloudflare Pages 迁移说明

这个项目适合直接迁移到 Cloudflare Pages，因为它本质上是静态站点。

## 你不需要改域名

迁移后仍然可以继续使用：

- `wmumu.uno`
- `www.wmumu.uno`

## 我已经帮你准备好的文件

- `deploy/prepare-pages-upload.ps1`
- `deploy/pages-dist`（运行脚本后生成）
- `deploy/homepage-pages-upload.zip`（可选，运行脚本时带 `-Zip` 生成）

## 第一步：生成上传目录

在 PowerShell 里运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "F:\Dr. wang\homepage-main\deploy\prepare-pages-upload.ps1" -Zip
```

这个命令会生成：

- `F:\Dr. wang\homepage-main\deploy\pages-dist`
- `F:\Dr. wang\homepage-main\deploy\homepage-pages-upload.zip`

## 第二步：上传到 Cloudflare Pages

Cloudflare 官方文档：

- Direct Upload: https://developers.cloudflare.com/pages/get-started/direct-upload/

在 Cloudflare 后台：

1. 打开 `Workers & Pages`
2. 选择 `Create application`
3. 选择 `Pages`
4. 选择 `Drag and drop your files`
5. 项目名建议填：`wmumu-home`
6. 上传 `homepage-pages-upload.zip`，或者上传 `pages-dist` 文件夹
7. 等待部署完成

部署成功后，你会先得到一个 `*.pages.dev` 预览地址。

## 第三步：绑定现有域名

Cloudflare 官方文档：

- Custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/

在这个 Pages 项目里：

1. 打开 `Custom domains`
2. 添加 `wmumu.uno`
3. 再添加 `www.wmumu.uno`

你的域名已经在 Cloudflare 托管，所以根域名和 `www` 都可以直接继续用。

## 第四步：确认没问题后停掉本机 Tunnel

当 `https://wmumu.uno` 已经指向 Pages 且页面正常后，再运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "F:\Dr. wang\homepage-main\deploy\stop-homepage-cloudflare.ps1"
```

## 说明

- 这个站点不需要 Python 服务端才能在 Pages 上运行。
- `server.py` 只用于本地预览。
- 当前项目里的 `.npm-cache`、本地日志和部署脚本不会被上传到 Pages。
