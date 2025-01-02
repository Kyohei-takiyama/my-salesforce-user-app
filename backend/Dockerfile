# 依存パッケージのインストール
FROM public.ecr.aws/lambda/nodejs:22 AS deps
WORKDIR /app
# packeg.jsonとpackage-lock.jsonのみコピーする
COPY package*.json ./
RUN npm ci --only=production

# Build環境
FROM public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:22
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist/index.js ${LAMBDA_TASK_ROOT}
CMD ["index.handler"]