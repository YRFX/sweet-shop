<template>
  <view class="checkout-page">

    <!-- 地址区域 -->
    <view class="address-section" @click="goToAddress">
      <view>
        <view class="default-tag" v-if="defaultAddress._id == userInfo.address">上次用过</view>
        <view class="name">姓名：{{defaultAddress.name }}</view>
        <view class="phone">联系电话：{{ defaultAddress.phone }}</view>
        <view class="addr">收货地址：{{ defaultAddress.address }}</view>
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
import { onShow } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'
import { cartInfo } from '@/stores/cart'

const goodsList = ref([])
const defaultAddress = ref({})
const hasDefaultAddress = ref(false)
const totalPrice = ref(0)
const db = wx.cloud.database()

onShow(async () => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  await loadRealGoodsData()
  await loadDefaultAddress()
  calcTotalPrice()

  // 判断是否有地址
  hasDefaultAddress.value = !!(defaultAddress.value && defaultAddress.value._id)
})

// 实时加载最新商品数据
const loadRealGoodsData = async () => {
  const result = []
  for (let g of cartInfo.value.data) {
    try {
      const res = await db.collection('goods').doc(g.productId).get()
      if (res.data) {
        result.push({
          ...res.data,
          buyCount: g.num
        })
      }
    } catch (e) {}
  }
  goodsList.value = result
}

// 加载地址
const loadDefaultAddress = async () => {
  try {
    defaultAddress.value = userInfo.value.addressInfo || {}
  } catch (e) {}
}

// 计算总价
const calcTotalPrice = () => {
  let total = 0
  goodsList.value.forEach(item => {
    total += item.price * item.buyCount
  })
  totalPrice.value = total
}

// 去地址页
const goToAddress = () => {
  uni.navigateTo({ url: '/pages/address/index?isSelectMode=true' })
}

// ==============================================
// 🔥 你要的核心逻辑：提交订单（检查待支付 + 生成订单）
// ==============================================
// ==============================================
// 🔥 最终版：检查待支付订单 + 数据库重新计价 + 生成订单
// ==============================================
// ==============================================
// 🔥 最终版：检查待支付订单 + 数据库重新计价 + 生成时间
// ==============================================
const submitOrder = async () => {
  if (!hasDefaultAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  // 1. 先检查有没有待支付订单
  const existOrder = await db.collection('order')
    .where({
      userId: userInfo.value.openid,
      status: 0 // 0=待支付
    })
    .limit(1)
    .get()

  if (existOrder.data.length > 0) {
    const order = existOrder.data[0]
    uni.navigateTo({
      url: `/pages/order/detail?id=${order._id}`
    })
    return
  }

  // ==============================================
  // 🔥 核心：从数据库重新查询商品 + 重新计算价格（安全版）
  // ==============================================
  let realTotalPrice = 0
  const orderGoodsList = []

  for (const item of cartInfo.value.data) {
    try {
      // 从数据库查最新商品
      const goodsRes = await db.collection('goods').doc(item.productId).get()
      const goods = goodsRes.data

      if (!goods) continue

      // 数据库价格 × 购买数量
      const realPrice = goods.price
      const num = item.num

      // 累加到订单总价
      realTotalPrice += realPrice * num

      // 放入订单商品列表
      orderGoodsList.push({
        _id: goods._id,
        name: goods.name,
        price: realPrice, // 🔥 数据库真实价格
        buyCount: num
      })
    } catch (e) {
      console.error('商品查询失败', e)
    }
  }

  // 无商品 → 拦截
  if (orderGoodsList.length === 0) {
    uni.showToast({ title: '商品异常', icon: 'none' })
    return
  }

  // ==============================================
  // 🔥 生成订单（带时间 + 真实金额）
  // ==============================================
  const orderData = {
    userId: userInfo.value.openid,
    address: defaultAddress.value,
    goods: orderGoodsList,        // 🔥 从数据库查的商品
    totalPrice: realTotalPrice,  // 🔥 从数据库重算的金额
    status: 0,                   // 待支付
    createTime: new Date(),      // ✅ 生成时间（标准时间）
    createTimeStamp: Date.now()  // ✅ 时间戳（方便排序/查询）
  }

  const addRes = await db.collection('order').add({
    data: orderData
  })

  // 跳订单详情页
  uni.navigateTo({
    url: `/pages/order/detail?id=${addRes._id}`
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

  .name { font-size: 30rpx; color: #333; }
  .price { font-size: 30rpx;color: #ff7a7c; font-weight: bold; }
  .count { font-size: 30rpx;color: #666; }
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