<template>
  <view class="float-cart" @click="goCart">
    <view class="icon">🛒</view>
    <view class="badge" v-if="count > 0">{{ count }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const goCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

const setCartCount = (num) => {
  count.value = num
}

defineExpose({
  setCartCount
})
</script>

<style scoped lang="scss">
.float-cart {
  position: fixed;
  right: 30rpx;
  bottom: 120rpx;
  width: 90rpx;
  height: 90rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.icon {
  font-size: 36rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #f56c6c;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 8rpx;
  border-radius: 50%;
}
</style>