<template>
  <view class="mine-page">

    <!-- 1. 用户信息头部 -->
    <view class="user-section">
      <view class="avatar" @click="toLogin">
        👤
      </view>
      <view class="user-info" @click="toLogin">
        <view class="name">{{ userInfo.isLogin ? userInfo.nickName : '点击登录' }}</view>
        <view class="tip">{{ userInfo.isLogin ? '欢迎回来' : '未登录 · 点击授权微信登录' }}</view>
      </view>
    </view>

    <!-- 2. 订单快捷入口 【登录后才显示】 -->
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

    <!-- 3. 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-if="userInfo.isLogin" @click="goToAddressList">
        <text>收货地址管理</text>
        <text>›</text>
      </view>
      <view class="menu-item" @click="contactService">
        <text>联系客服</text>
        <text>›</text>
      </view>
      <view class="menu-item" @click="aboutUs">
        <text>关于我们</text>
        <text>›</text>
      </view>
    </view>

    <!-- 浮动购物车 -->
    <view class="float-cart" @click="goToCart">
      <text class="icon">🛒</text>
      <text class="badge" v-if="cartCount > 0">{{ cartCount }}</text>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'
import { cartInfo } from '@/stores/cart'
import { useCloud } from '@/utils/useCloud'

const { wxLogin } = useCloud()


onShow(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.getTabBar) {
    const tabBar = currentPage.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 3 }) // ✅ 我的 = 3
    }
  }
})
// 实时购物车数量
const cartCount = computed(() => {
  return cartInfo.value?.count || 0
})

// 登录
const toLogin = () => {
  if (userInfo.value.isLogin) return
  uni.showModal({
    title: '微信登录',
    content: '是否授权微信快捷登录',
    success: (res) => {
      if (res.confirm) wxLogin()
    }
  })
}

// 去购物车
const goToCart = () => {
  uni.switchTab({ url: '/pages/cart/index' })
}

// 地址管理
const goToAddressList = () => {
  uni.navigateTo({ url: '/pages/address/index' })
}

// 全部订单
const goToAllOrder = () => {
  uni.navigateTo({ url: '/pages/order/list' })
}

// 按状态跳转订单
const goToOrderByStatus = (status) => {
  uni.navigateTo({
    url: `/pages/order/list?status=${status}`
  })
}

// 联系客服
const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '暂未开通电话客服',
    showCancel: false
  })
}

// 关于我们
const aboutUs = () => {
  uni.showModal({
    title: '关于我们',
    content: '甜品小程序 · 安心选购',
    showCancel: false
  })
}
</script>

<style scoped lang="scss">
/* 全局 INS 奶油质感 */
.mine-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f5f2;
  padding: 20rpx;
  box-sizing: border-box;
}

/* 用户卡片 */
.user-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 44rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
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
  margin-bottom: 6rpx;
}

.tip {
  font-size: 24rpx;
  color: #9a9a9a;
}

/* 订单模块 */
.order-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
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

/* 菜单 */
.menu-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 0 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
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

/* 浮动购物车 */
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

.float-cart .icon {
  font-size: 36rpx;
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
page {
  padding-bottom: 46px;
  box-sizing: border-box;
}
</style>