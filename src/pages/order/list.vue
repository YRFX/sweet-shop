<template>
  <view class="order-page">

    <!-- 未登录 -->
    <view class="no-login" v-if="!userInfo.isLogin">
      <text>请登录后查看订单</text>
      <view class="login-btn" @click="toLogin">立即登录</view>
    </view>

    <!-- 已登录 → 订单内容 -->
    <view class="content" v-else>
      <!-- 顶部 TAB -->
      <view class="tab-wrap">
        <view class="tab" :class="{ active: currentTab === '' }" @click="changeTab('')">
          <text>全部</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 0 }" @click="changeTab(0)">
          <text>待付款</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 1 }" @click="changeTab(1)">
          <text>已发货</text>
        </view>
      </view>

      <!-- 订单列表 -->
      <scroll-view
        scroll-y
        class="order-scroll"
        @refresherrefresh="onRefresh"
        @scrolltolower="onLoadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
      >
        <!-- 空订单 -->
        <view class="empty" v-if="orderList.length === 0 && !loading">
          <text>暂无订单</text>
        </view>

        <!-- 订单卡片 -->
        <view class="order-card" v-for="item in orderList" :key="item._id" @click="goDetail(item._id)">
          <view class="card-top">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="status" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
          </view>

          <view class="goods-list">
            <view class="goods-item" v-for="good in item.goods" :key="good._id">
              <view class="name">{{ good.name }}</view>
              <view class="num">x{{ good.buyCount }}</view>
            </view>
          </view>

          <view class="card-bottom">
            <text>实付：¥{{ item.totalPrice }}</text>
          </view>
        </view>

        <!-- 加载提示 -->
        <view class="load-tip" v-if="loading">加载中...</view>
        <view class="load-tip" v-if="noMore && orderList.length > 0">没有更多了</view>
      </scroll-view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow,onLoad } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'
import { useCloud } from '@/utils/useCloud'

const { wxLogin } = useCloud()
const db = wx.cloud.database()

// 接收外部参数
let currentTab = ref('')
const orderList = ref([])

// 分页加载
const pageSize = 8
const pageIndex = ref(1)
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)

// 接收来自个人中心的 status 参数
onLoad((options) => {
  if (options.status !== undefined) {
    currentTab.value = Number(options.status)
  }
  resetList()
  getOrderList()
})

// 页面显示刷新
onShow(() => {
  if (userInfo.value.isLogin) {
    resetList()
    getOrderList()
  }
})

// 切换TAB
const changeTab = (status) => {
  currentTab.value = status
  resetList()
  getOrderList()
}

// 重置列表
const resetList = () => {
  orderList.value = []
  pageIndex.value = 1
  noMore.value = false
}

// 获取订单列表
const getOrderList = async () => {
  if (!userInfo.value.isLogin || noMore.value) return
  loading.value = true

  try {
    let q = db.collection('orders').where({
      userId: userInfo.value.openid
    })

    if (currentTab.value !== '') {
      q = q.where({ status: currentTab.value })
    }

    const res = await q
      .orderBy('createTimeStamp', 'desc')
      .skip((pageIndex.value - 1) * pageSize)
      .limit(pageSize)
      .get()

    const data = res.data || []
    if (data.length < pageSize) noMore.value = true
    if (data.length > 0) orderList.value = [...orderList.value, ...data]

    pageIndex.value++
  } catch (e) {
    console.error('获取订单失败', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  resetList()
  getOrderList()
}

// 上拉加载
const onLoadMore = () => {
  if (!noMore.value && !loading.value) {
    getOrderList()
  }
}

// 状态文字
const statusText = (s) => {
  if (s === 0) return '待付款'
  if (s === 1) return '已完成'
  if (s === 2) return '已取消'
  return '未知'
}

// 状态颜色
const statusClass = (s) => {
  if (s === 0) return 'wait-pay'
  if (s === 1) return 'shipped'
  if (s === 2) return 'canceled'
  return 'normal'
}

// 去详情
const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

// 登录
const toLogin = () => {
  wxLogin()
}
</script>

<style scoped lang="scss">
/* INS 奶油极简风 */
.order-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f5f2;
  padding: 20rpx;
  box-sizing: border-box;
}

.no-login {
  padding: 200rpx 0;
  text-align: center;
  color: #999;
  .login-btn {
    background: #fff;
    padding: 22rpx 44rpx;
    border-radius: 50rpx;
    display: inline-block;
    margin-top: 24rpx;
    color: #333;
  }
}

.content {
  width: 100%;
}

/* 选项卡 */
.tab-wrap {
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  padding: 8rpx;
  margin-bottom: 28rpx;
  .tab {
    flex: 1;
    text-align: center;
    padding: 18rpx 0;
    border-radius: 18rpx;
    font-size: 26rpx;
    color: #666;
    &.active {
      background: #f2ebe5;
      color: #2d2d2d;
      font-weight: 500;
    }
  }
}

/* 滚动区域 */
.order-scroll {
  height: calc(100vh - 220rpx);
}

/* 空状态 */
.empty {
  padding: 160rpx 0;
  text-align: center;
  color: #ccc;
}

/* 加载提示 */
.load-tip {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  .card-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;
    .order-no { font-size: 24rpx; color: #666; }
    .status { font-size: 24rpx; font-weight: 500;
      &.wait-pay { color: #ff8a80; }
      &.shipped { color: #4caf50; }
      &.canceled { color: #999; }
    }
  }
  .goods-list {
    border-top: 1rpx solid #f2f0ed;
    padding-top: 20rpx;
    margin-bottom: 20rpx;
  }
  .goods-item {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;
    font-size: 26rpx;
    color: #333;
    .num { color: #999; }
  }
  .card-bottom {
    text-align: right;
    font-size: 26rpx;
    color: #ff8a80;
    font-weight: 500;
  }
}
</style>