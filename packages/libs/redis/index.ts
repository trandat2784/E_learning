import Redis from "ioredis";

const redis = new Redis({
  host: "apt-macaque-66668.upstash.io",
  port: 6379,
  username: "default",
  password: "gQAAAAAAAQRsAAIncDFiZmY5YWVhZWEyNDc0N2M5YTZjOTQzODhhOTlkN2VmYnAxNjY2Njg",
  connectTimeout: 10000,
  tls: {}, // Kích hoạt TLS/SSL cho Upstash
});

export default redis;
