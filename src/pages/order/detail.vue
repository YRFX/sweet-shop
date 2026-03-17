<template>
  <view class="order-detail">
    <view class="card">
      <view class="status">
        订单状态：
        <text v-if="order.status === 0" class="pending">待支付</text>
        <text v-else-if="order.status === 1" class="paid">已支付</text>
        <text v-else class="cancel">已取消</text>
      </view>

      <view class="addr">
        <view>收货人：{{ order.address?.name }}</view>
        <view>电话：{{ order.address?.phone }}</view>
        <view>地址：{{ order.address?.address }}</view>
      </view>

      <view class="goods-list">
        <view class="item" v-for="item in order.goods" :key="item._id">
          <view>{{ item.name }} x{{ item.buyCount }}</view>
          <view>¥{{ item.price * item.buyCount }}</view>
        </view>
      </view>

      <view class="total">
        实付金额：<text>¥{{ order.totalPrice }}</text>
      </view>
    </view>

    <!-- 待支付 显示按钮 -->
    <view class="btns" v-if="order.status === 0">
      <view class="btn cancel" @click="cancelOrder">取消支付</view>
      <view class="btn pay" @click="toPay">立即支付</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue'
import { userInfo } from '@/stores/user'
const db = wx.cloud.database()

const order = ref({})

onLoad(async (options) => {
  const { id } = options
  const res = await db.collection('orders').doc(id).get()
  order.value = res.data
})

// 取消订单
const cancelOrder = async () => {
  await db.collection('orders').doc(order.value._id).update({
    data: { status: 2 }
  })
  order.value.status = 2
  uni.showToast({ title: '已取消' })
}

// 支付（模拟 → 成功后改为已支付）
const toPay = async () => {
  wx.requestPayment({
    timeStamp: '',
    nonceStr: '',
    package: '',
    signType: 'MD5',
    paySign: '',
    success: async () => {
      await db.collection('orders').doc(order.value._id).update({
        data: { status: 1 }
      })
      order.value.status = 1
      uni.showToast({ title: '支付成功' })
    },
    fail: () => {
      uni.showToast({ title: '支付取消', icon: 'none' })
    }
  })
}
</script>

<style scoped lang="scss">
.order-detail {
  padding: 20rpx;
  background: #f8f3f0;
  min-height: 100vh;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}
.status {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.pending { color: #ff7a7c; }
.paid { color: #07c160; }
.cancel { color: #999; }
.addr {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30rpx;
}
.goods-list {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
}
.item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 28rpx;
}
.total {
  margin-top: 20rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #ff7a7c;
}
.btns {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}
.cancel { background: #eee; color: #666; }
.pay { background: #ff7a7c; color: #fff; }
</style>