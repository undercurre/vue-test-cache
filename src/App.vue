<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { onMounted } from 'vue'

const fetchAppVersion = async (nowCache: boolean = false) => {
  // 使用 try/catch 捕获 fetch 错误，避免阻塞程序
  try {
    const url = process.env.API_ENV === 'development' ? '../public/version.json' : '../version.json'
    const result = await fetch(url)
    const data = await result.json()
    if (result.status === 200) {
      // 1. 获取最新版本号
      const newVersion = data.version
      const cacheKey = 'cache-version'
      // 2. 获取缓存版本号
      const cacheVersion = localStorage.getItem(cacheKey)

      // 3. !!! 首次进入立即缓存当前版本号
      if (nowCache) {
        localStorage.setItem(cacheKey, newVersion) // 缓存版本号
      } else {
        // 4. 监控到程序有新版本
        if (newVersion !== cacheVersion) {
          // 4.1 提示用户有发版更新
          // ... 省略你的提醒用户交互方式
          localStorage.setItem(cacheKey, newVersion) // 4.2 缓存版本号
        }
      }
    }
  } catch {}
}

onMounted(() => {
  fetchAppVersion(true)

  // 查询场景1: 计时器轮询查询（每隔一分钟查询一次）
  setInterval(() => fetchAppVersion(), 60 * 1000)
  // 查询场景2: 程序 visibility 时查询
  const handleVisibilityChange = () => {
    if (!document.hidden) fetchAppVersion()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
