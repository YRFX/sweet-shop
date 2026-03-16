<template>
    <view class="product-page">

        <!-- 甜点大图 -->
        <view class="swiper-box">
            <swiper class="swiper" circular indicator-dots>
                <swiper-item>
                    <view class="img"></view>
                </swiper-item>
                <swiper-item>
                    <view class="img"></view>
                </swiper-item>
            </swiper>
        </view>

        <!-- 商品信息 -->
        <view class="info-card" v-if="goodDetail != null">
            <view class="title">{{ goodDetail.name }}</view>
            <view class="price">¥ {{ goodDetail.price }}</view>
            <view class="desc">¥ {{ goodDetail.desc }}</view>
        </view>

        <!-- 商品详情（纯展示，干净高级） -->
        <view class="detail-card" v-if="goodDetail != null">
            <view class="label">商品介绍</view>
            <view class="content">
                {{ goodDetail.content }}
            </view>
        </view>

        <!-- 底部购买栏 -->
        <view class="bottom-bar">
            <view class="btn-cart" @click="addCart(goodDetail)">加入购物车</view>
            <view class="btn-buy">立即购买</view>
        </view>

        <!-- 浮动购物车 -->
        <view class="float-cart" @click="goToCart">
            <view class="icon">🛒</view>
            <view class="badge" v-if="cartInfo.count > 0">{{ cartInfo.count }}</view>
        </view>

    </view>
</template>

<script setup>
import { ref } from 'vue'
import { useCloud } from '@/utils/useCloud'
import { cartInfo } from '@/stores/cart'
import { onLoad, onUnload } from '@dcloudio/uni-app'
const { getGoodDetail } = useCloud()


const cartCount = ref(0)
const goodDetail = ref(null)
const goodId = ref(-1)

// 加入购物车
const addCart = (item) => {
    var isExist = false
    for (var p of cartInfo.value.data) {
        if (p.productId == item._id) {
            p.num++;
            isExist = true
        }
       
    }
    if (!isExist) {
        cartInfo.value.data.push(
            {
                checked: true,
                productId: item._id,
                num: 1
            },
        )
    }
    cartInfo.value.count++
    uni.showToast({
        title: '已加入购物车',
        icon: 'success'
    })
}

// 去购物车
const goToCart = () => {
    uni.switchTab({
        url: '/pages/cart/index'
    })
}

const getProductDetail = (async (id) => {
    goodDetail.value = await getGoodDetail(id)
    console.log(goodDetail.value)
})

onLoad(async (options) => {
    goodId.value = options.id
    getProductDetail(goodId.value)
})

</script>

<style scoped lang="scss">
.product-page {
    background: #fdfbf7;
    min-height: 100vh;
    padding-bottom: 120rpx;
}

/* 轮播大图 */
.swiper-box {
    background: #fff;
}

.swiper {
    width: 100%;
    height: 420rpx;
}

.img {
    width: 100%;
    height: 100%;
    background: #f9ece6;
}

/* 信息卡片 */
.info-card {
    background: #fff;
    margin: 24rpx;
    padding: 30rpx;
    border-radius: 20rpx;
}

.title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 12rpx;
}

.price {
    font-size: 42rpx;
    color: #ff7a7c;
    font-weight: bold;
    margin-bottom: 12rpx;
}

.desc {
    font-size: 26rpx;
    color: #999;
    line-height: 1.5;
}

/* 详情卡片 */
.detail-card {
    background: #fff;
    margin: 0 24rpx;
    padding: 30rpx;
    border-radius: 20rpx;
}

.label {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
}

.content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.7;
}

/* 底部按钮 */
.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100rpx;
    background: #fff;
    display: flex;
    z-index: 99;
}

.btn-cart {
    flex: 1;
    background: #ffbb00;
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-buy {
    flex: 1;
    background: #ff7a7c;
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 浮动购物车 */
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
    background: #ff7a7c;
    color: #fff;
    font-size: 22rpx;
    padding: 4rpx 8rpx;
    border-radius: 50%;
}
</style>