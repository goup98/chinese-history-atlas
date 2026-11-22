import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 默认配置：无增量缓存绑定。需要 ISR 缓存时再接 KV/R2。
export default defineCloudflareConfig({});
