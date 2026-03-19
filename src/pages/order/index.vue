<template>
  <view class="checkout-page">

    <!-- 取货方式：自提 / 配送 -->
    <view class="pick-type-bar">
      <view class="item" :class="{ active: cartInfo.deliveryType === 0 }" @click="setDelivery(0)">
        <text>到店自提</text>
      </view>
      <view class="item" :class="{ active: cartInfo.deliveryType === 1 }" @click="setDelivery(1)">
        <text>配送到家</text>
      </view>
    </view>

    <!-- 地址区域（仅配送显示） -->
    <view class="address-section" @click="goToAddress" v-if="cartInfo.deliveryType === 1">
      <view>
        <view class="default-tag" v-if="defaultAddress._id == userInfo.address">上次用过</view>
        <view class="name">姓名：{{ defaultAddress.name }}</view>
        <view class="phone">联系电话：{{ defaultAddress.phone }}</view>
        <view class="addr">收货地址：{{ defaultAddress.address }}</view>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 商品区域 -->
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
        <text>¥{{ deliveryFee }}</text>
      </view>
      <view class="row total">
        <text>实付款</text>
        <text>¥{{ totalPrice + deliveryFee }}</text>
      </view>
    </view>

    <!-- 提交订单 -->
    <view class="submit-section">
      <view class="btn" @click="submitOrder">提交订单并支付</view>
    </view>

  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'
import { cartInfo } from '@/stores/cart'

import { useCloud } from '@/utils/useCloud'
const {  isShopOpen } = useCloud()

const goodsList = ref([])
const defaultAddress = ref({})
const hasDefaultAddress = ref(false)
const totalPrice = ref(0)

// 取货方式 0=自提 1=配送
const deliveryFee = ref(0)
const DELIVERY_FEE = 5 // 配送费

const db = wx.cloud.database()

onShow(async () => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!await isShopOpen()) {
    uni.showToast({
      title: '店铺已休息，暂无法下单',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }

  await loadRealGoodsData()
  await loadDefaultAddress()
  calcTotalPrice()

  hasDefaultAddress.value = !!(defaultAddress.value && defaultAddress.value._id)
})

// 切换取货方式
const setDelivery = (val) => {
  cartInfo.value.deliveryType = val
  deliveryFee.value = val === 1 ? DELIVERY_FEE : 0
}



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
    } catch (e) { }
  }
  goodsList.value = result
}

// 加载地址
const loadDefaultAddress = async () => {
  try {
    defaultAddress.value = userInfo.value.addressInfo || {}
  } catch (e) { }
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

// 提交订单
const submitOrder = async () => {
  if (!await isShopOpen()) {
    uni.showToast({
      title: '店铺已休息，暂无法下单',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
  if (cartInfo.value.deliveryType === 1 && !hasDefaultAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  // 检查待支付订单
  const existOrder = await db.collection('orders')
    .where({
      userId: userInfo.value.openid,
      status: 0
    })
    .limit(1)
    .get()

  if (existOrder.data.length > 0) {
    uni.showToast({ title: '您有待支付订单', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: `/pages/order/detail?id=${existOrder.data[0]._id}` })
    }, 1200)
    return
  }

  // 重新计价
  let realTotalPrice = 0
  const orderGoodsList = []
  for (const item of cartInfo.value.data) {
    try {
      const goodsRes = await db.collection('goods').doc(item.productId).get()
      const goods = goodsRes.data
      if (!goods) continue
      const num = item.num
      realTotalPrice += goods.price * num
      orderGoodsList.push({
        _id: goods._id,
        name: goods.name,
        price: goods.price,
        buyCount: num
      })
    } catch (e) { }
  }

  if (orderGoodsList.length === 0) {
    uni.showToast({ title: '商品异常', icon: 'none' })
    return
  }

  const finalPay = realTotalPrice + deliveryFee.value

  // 订单号
  const createOrderNo = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 900 + 100))
    return `${year}${month}${day}${hour}${minute}${second}${random}`
  }
  const orderNo = createOrderNo()

  // 订单数据
  const orderData = {
    userId: userInfo.value.openid,
    deliveryType: cartInfo.value.deliveryType,    // 0自提1配送
    deliveryFee: deliveryFee.value,      // 配送费
    address: defaultAddress.value,
    orderNo: orderNo,
    goods: orderGoodsList,
    totalPrice: realTotalPrice,
    finalPay: finalPay,
    status: 0,
    createTime: new Date(),
    createTimeStamp: Date.now()
  }

  const addRes = await db.collection('orders').add({ data: orderData })
  uni.navigateTo({ url: `/pages/order/detail?id=${addRes._id}` })
}
</script>

<style scoped lang="scss">
.checkout-page {
  width: 100%;
  min-height: 100vh;
  background: #fdfbf7;
  padding-bottom: 120rpx;
}

/* 自提/配送 切换 */
.pick-type-bar {
  display: flex;
  background: #f5f1ec;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 6rpx;

  .item {
    flex: 1;
    text-align: center;
    padding: 22rpx 0;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #999;
  }

  .item.active {
    background: #fff;
    color: #c89f82;
    font-weight: bold;
  }
}

.address-section {
  background: #fff;
  padding: 30rpx;
  margin: 0 30rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .default-tag {
    display: inline-block;
    background: #f5e9e2;
    color: #997c6c;
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

  .arrow {
    font-size: 28rpx;
    color: #ccc;
  }
}

.goods-section {
  background: #fff;
  margin: 0 30rpx;
  border-radius: 20rpx;
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
    font-size: 30rpx;
    color: #333;
  }

  .price {
    font-size: 30rpx;
    color: #c89f82;
    font-weight: bold;
  }

  .count {
    font-size: 30rpx;
    color: #666;
  }
}

.price-section {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    font-size: 26rpx;

    &.total {
      margin-top: 10rpx;
      font-size: 30rpx;
      font-weight: bold;
      color: #c89f82;
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
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .btn {
    height: 88rpx;
    background: #f5e9e2;
    color: #997c6c;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: bold;
  }
}
</style>