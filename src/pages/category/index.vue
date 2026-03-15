<template>
    <view class="category-page">

        <!-- 顶部搜索框 -->
        <view class="search-box">
            <text class="search-icon">🔍</text>
            <text class="search-placeholder">搜索甜品、蛋糕...</text>
        </view>

        <!-- 左右布局容器 -->
        <view class="content-box">
            <!-- 左侧分类菜单 -->
            <view class="left-menu">
                <view class="menu-item" :class="{ active: activeIndex === index }" v-for="(item, index) in menuList"
                    :key="index" @click="selectMenu(index)">
                    {{ item }}
                </view>
            </view>

            <!-- 右侧商品列表（一行一列） -->
            <view class="right-goods">
                <view class="goods-item" v-for="i in 4" :key="i">
                    <view class="goods-img"></view>
                    <view class="goods-info">
                        <view class="goods-name">草莓慕斯蛋糕</view>
                        <view class="goods-price">¥ 49.00</view>
                    </view>
                    <!-- 加入购物车按钮 -->
                    <view class="add-cart" @click="addCart(i)">+</view>
                </view>
            </view>
        </view>


<!-- ====================== -->
    <!-- 直接在这里放悬浮购物车 ✅ -->
    <!-- ====================== -->
    <view class="float-cart" @click="goToCart">
      <view class="icon">🛒</view>
      <view class="badge" v-if="cartCount > 0">{{ cartCount }}</view>
    </view>

        <!-- ====================== -->
        <!-- 🔥 底部购物车合计栏（新加） -->
        <!-- ====================== -->
        <view class="bottom-bar">
            <view class="cart-info">
                <view class="cart-icon">🛒</view>
                <view class="cart-count">{{ cartCount }}</view>
                <view class="cart-total">合计：¥ {{ totalPrice }}</view>
            </view>
            <view class="pay-btn" @click="goToCart">去结算</view>
        </view>

    </view>
</template>

<script setup>
import { ref } from 'vue'

// 左侧分类菜单
const menuList = ref([
    '全部商品',
    '蛋糕系列',
    '甜品小食',
    '网红爆款',
    '饮品',
    '礼盒定制'
])

const activeIndex = ref(0)
const selectMenu = (index) => {
    activeIndex.value = index
}

// 购物车数量 + 合计金额
const cartCount = ref(0)
const totalPrice = ref(0)

// 加入购物车
const addCart = (i) => {
    cartCount.value++
    totalPrice.value = (totalPrice.value + 49.0).toFixed(2)
    uni.showToast({
        title: '已加入购物车',
        icon: 'success'
    })
}

// 跳转到购物车页面
const goToCart = () => {
    uni.switchTab({
        url: '/pages/cart/index'
    })
}
</script>

<style scoped lang="scss">
/* 整体页面 */
.category-page {
    width: 100%;
    min-height: 100vh;
    background: #fdfbf7;
    padding: 30rpx;
    box-sizing: border-box;
    padding-bottom: 120rpx;
    /* 给底部栏留出空间 */
}

/* 搜索框 */
.search-box {
    width: 100%;
    height: 80rpx;
    background: #fff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-sizing: border-box;
    margin-bottom: 30rpx;
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

/* 左右布局 */
.content-box {
    display: flex;
    height: calc(100vh - 200rpx);
}

/* 左侧菜单 */
.left-menu {
    width: 180rpx;
    padding-right: 20rpx;
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
    padding-left: 10rpx;
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
    background: #f5f1ec;
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

.add-cart {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
    width: 50rpx;
    height: 50rpx;
    background: #f5e9e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #997c6c;
    font-size: 32rpx;
}

/* ====================== */
/* 🔥 底部购物车合计栏 */
/* ====================== */
.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100rpx;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    box-sizing: border-box;

    .cart-info {
        display: flex;
        align-items: center;

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
            margin-right: 20rpx;
        }

        .cart-total {
            font-size: 26rpx;
            color: #333;
        }
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
</style>