<template>
    <view class="edit-page">
        <view class="form-item">
            <text>收货人</text>
            <input v-model="form.name" placeholder="请输入姓名" />
        </view>

        <view class="form-item">
            <text>手机号码</text>
            <input v-model="form.phone" placeholder="请输入手机号" />
        </view>

        <view class="form-item">
            <text>详细地址</text>
            <textarea v-model="form.address" placeholder="请输入详细地址"></textarea>
        </view>

        <view class="save-btn" @click="saveAddress">
            保存地址
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'

import { onLoad, onUnload } from '@dcloudio/uni-app'
import { userInfo } from '@/stores/user'

const form = ref({
    name: '',
    phone: '',
    address: ''
})

let editId = ''

onLoad(async (options) => {
    if (options.id) {
        editId = options.id
        // 编辑：读取原有数据显示
        const db = wx.cloud.database()
        const res = await db.collection('address').doc(options.id).get()
        form.value = res.data
    }
})

// 保存
const saveAddress = async () => {
    if (!form.value.name || !form.value.phone || !form.value.address) {
        uni.showToast({ title: '请填写完整', icon: 'none' })
        return
    }

    const db = wx.cloud.database()
    var addressId
    if (editId) {
        // 编辑模式
        let body = {
            name: form.value.name,
            phone: form.value.phone,
            address: form.value.address
        }
        await db.collection('address').doc(editId).update({
            data: body
        })
    } else {
        // 新增模式
        const data = {
            ...form.value,
            userId: userInfo.value._id
        }

        const dbData = await db.collection('address').add({ data })
        editId = dbData._id
    }
    await db.collection('users').doc(userInfo.value._id).update({
            data: {
                address: editId
            }
        })
    uni.showToast({ title: '保存成功' })
    setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style scoped lang="scss">
.edit-page {
    padding: 30rpx;
    background: #f8f3f0;
    min-height: 100vh;
}

.form-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    text {
        font-size: 28rpx;
        margin-bottom: 10rpx;
        display: block;
    }

    input,
    textarea {
        font-size: 28rpx;
        line-height: 1.4;
    }
}

.save-btn {
    margin-top: 40rpx;
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