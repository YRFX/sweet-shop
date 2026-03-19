<template>
    <view class="setting-page">
        <view class="card">
            <view class="item">
                <view class="left">
                    <text class="label">店铺营业状态</text>
                    <text class="tip">{{ switchShop ? '🟢 营业中' : '🔴 休息中' }}</text>
                </view>
                <switch :checked="switchShop" @change="onSwitchChange" />
            </view>
        </view>

        <view class="tips">
            关闭后用户将无法下单，仅管理员可见
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'

import { onLoad } from '@dcloudio/uni-app'

const db = wx.cloud.database()
const docId = "8d2e20b369bc022c00cc3b3e020bcc81"
const switchShop = ref(false)

// 加载状态
onLoad(async () => {
    try {
        const res = await db.collection('config').doc(docId).get()
        switchShop.value = res.data.isOpen
    } catch (e) {
        switchShop.value = true
    }
})

// 🔥 核心修复：正确修改 Boolean 类型！！！
const onSwitchChange = async (e) => {
    const val = e.detail.value

    try {
        // ✅ 正确写法：直接传对象，不要 data: {}
        await db.collection('config').doc(docId).update({
            data: {
                isOpen: val
            }
        })

        // 更新UI
        switchShop.value = val
        uni.showToast({
            title: val ? '已开店' : '已关店',
            icon: 'success'
        })
    } catch (err) {
        console.error('错误：', err)
        uni.showToast({ title: '保存失败', icon: 'none' })
    }
}
</script>

<style scoped lang="scss">
.setting-page {
    width: 100%;
    min-height: 100vh;
    background: #f7f5f2;
    padding: 20rpx;
    box-sizing: border-box;
}

.card {
    background: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    margin-top: 20rpx;
}

.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left {
    flex-direction: column;
    gap: 8rpx;
    display: flex;
}

.label {
    font-size: 30rpx;
    color: #333;
}

.tip {
    font-size: 24rpx;
    color: #999;
}

.tips {
    margin-top: 30rpx;
    text-align: center;
    font-size: 24rpx;
    color: #999;
}
</style>