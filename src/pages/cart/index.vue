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

    <!-- 底部栏 → 两行布局 -->
    <view class="bottom-bar">
      <!-- 第一行：取货方式 + 清空 -->
      <view class="row1">
        <view class="pick-type">
          <!-- 这里改成正确的 Vue 动态 class 写法 -->
          <view class="item" :class="{ active: type === 0 }" @click="type = 0">
            <text>自提</text>
          </view>
          <view class="item" :class="{ active: type === 1 }" @click="type = 1">
            <text>配送</text>
          </view>
        </view>
        <view class="clear-btn" @click="clearCart">清空购物车</view>
      </view>

      <!-- 第二行：全选 + 合计 + 结算 -->
      <view class="row2">
        <view class="all-check" @click="toggleAll">
          <view class="circle" :class="{ checked: isAllChecked }"></view>
          <text>全选</text>
        </view>

        <view class="right-group">
          <view class="total">
            合计：<text>¥ {{ totalPrice }}</text>
          </view>
          <view class="pay" @click="toPay">去结算</view>
        </view>
      </view>
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
const type = ref(0) // 0=自提 1=配送

// 页面显示时刷新
onShow(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.getTabBar) {
    const tabBar = currentPage.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 2 })
    }
  }

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
        checked: cartItem.checked ?? true
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

// 清空购物车
const clearCart = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空购物车所有商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartInfo.value.data = []
        calcTotal()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

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
  padding-bottom: 180rpx;
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

/* 底部双行栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(46px + 20rpx);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.04);
}

/* 第一行：自提/配送 + 清空 */
.row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.pick-type {
  display: flex;
  background: #f5f1ec;
  border-radius: 12rpx;
  padding: 4rpx;
}

.pick-type .item {
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  color: #999;
  border-radius: 8rpx;
}

.pick-type .item.active {
  background: #fff;
  // color: #c89f82;
  color: #ffffff;
  font-weight: bold;
}

.clear-btn {
  font-size: 24rpx;
  color: #999;
  background: #f5f1ec;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
}

/* 第二行：全选 + 合计 + 结算 */
.row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.all-check {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #333;
}

.right-group {
  display: flex;
  align-items: center;
  gap: 20rpx;
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
  font-size: 26rpx;
}
</style>