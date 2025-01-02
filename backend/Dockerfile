# 依存パッケージのインストール
FROM node:16 AS deps
WORKDIR /app
# packeg.jsonとpackage-lock.jsonのみコピーする
COPY package*.json ./
RUN npm ci --only=production

# Build環境
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 実行環境
FROM public.ecr.aws/lambda/nodejs:16
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist/index.js ${LAMBDA_TASK_ROOT}
CMD ["index.handler"]