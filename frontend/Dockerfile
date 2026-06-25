# 1. Node.js 환경을 가져옵니다 (가장 안정적인 18 버전 기준)
FROM node:18-alpine

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 라이브러리 설치를 위해 설정 파일들을 먼저 복사
COPY package*.json ./

# 4. 프로젝트에 필요한 라이브러리들을 설치
RUN npm install

# 5. 나머지 프론트엔드 소스코드들을 전부 복사
COPY . .

# 6. 프론트엔드 서버를 실행 (React 등 프로젝트 설정에 따라 다를 수 있음)
CMD ["npm", "start"]
