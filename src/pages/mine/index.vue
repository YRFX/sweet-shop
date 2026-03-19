<template>
  <view class="mine-page">

    <!-- 用户信息 -->
    <view class="user-section">
      <view class="avatar" @click="toLogin">👤</view>
      <view class="user-info" @click="toLogin">
        <view class="name">{{ userInfo.isLogin ? userInfo.nickName : '点击登录' }}</view>
        <view class="tip">{{ userInfo.isLogin ? '欢迎回来' : '未登录' }}</view>
      </view>
    </view>

    <!-- 订单 -->
    <view class="order-section" v-if="userInfo.isLogin">
      <view class="order-tab">
        <view class="tab-item" @click="goToOrderByStatus(0)">
          <text class="icon">📦</text>
          <text>待付款</text>
        </view>
        <view class="tab-item" @click="goToOrderByStatus(1)">
          <text class="icon">🚚</text>
          <text>已发货</text>
        </view>
        <view class="tab-item" @click="goToAllOrder">
          <text class="icon">📋</text>
          <text>全部订单</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-if="userInfo.isLogin" @click="goToAddressList">
        <text>收货地址管理</text>
        <text>›</text>
      </view>
      <view class="menu-item" @click="contactService">
        <text>联系客服</text>
        <text>›</text>
      </view>
      <view class="menu-item" @click="openAboutUs">
        <text>关于我们</text>
        <text>›</text>
      </view>
    </view>

    <!-- 浮动购物车 -->
    <view class="float-cart" @click="goToCart">
      <text class="icon">🛒</text>
      <text class="badge" v-if="cartCount > 0">{{ cartCount }}</text>
    </view>

    <!-- 🔥 自定义弹窗（可点击内部10次） -->
    <view class="modal-mask" v-if="showAboutModal" @click="closeAboutUs">
      <view class="modal-content" @click.stop="tapModalContent">
        <view class="modal-title">关于我们</view>
        <view class="modal-body">甜品小程序 · 安心选购</view>
        <view class="modal-btn" @click="closeAboutUs">确定</view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'
import { cartInfo } from '@/stores/cart'
import { useCloud } from '@/utils/useCloud'
const {  toLogin } = useCloud()

onShow(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.getTabBar) {
    const tabBar = currentPage.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 3 })
    }
  }
})

// 购物车数量
const cartCount = computed(() => {
  return cartInfo.value?.count || 0
})

// 跳转
const goToCart = () => uni.switchTab({ url: '/pages/cart/index' })
const goToAddressList = () => uni.navigateTo({ url: '/pages/address/index' })
const goToAllOrder = () => uni.navigateTo({ url: '/pages/order/list' })
const goToOrderByStatus = (status) => uni.navigateTo({ url: `/pages/order/list?status=${status}` })

// 客服
const contactService = () => {
  uni.showModal({ title: '联系客服', content: '暂未开通', showCancel: false })
}

// ==============================================
// 🔥 自定义关于我们弹窗（真正可点击内部10次）
// ==============================================
const showAboutModal = ref(false)
const tapCount = ref(0)
let tapTimer = null

// 打开弹窗
const openAboutUs = () => {
  showAboutModal.value = true
}

// 关闭弹窗
const closeAboutUs = () => {
  showAboutModal.value = false
}

// 🔥 点击弹窗内部区域（连续10次触发）
const tapModalContent = () => {
  tapCount.value++
  clearTimeout(tapTimer)

  if (tapCount.value >= 10) {
    tapCount.value = 0
    const MY_OPENID = 'oqPQT5J6gqOghXacf6B60WhkRs08' // <-- 改这里

    if (userInfo.value.openid === MY_OPENID) {
      uni.showToast({ title: '欢迎管理员', icon: 'success' })
      closeAboutUs()
      uni.navigateTo({ url: '/pages/setting/index' })
    } else {
      uni.showToast({ title: '无权限', icon: 'none' })
    }
    return
  }

  // 2秒内连续点击有效
  tapTimer = setTimeout(() => {
    tapCount.value = 0
  }, 3000)
}
</script>

<style scoped lang="scss">
.mine-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f5f2;
  padding: 20rpx;
  box-sizing: border-box;
}

.user-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 44rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  background: #ffb4b0;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-right: 28rpx;
}

.user-info {
  flex: 1;
}

.name {
  font-size: 34rpx;
  font-weight: 600;
  color: #2d2d2d;
}

.tip {
  font-size: 24rpx;
  color: #9a9a9a;
}

.order-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
}

.order-tab {
  display: flex;
  justify-content: space-around;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: #666;
}

.tab-item .icon {
  width: 60rpx;
  height: 60rpx;
  background: #f7f5f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.menu-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 0 32rpx;
}

.menu-item {
  height: 96rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #333;
  border-bottom: 1rpx solid #f2f0ed;

  &:last-child {
    border-bottom: none;
  }
}

.float-cart {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 88rpx;
  height: 88rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  z-index: 99;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff7a7c;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.modal-body {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  min-height: 100rpx;
  line-height: 100rpx;
}

.modal-btn {
  background: #f5e9e2;
  color: #997c6c;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
}

page {
  padding-bottom: 46px;
  box-sizing: border-box;
}
</style>