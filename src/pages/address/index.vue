<template>
    <view class="address-page">
  
      <!-- 地址列表 -->
      <view class="list">
        <view class="item" v-for="item in addressList" :key="item._id">
          <view class="info" @click.stop="editAddress(item)">
            <view class="default-tag" v-if="userInfo.address == item._id">上次用过</view>
            <view class="name-phone">
              <text class="name">{{ item.name }}</text>
            </view>
            <text class="addr">电话：{{ item.phone }}</text>
            <view class="addr">地址：{{ item.address }}</view>
          </view>
  
          <view class="operate">
            <text @click.stop="deleteAddress(item)">删除</text>
          </view>
        </view>
  
        <view class="empty" v-if="addressList.length === 0">
          暂无收货地址，点击下方添加
        </view>
      </view>
  
      <!-- 添加按钮 -->
      <view class="add-btn" @click="addAddress">
        + 添加新地址
      </view>
  
    </view>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
import { onLoad, onShow } from '@dcloudio/uni-app'
  import { userInfo } from '@/stores/user'
  
  const addressList = ref([])
  
  onShow(async () => {
    if (userInfo.value.isLogin) {
      loadAddressList()
    }
  })
  
  // 加载当前用户的所有地址
  const loadAddressList = async () => {
    const db = wx.cloud.database()
    const res = await db.collection('address')
      .where({ userId: userInfo.value._id })
      .get()
  
    addressList.value = res.data
  }
  
  // 添加
  const addAddress = () => {
    uni.navigateTo({ url: '/pages/address/edit' })
  }
  
  // 编辑
  const editAddress = (item) => {
    uni.navigateTo({
      url: '/pages/address/edit?id=' + item._id
    })
  }
  
  // 删除
  const deleteAddress = async (item) => {
    uni.showModal({
      title: '确认删除',
      success: async (res) => {
        if (res.confirm) {
          const db = wx.cloud.database()
          await db.collection('address').doc(item._id).remove()
          addressList.value = addressList.value.filter(i => i._id !== item._id)
          uni.showToast({ title: '删除成功' })
        }
      }
    })
  }
  </script>
  
  <style scoped lang="scss">
  .address-page {
    width: 100%;
    min-height: 100vh;
    background: #f8f3f0;
    padding: 20rpx;
    box-sizing: border-box;
  }
  .item {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .info { flex:1; }
  .default-tag {
    display: inline-block;
    background: #ff7a7c;
    color: #fff;
    font-size: 22rpx;
    padding: 4rpx 10rpx;
    border-radius: 6rpx;
    margin-bottom: 10rpx;
  }
  .name-phone {
    display: flex;
    gap: 20rpx;
    margin-bottom: 10rpx;
    .name { font-size:30rpx; font-weight:500; }
    .phone { font-size:26rpx; color:#666; }
  }
  .addr { font-size:26rpx; color:#999; line-height:1.4; }
  .operate {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    text { font-size:24rpx; color:#ff7a7c; }
  }
  .empty {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 26rpx;
  }
  .add-btn {
    position: fixed;
    bottom: 40rpx;
    left: 30rpx;
    right: 30rpx;
    height: 88rpx;
    background: #ff7a7c;
    color: #fff;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
  }
  </style>