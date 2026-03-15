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

    <!-- 2. 订单快捷入口 -->
    <view class="order-section">
      <view class="order-header">
        <text>我的订单</text>
        <text class="more">全部订单</text>
      </view>
      <view class="order-tab">
        <view class="tab-item">
          <text class="icon">📦</text>
          <text>待付款</text>
        </view>
        <view class="tab-item">
          <text class="icon">⏳</text>
          <text>待发货</text>
        </view>
        <view class="tab-item">
          <text class="icon">🚚</text>
          <text>待收货</text>
        </view>
        <view class="tab-item">
          <text class="icon">⭐</text>
          <text>待评价</text>
        </view>
      </view>
    </view>

    <!-- 3. 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-if="userInfo.isLogin" @click.stop="goToAddressList">
        <text>收货地址管理</text>
        <text>></text>
      </view>
      <view class="menu-item">
        <text>联系客服</text>
        <text>></text>
      </view>
      <view class="menu-item">
        <text>关于我们</text>
        <text>></text>
      </view>
    </view>

    <!-- 浮动购物车 -->
    <view class="global-float-cart" @click="goToCart">
      <view class="icon">🛒</view>
      <view class="badge" v-if="cartCount > 0">{{ cartCount }}</view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userInfo } from '../../stores/user';
import { useCloud } from '@/utils/useCloud'

const { wxLogin } = useCloud()
// const {userStore} =useUserStore();


const cartCount = ref(0)

const toLogin = () => {
  uni.showModal({
    title: '微信登录',
    content: '是否授权微信快捷登录',
    success: (res) => {
      if (res.confirm) {
        wxLogin()
        uni.showToast({ title: '登录成功', icon: 'success' })
      }
    }
  })
}


const goToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

const goToAddressList = () => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: '/pages/address/index'
  })
}
</script>

<style scoped lang="scss">
/* 背景加深一点，更耐看，对比更强 */
.mine-page {
  width: 100%;
  min-height: 100vh;
  background: #f8f3f0;
  /* 更干净的暖灰底 */
}

/* 用户头：更清晰 */
.user-section {
  background: #ffffff;
  padding: 60rpx 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  background: #fbe9e7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  margin-right: 30rpx;
}

.user-info {
  flex: 1;
}

.name {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.tip {
  font-size: 24rpx;
  color: #999999;
}

/* 订单模块：强化卡片感 */
.order-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 30rpx;
}

.more {
  font-size: 26rpx;
  color: #ff7a7c;
  /* 主色突出 */
}

.order-tab {
  display: flex;
  justify-content: space-between;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}

.tab-item .icon {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

/* 菜单：线条更清晰 */
.menu-section {
  background: #ffffff;
  padding: 0 30rpx;
  border-radius: 16rpx;
}

.menu-item {
  height: 100rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #f0e6e2;
}

.menu-item:last-child {
  border-bottom: none;
}

/* 浮动购物车 */
.global-float-cart {
  position: fixed;
  right: 30rpx;
  bottom: 120rpx;
  width: 90rpx;
  height: 90rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.12);
  z-index: 9999;
}

.global-float-cart .icon {
  font-size: 36rpx;
}

.global-float-cart .badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #ff7a7c;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 8rpx;
  border-radius: 50%;
}
</style>