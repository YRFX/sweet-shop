<template>
  <view class="page">

    <!-- 1. 顶部店名 -->
    <view class="shop-name">Sweet Life 甜品店</view>

    <!-- 3. Banner -->
    <view class="banner">
      <text class="banner-text">今日限定 · 新鲜制作</text>
    </view>

    <!-- 2. 用户状态（未登录 = 游客，点击登录） -->
    <view class="user-info" @click="toLogin">
      <view class="avatar">👤</view>
      <view class="nickname">
        {{ userInfo.isLogin ? userInfo.nickName+' 您好' : '游客 点击登录' }}
      </view>
    </view>
    
    <!-- 4. 热销产品 -->
    <view class="hot-title">热销产品</view>
    <view class="goods-list">
      <view class="goods-item" v-for="good in promoteGoodsList" :key="good._id">
        <view class="goods-img"  @click="goToProductDetail(good)"></view>
        <view class="goods-name">{{good.name}}</view>
        <view class="goods-price">¥ {{good.price}}</view>
      </view>
    </view>

   <CartFloat></CartFloat>

  </view>
</template>

<script setup>
import CartFloat from '../../components/CartFloat.vue';
import { userInfo } from '../../stores/user';
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useCloud } from '@/utils/useCloud'
const { wxLogin } = useCloud()
const { getGoodsList } = useCloud()


// 点击登录
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


const promoteGoodsList = ref([])

// 页面加载时读取云数据
onLoad(async () => {
  getPromoteGoods()
  console.log('🍰 云商品：', promoteGoodsList.value)
})

const getPromoteGoods = (async ()=> {
  const tempGoods = await getGoodsList()
  tempGoods.forEach(element => {
    promoteGoodsList.value.push(element)  
  });
})

// 隐藏 tabBar
// onLoad(() => {
//   uni.hideTabBar()
// })
// onUnload(() => {
//   uni.showTabBar()
// })
const goToProductDetail = (item) => {
  uni.navigateTo({
    url: "/pages/product/index?id=" + item._id 
  })
}

const goToAddress = () => {
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
.page {
  width: 100%;
  min-height: 100vh;
  background: #fdfbf7;
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 店名 */
.shop-name {
  padding-top: 60rpx;
  font-size: 44rpx;
  font-weight: 300;
  color: #333;
  letter-spacing: 4rpx;
  text-align: center;
  padding: 40rpx 0;
}

/* 用户状态 */
.user-info {
  display: flex;
  align-items: center;
  padding: 40rpx 0;

  .avatar {
    width: 70rpx;
    height: 70rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
  }

  .nickname {
    font-size: 40rpx;
    color: #777;
  }
}

/* Banner */
.banner {
  width: 100%;
  height: 320rpx;
  background: #f5e9e2;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  // margin-bottom: 40rpx;

  .banner-text {
    font-size: 32rpx;
    color: #997c6c;
  }
}

/* 热销标题 */
.hot-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
}

/* 商品列表 一行2列 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.goods-item {
  width: 48%;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 3rpx 15rpx rgba(0, 0, 0, 0.03);
}

.goods-img {
  width: 100%;
  height: 260rpx;
  background: #f5f1ec;
}

.goods-name {
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.goods-price {
  padding: 0 20rpx 24rpx;
  color: #c89f82;
  font-size: 26rpx;
  font-weight: bold;
}
</style>