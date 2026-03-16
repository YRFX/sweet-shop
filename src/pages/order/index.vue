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

    <!-- 商品区域（实时从云数据库获取） -->
    <view class="goods-section">
      <view class="item" v-for="item in goodsList" :key="item._id">
        <view class="name">{{ item.name }}</view>
        <view class="price">¥{{ item.price }}</view>
        <view class="count">x {{ item.buyCount }}</view>
      </view>
    </view>

    <!-- 价格计算 -->
    <view class="price-section">
      <view class="row">
        <text>商品总价</text>
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
import { onLoad } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'

// 接收的商品列表（id + count）
const goodsList = ref([])
const defaultAddress = ref({})
const hasDefaultAddress = ref(false)
const totalPrice = ref(0)

// 页面加载时接收参数：商品ID + 数量
onLoad(async (options) => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  // 接收前端传过来的商品列表
  const buyList = JSON.parse(decodeURIComponent(options.goods))
  console.log('购买商品：', buyList)

  // 实时从云数据库获取最新商品信息
  await loadRealGoodsData(buyList)

  // 加载默认地址
  await loadDefaultAddress()

  // 实时计算价格
  calcTotalPrice()
})

// 🔥 核心：根据ID实时拉取云数据库最新商品信息
const loadRealGoodsData = async (buyList) => {
  const db = wx.cloud.database()
  const result = []

  for (let g of buyList) {
    const res = await db.collection('goods').doc(g.id).get()
    if (res.data) {
      result.push({
        ...res.data,
        buyCount: g.count // 购买数量
      })
    }
  }

  goodsList.value = result
}

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
    }
  } catch (e) {}
}

// 🔥 实时计算总价
const calcTotalPrice = () => {
  let total = 0
  goodsList.value.forEach(item => {
    total += item.price * item.buyCount
  })
  totalPrice.value = total
}

// 去地址页
const goToAddress = () => {
  uni.navigateTo({ url: '/pages/address/index' })
}

// 提交订单
const submitOrder = () => {
  if (!hasDefaultAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认支付',
    content: `实付：¥${totalPrice.value}`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '支付成功', icon: 'success' })

        // 支付成功后跳订单页
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

  .name { font-size: 30rpx; font-weight: 500; }
  .phone { font-size: 26rpx; color: #666; margin: 6rpx 0; }
  .addr { font-size: 26rpx; color: #999; }
  .no-address { color: #ff7a7c; font-size: 28rpx; }
  .arrow { font-size: 28rpx; color: #ccc; }
}

.goods-section {
  background: #fff;
  padding: 0 30rpx;

  .item {
    display: flex;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0e6e2;

    &:last-child { border-bottom: none; }
  }

  .name { font-size: 28rpx; color: #333; }
  .price { color: #ff7a7c; font-weight: bold; }
  .count { color: #666; }
}

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

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);

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