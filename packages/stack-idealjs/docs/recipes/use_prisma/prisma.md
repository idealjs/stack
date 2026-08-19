---
sidebar_position: 1
---

# Next.js + Prisma + Docker构建全栈
通过使用Next.js、Prisma和Docker来构建一个全栈应用。

## 先决条件
1. 已安装Node.js 18+
2. Prisma Postgres数据库
3. Next.js项目
4. 已安装Docker
5. 确认已启动数据库

>**提示**                                                                                                                                    
如果不知道怎么启动数据库，可以参考使用 [Docker启动数据库](/docs/recipes/docker/start)文档

## 项目初始化
- 打开Next.js项目

### 1. 安装并初始化Prisma

我们需要安装Prisma客户端，运行以下代码
```
npm install prisma --save-dev
```
然后，项目初始化Prisma,运行以下命令：`init`
```
npx prisma init
```
这时会出现新目录，里面包含`schema.prisma`文件

### 2.定义表结构
#### 2.1 编辑`schema.prisma`文件
在`prisma/schema.prisma`文件中定义数据库表结构，添加以下内容：
```
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

#### 2.2 配置`.env`文件
打开`.env`文件，配置PostgreSQL数据库连接字符串。例如
```
DATABASE_URL="postgresql://postgres:example@localhost:5432/postgres"
```

### 3. 数据库migration
配置完后，可以使用以下命令将架构应用到数据库中：`prisma migrate dev`
```
npx prisma migrate dev --name init
```

### 4. 使用Prisma Studio验证数据
#### 4.1 启动Prisma Studio
运行以下命令启动`Prisma Studio`:
```
npx prisma studio
```
#### 4.2 验证数据
在`Prisma Studio`中，可以查看`User`表的数据，通过添加、编辑或修改记录，验证表是否正确

![添加记录](./verify1.png)
![添加成功](./verify2.png)

### 5. 在Next.js中使用Prisma
#### 5.1 设置Prisma客户端
运行以下命令，创建一个新目录并在其添加一个新文件`lib/prisma.ts`
```
mkdir -p lib && touch lib/prisma.ts
```
在`lib/prisma.ts`文件中添加以下代码：
```
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const globalForPrisma = global as unknown as { prisma: typeof prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```
