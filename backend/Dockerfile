FROM node:20-bullseye

# Install dependencies for Sharp and Tesseract
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client and build
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
