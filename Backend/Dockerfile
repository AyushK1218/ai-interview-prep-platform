FROM oven/bun:latest

# Install the lighter headless Chromium package instead of the full browser.
# This keeps the runtime image smaller while still giving Puppeteer a binary
# it can use for PDF generation.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        fonts-liberation \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libgbm1 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libxss1 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        chromium-headless-shell \
    && rm -rf /var/lib/apt/lists/*

# Make sure Puppeteer (used in the project) can find the Chromium binary
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-headless-shell

WORKDIR /usr/src/app

# Copy package manifest(s) first and install dependencies. This allows Docker
# to cache installed dependencies unless package.json or bun.lock changes.
COPY package.json ./
COPY bun.lock ./

# Install production dependencies with bun
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN bun install --production --frozen-lockfile

# Copy rest of the application
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the server using bun
CMD ["bun", "server.js"]


