# 依存パッケージのインストール
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22 AS deps
WORKDIR /app
# packeg.jsonとpackage-lock.jsonのみコピーする
COPY package*.json ./
RUN npm ci --only=production

# Build環境
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist/* ./
RUN ls -la
CMD ["index.handler"]