<template>
    <view class="checkout-page">
  
      <!-- 地址区域 -->
      <view class="address-section" @click="goToAddress">
        <view v-if="hasDefaultAddress">
          <view class="default-tag" v-if="defaultAddress.isDefault">默认地址</view>
          <view class="name">{{ defaultAddress.name }}</view>
          <view class="phone">{{ defaultAddress.phone }}</view>
          <view class="addr">{{ defaultAddress.address }}</view>
        </view>
        <view v-else class="no-address">
          请添加收货地址 →
        </view>
        <text class="arrow">></text>
      </view>
  
      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="item" v-for="item in cartList" :key="item._id">
          <view class="name">{{ item.name }}</view>
          <view class="price">¥{{ item.price }}</view>
          <view class="count">x{{ item.count }}</view>
        </view>
      </view>
  
      <!-- 金额 -->
      <view class="price-section">
        <view class="row">
          <text>商品合计</text>
          <text>¥{{ totalPrice }}</text>
        </view>
        <view class="row">
          <text>配送费</text>
          <text>¥0</text>
        </view>
        <view class="row total">
          <text>实付款</text>
          <text>¥{{ totalPrice }}</text>
        </view>
      </view>
  
      <!-- 提交订单 -->
      <view class="submit-section">
        <view class="btn" @click="submitOrder">提交订单并支付</view>
      </view>
  
    </view>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { userInfo } from '@/stores/user'
import { onShow, onUnload } from '@dcloudio/uni-app'
  
  const cartList = ref([]) // 购物车
  const defaultAddress = ref({})
  const hasDefaultAddress = ref(false)
  const totalPrice = ref(0)
  
  // 页面显示时加载
  onShow(async () => {
    if (!userInfo.value.isLogin) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    loadDefaultAddress()
    loadCartData()
    calcTotal()
  })
  
  // 加载默认地址
  const loadDefaultAddress = async () => {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('address')
        .where({
          userId: userInfo.value.openid,
          isDefault: true
        })
        .get()
  
      if (res.data.length > 0) {
        defaultAddress.value = res.data[0]
        hasDefaultAddress.value = true
      } else {
        hasDefaultAddress.value = false
      }
    } catch (e) {}
  }
  
  // 加载购物车
  const loadCartData = () => {
    const cart = uni.getStorageSync('cart') || []
    cartList.value = cart
  }
  
  // 计算总价
  const calcTotal = () => {
    let total = 0
    cartList.value.forEach(item => {
      total += item.price * item.count
    })
    totalPrice.value = total
  }
  
  // 去地址页
  const goToAddress = () => {
    uni.navigateTo({
      url: '/pages/address/index'
    })
  }
  
  // 提交订单
  const submitOrder = () => {
    if (!hasDefaultAddress.value) {
      uni.showToast({ title: '请选择地址', icon: 'none' })
      return
    }
    if (cartList.value.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' })
      return
    }
  
    uni.showModal({
      title: '确认支付',
      content: `实付：¥${totalPrice.value}`,
      success: (res) => {
        if (res.confirm) {
          // 模拟支付成功
          uni.showToast({ title: '支付成功' })
  
          // 清空购物车
          uni.setStorageSync('cart', [])
  
          // 跳订单列表
          setTimeout(() => {
            uni.switchTab({ url: '/pages/order/index' })
          }, 1500)
        }
      }
    })
  }
  </script>
  
  <style scoped lang="scss">
  .checkout-page {
    width: 100%;
    min-height: 100vh;
    background: #f8f3f0;
  }
  
  /* 地址 */
  .address-section {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  
    .default-tag {
      display: inline-block;
      background: #ff7a7c;
      color: #fff;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
      font-size: 22rpx;
      margin-bottom: 10rpx;
    }
  
    .name {
      font-size: 30rpx;
      font-weight: 500;
    }
  
    .phone {
      font-size: 26rpx;
      color: #666;
      margin: 6rpx 0;
    }
  
    .addr {
      font-size: 26rpx;
      color: #999;
    }
  
    .no-address {
      color: #ff7a7c;
      font-size: 28rpx;
    }
  
    .arrow {
      font-size: 28rpx;
      color: #ccc;
    }
  }
  
  /* 商品 */
  .goods-section {
    background: #fff;
    padding: 0 30rpx;
  
    .item {
      display: flex;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0e6e2;
  
      &:last-child {
        border-bottom: none;
      }
    }
  
    .name {
      font-size: 28rpx;
      color: #333;
    }
  
    .price {
      color: #ff7a7c;
      font-weight: bold;
    }
  
    .count {
      color: #666;
    }
  }
  
  /* 价格 */
  .price-section {
    background: #fff;
    padding: 30rpx;
    margin-top: 20rpx;
  
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16rpx;
      font-size: 26rpx;
  
      &.total {
        margin-top: 10rpx;
        font-size: 30rpx;
        font-weight: bold;
        color: #ff7a7c;
      }
    }
  }
  
  /* 提交 */
  .submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
    .btn {
      height: 88rpx;
      background: #ff7a7c;
      color: #fff;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
    }
  }
  </style>