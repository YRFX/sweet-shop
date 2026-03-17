<template>
  <view class="cart-page">
    <!-- 空购物车 -->
    <view class="empty" v-if="cartInfo.data.length === 0">
      <text>购物车还是空的～</text>
    </view>

    <!-- 有商品 -->
    <view class="cart-list" v-else>
      <view class="cart-item" v-for="(item, idx) in cartInfo.data" :key="idx">
        <!-- 选择框 -->
        <view class="check" @click="toggleCheck(idx)">
          <view class="circle" :class="{ checked: item.checked }"></view>
        </view>

        <!-- 商品图片 -->
        <view class="goods-img" :style="{ backgroundImage: 'url(' + (item.images?.[0] || '') + ')' }"></view>

        <!-- 商品信息 -->
        <view class="goods-info">
          <view class="name">{{ item.name }}</view>
          <view class="price">¥ {{ Number(item.price).toFixed(2) }}</view>
        </view>

        <!-- 数量 -->
        <view class="num-box">
          <view class="btn" @click="minus(idx)">-</view>
          <view class="num">{{ item.num }}</view>
          <view class="btn" @click="plus(idx)">+</view>
        </view>
      </view>
    </view>

    <!-- 底部栏 -->
    <view class="bottom-bar">
      <!-- 全选 -->
      <view class="all-check" @click="toggleAll">
        <view class="circle" :class="{ checked: isAllChecked }"></view>
        <text>全选</text>
      </view>

      <!-- 合计 -->
      <view class="total">
        合计：<text>¥ {{ totalPrice }}</text>
      </view>

      <!-- 结算 -->
      <view class="pay" @click="toPay">去结算</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { userInfo } from '@/stores/user'
import { useCloud } from '@/utils/useCloud'
import { cartInfo } from '@/stores/cart'
import { onShow } from '@dcloudio/uni-app'

const { wxLogin } = useCloud()

// 页面显示时刷新商品数据
onShow(async () => {
  if (!cartInfo.value.data || cartInfo.value.data.length === 0) return

  try {
    const goodsIdList = cartInfo.value.data.map(item => item.productId)
    const db = wx.cloud.database()

    const res = await db.collection('goods')
      .where({ _id: db.command.in(goodsIdList) })
      .get()

    const latestGoodsList = res.data || []

    const newCart = cartInfo.value.data.map(cartItem => {
      const goods = latestGoodsList.find(g => g._id === cartItem.productId)
      if (!goods) return cartItem

      return {
        ...cartItem,
        ...goods,
        checked: cartItem.checked ?? true // 保留选中状态
      }
    })

    cartInfo.value.data = newCart
    calcTotal()

  } catch (err) {
    console.error('加载商品失败', err)
  }
})

// 数量+
const plus = (idx) => {
  cartInfo.value.data[idx].num++
  calcTotal()
}

// 数量-
const minus = (idx) => {
  if (cartInfo.value.data[idx].num <= 1) return
  cartInfo.value.data[idx].num--
  calcTotal()
}

// 单选
const toggleCheck = (idx) => {
  cartInfo.value.data[idx].checked = !cartInfo.value.data[idx].checked
  calcTotal()
}

// 全选
const isAllChecked = computed(() => {
  return cartInfo.value.data.length && cartInfo.value.data.every(i => i.checked)
})

const toggleAll = () => {
  const status = !isAllChecked.value
  cartInfo.value.data.forEach(i => i.checked = status)
  calcTotal()
}

// 计算总价
const totalPrice = ref('0.00')
const calcTotal = () => {
  let total = 0
  cartInfo.value.data.forEach(item => {
    if (item.checked) {
      const price = Number(item.price) || 0
      total += item.num * price
    }
  })
  totalPrice.value = total.toFixed(2)
}

calcTotal()

// 去结算
const toPay = () => {
  const hasChecked = cartInfo.value.data.some(i => i.checked)
  if (!hasChecked) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  if (!userInfo.value.isLogin) {
    uni.showModal({
      title: '请先登录',
      content: '是否授权微信快捷登录？',
      success: (res) => {
        if (res.confirm) {
          wxLogin()
        }
      }
    })
    return
  }

  uni.navigateTo({
    url: '/pages/order/index'
  })
}
</script>

<style scoped lang="scss">
.cart-page {
  width: 100%;
  min-height: 100vh;
  background: #fdfbf7;
  padding-bottom: 120rpx;
}

.empty {
  padding: 200rpx 0;
  text-align: center;
  color: #999;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  padding: 20rpx;
}

.check {
  padding: 0 10rpx;
}

.circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
}

.circle.checked {
  background: #f5e9e2;
  border-color: #d9c1b3;
}

.goods-img {
  width: 140rpx;
  height: 140rpx;
  background: #f5f1ec;
  background-size: cover;
  background-position: center;
  border-radius: 16rpx;
}

.goods-info {
  flex: 1;
  padding: 0 20rpx;
}

.name {
  font-size: 28rpx;
  color: #333;
}

.price {
  color: #c89f82;
  font-size: 26rpx;
  margin-top: 10rpx;
}

.num-box {
  display: flex;
  align-items: center;
}

.btn {
  width: 44rpx;
  height: 44rpx;
  background: #f5f1ec;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.num {
  padding: 0 16rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.04);
}

.all-check {
  display: flex;
  align-items: center;
}

.total {
  font-size: 26rpx;
}

.total text {
  color: #f56c6c;
  font-weight: bold;
}

.pay {
  background: #f5e9e2;
  color: #997c6c;
  padding: 16rpx 30rpx;
  border-radius: 50rpx;
  font-weight: bold;
}
</style>