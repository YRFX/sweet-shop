import { ref } from 'vue'

// 全局用户状态
const cartInfo = ref({
    data:[],
    deliveryType:0,
    count: 0
})
// 登录

const addToCart = (good)=> {
    cartInfo.value.data.push({
        productId: good._id,
        product: {...good},
        num: good.count,
        checked: true
    })
    cartInfo.value.count += good.count
}

export {  cartInfo,addToCart}
