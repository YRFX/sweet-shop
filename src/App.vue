<template>
  <view id="app">
    <!-- 啥都不用加！ -->
  </view>
</template>

<script setup>

import { onLoad, onUnload,onLaunch } from '@dcloudio/uni-app'
// import { useUserStore } from './stores/user'
onLaunch(() => {
  // 只在微信小程序里初始化
  // #ifdef MP-WEIXIN
  if (!wx.cloud) {
    console.error("请使用 2.2.3 或以上的基础库以使用云能力");
  } else {
    wx.cloud.init({
      env: "cloudbase-6gkdtp19bea12722", // 👈 换成你的
      traceUser: true,
    });
  }
  // 初始化用户状态（游客 / 自动登录）
  // const { initUser } = useUserStore()
  // initUser()
  // #endif
});



</script>

<style lang="scss">
@import "./static/css/common.scss";
#app {
  width: 100%;
  min-height: 100vh;
}
</style>