<template>
    <view class="category-page">

        <!-- 搜索框 - 固定置顶 -->
        <view class="search-box-sticky">
            <view class="search-box">
                <text class="search-icon">🔍</text>
                <text class="search-placeholder">搜索甜品、蛋糕...</text>
            </view>
        </view>

        <!-- 左右布局 -->
        <view class="content-box">
            <!-- 左侧菜单 -->
            <view class="left-menu">
                <view class="menu-item" :class="{ active: activeIndex === index }" v-for="(item, index) in menuList"
                    :key="index" @click="selectMenu(index)">
                    {{ item }}
                </view>
            </view>

            <!-- 右侧商品列表 -->
            <view class="right-goods">
                <view class="goods-item" v-for="good in goodsList" :key="good._id">
                    <view class="goods-img" :style="{ backgroundImage: 'url(' + good.images[0] + ')' }"></view>
                    <view class="goods-info">
                        <view class="goods-name">{{ good.name }}</view>
                        <view class="goods-price">¥ {{ Number(good.price).toFixed(2) }}</view>
                    </view>
                    <view class="choose-spec" @click="openSpec(good)">选规格</view>
                </view>
            </view>
        </view>

        <!-- 底部购物车合计栏 -->
        <view class="bottom-bar">
            <view class="cart-info">
                <view class="cart-icon">🛒</view>
                <view class="cart-count" v-if="cartInfo.count > 0">{{ cartInfo.count }}</view>

                <!-- 🔥 显示全部商品，横向滚动 + 不超出高度 -->
                <view class="cart-goods-list" v-if="cartInfo.data.length > 0">
                    <view class="cart-goods-item" v-for="(item, index) in cartInfo.data" :key="index">
                        {{ item.product?.name }} x{{ item.num }}
                    </view>
                </view>
                <view class="cart-empty" v-else>购物车为空</view>

            </view>
            <view class="pay-btn" @click="goToCart">去结算</view>
        </view>

        <!-- 半屏规格弹窗 -->
        <view class="spec-mask" v-if="showSpec" @click="closeSpec">
            <view class="spec-panel" @click.stop>
                <view class="spec-goods">
                    <view class="spec-img" :style="{ backgroundImage: 'url(' + currentGoods.images[0] + ')' }"></view>
                    <view class="spec-info">
                        <view class="spec-name">{{ currentGoods.name }}</view>
                    </view>
                </view>

                <view class="spec-count">
                    <text>购买数量</text>
                    <view class="count-box">
                        <view class="btn" @click="changeNum(-1)">-</view>
                        <view class="num">{{ buyNum }}</view>
                        <view class="btn" @click="changeNum(1)">+</view>
                    </view>
                </view>

                <view class="spec-confirm" @click="confirmAddCart">确认加入购物车</view>
            </view>
        </view>

    </view>
</template>

<script setup>
import { ref } from 'vue'

import { onShow } from '@dcloudio/uni-app'
import { cartInfo, addToCart } from '@/stores/cart'

const db = wx.cloud.database()

// 分类菜单
const menuList = ref([
    '全部商品', '蛋糕系列', '甜品小食', '网红爆款', '饮品', '礼盒定制'
])
const activeIndex = ref(0)
const selectMenu = (index) => {
    activeIndex.value = index
    loadGoodsList() // 切换分类刷新商品
}

// 商品列表（从云数据库读取）
const goodsList = ref([])

// 页面显示时加载线上商品
onShow(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.getTabBar) {
        const tabBar = currentPage.getTabBar()
        if (tabBar) {
            tabBar.setData({ selected: 1 }) // ✅ 甜品 = 1
        }
    }
    loadGoodsList()
})

// ==============================================
// 🔥 核心：从云数据库加载真实商品
// ==============================================
const loadGoodsList = async () => {
    try {
        let condition = {}

        // 分类筛选逻辑
        if (activeIndex.value === 1) condition.category = '蛋糕'
        if (activeIndex.value === 2) condition.category = '甜品'
        if (activeIndex.value === 3) condition.category = '网红爆款'
        if (activeIndex.value === 4) condition.category = '饮品'
        if (activeIndex.value === 5) condition.category = '礼盒定制'

        const res = await db.collection('goods').where(condition).get()
        goodsList.value = res.data
    } catch (e) {
        console.error('加载商品失败', e)
    }
}

// 规格弹窗
const showSpec = ref(false)
const currentGoods = ref({})
const buyNum = ref(1)

const openSpec = (good) => {
    currentGoods.value = good
    buyNum.value = 1
    showSpec.value = true
}
const closeSpec = () => { showSpec.value = false }

const changeNum = (step) => {
    let num = buyNum.value + step
    if (num < 1) num = 1
    buyNum.value = num
}

// 加入购物车（使用云数据库 _id）
const confirmAddCart = () => {
    console.log({
        _id: currentGoods.value._id,
        name: currentGoods.value.name,
        price: currentGoods.value.price,
        count: buyNum.value
    })
    addToCart({
        _id: currentGoods.value._id,
        name: currentGoods.value.name,
        price: currentGoods.value.price,
        count: buyNum.value
    })
    closeSpec()
    uni.showToast({ title: '加入成功', icon: 'success' })
}

// 去结算
const goToCart = () => {
    uni.switchTab({ url: '/pages/cart/index' })
}
</script>

<style scoped lang="scss">
/* 页面整体 */
.category-page {
    width: 100%;
    min-height: 100vh;
    background: #fdfbf7;
    padding-bottom: 120rpx;
    box-sizing: border-box;
}

/* 搜索栏 - 固定置顶 */
.search-box-sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fdfbf7;
    padding: 20rpx 30rpx;
    z-index: 99;
}

.search-box {
    width: 100%;
    height: 80rpx;
    background: #fff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-sizing: border-box;
    box-shadow: 0 3rpx 15rpx rgba(0, 0, 0, 0.04);

    .search-icon {
        font-size: 28rpx;
        margin-right: 16rpx;
    }

    .search-placeholder {
        font-size: 26rpx;
        color: #999;
    }
}

/* 内容布局 */
.content-box {
    display: flex;
    padding-top: 120rpx;
    padding-bottom: 46px;
    height: calc(100vh - 220rpx);
}

/* 左侧菜单 */
.left-menu {
    width: 180rpx;
    padding: 0 20rpx;
    box-sizing: border-box;

    .menu-item {
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        color: #666;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        background: #fff;
    }

    .menu-item.active {
        background: #f5e9e2;
        color: #997c6c;
        font-weight: bold;
    }
}

/* 右侧商品 */
.right-goods {
    flex: 1;
    overflow-y: auto;
    padding-right: 20rpx;
}

.goods-item {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    height: 180rpx;
    box-shadow: 0 3rpx 15rpx rgba(0, 0, 0, 0.03);
    position: relative;
}

.goods-img {
    width: 180rpx;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-color: #f5f1ec;
}

.goods-info {
    flex: 1;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .goods-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
    }

    .goods-price {
        color: #c89f82;
        font-size: 26rpx;
        font-weight: bold;
    }
}

.choose-spec {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
    padding: 10rpx 20rpx;
    background: #f5e9e2;
    border-radius: 30rpx;
    font-size: 24rpx;
    color: #997c6c;
}

/* 底部购物车 */
.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 46px;
    height: 100rpx;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    box-sizing: border-box;
    z-index: 10;

    .cart-info {
        display: flex;
        align-items: center;
        height: 100rpx;
        max-width: 70%;
    }

    .cart-icon {
        font-size: 36rpx;
        margin-right: 12rpx;
    }

    .cart-count {
        background: #f56c6c;
        color: #fff;
        font-size: 22rpx;
        padding: 2rpx 8rpx;
        border-radius: 20rpx;
        margin-right: 10rpx;
    }

    /* 🔥 全部商品横向显示 + 溢出隐藏 + 不超出父容器 */
    .cart-goods-list {
        display: flex;
        align-items: center;
        height: 100rpx;
        overflow: hidden;
        white-space: nowrap;
        padding-left: 4rpx;
    }

    .cart-goods-item {
        font-size: 24rpx;
        color: #666;
        margin-right: 12rpx;
        line-height: 100rpx;
        white-space: nowrap;
    }

    .cart-empty {
        font-size: 24rpx;
        color: #999;
        line-height: 100rpx;
    }

    .pay-btn {
        background: #f5e9e2;
        color: #997c6c;
        font-size: 26rpx;
        font-weight: bold;
        padding: 16rpx 30rpx;
        border-radius: 50rpx;
    }
}

/* 规格弹窗 */
.spec-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 999;
}

.spec-panel {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 40rpx 30rpx;
    box-sizing: border-box;
    padding-bottom: 50px;
}

.spec-goods {
    display: flex;
    margin-bottom: 40rpx;

    .spec-img {
        width: 150rpx;
        height: 150rpx;
        background-size: cover;
        background-position: center;
        background-color: #f5f1ec;
        border-radius: 16rpx;
        margin-right: 24rpx;
    }

    .spec-info {
        flex: 1;
        display: flex;
        align-items: center;

        .spec-name {
            font-size: 32rpx;
            color: #333;
        }
    }
}

.spec-count {
    margin-bottom: 50rpx;

    text {
        font-size: 28rpx;
        margin-bottom: 20rpx;
        display: block;
    }

    .count-box {
        display: flex;
        align-items: center;

        .btn {
            width: 60rpx;
            height: 60rpx;
            border: 1rpx solid #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30rpx;
        }

        .num {
            width: 80rpx;
            text-align: center;
            font-size: 30rpx;
        }
    }
}

.spec-confirm {
    height: 88rpx;
    background: #f5e9e2;
    color: #997c6c;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: bold;
}

page {
    padding-bottom: 46px;
    box-sizing: border-box;
}
</style>