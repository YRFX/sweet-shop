
import { login } from "../stores/user"
// 微信云开发工具类
export const useCloud = () => {
  // #ifdef MP-WEIXIN
  const db = wx.cloud.database()
  const _ = db.command

  // 获取商品列表
  const getGoodsList = async () => {
    try {
      const res = await db.collection('goods').get()
      return res.data
    } catch (err) {
      console.error('获取商品失败', err)
      return []
    }
  }

  // 获取单个商品详情
  const getGoodDetail = async (id) => {
    try {
      const res = await db.collection('goods').doc(id).get()
      return res.data
    } catch (err) {
      console.error('获取详情失败', err)
      return null
    }
  }

  // 添加到购物车
  const addToCart = async (good) => {
    try {
      const userInfo = uni.getStorageSync('userInfo')
      await db.collection('cart').add({
        data: {
          userId: userInfo.openid,
          goodId: good._id,
          name: good.name,
          price: good.price,
          image: good.images?.[0] || '',
          num: 1,
          createTime: new Date()
        }
      })
      uni.showToast({ title: '加入购物车成功' })
      return true
    } catch (err) {
      uni.showToast({ title: '失败', icon: 'error' })
      return false
    }
  }

  // 微信登录
  // 微信登录（保留你原来风格 + 获取用户信息）
  // 微信登录（你原来的逻辑 + 自动保存用户 + 记录登录时间）
const wxLogin = async () => {
  try {
    // #ifdef MP-WEIXIN

    // 1. 先获取用户信息（昵称、头像）
    const profile = await wx.getUserProfile({
      desc: '用于登录展示'
    })

    // 2. 获取登录 code
    const { code } = await wx.login()

    // 3. 传给云函数，获取 openid
    const res = await wx.cloud.callFunction({
      name: 'login',
      data: {
        code: code,
        nickName: profile.userInfo.nickName
      }
    })

    // 4. 拿到完整用户信息
    const userInfo = res.result
    login(userInfo) // 存入全局状态
    return true
    // #endif
  } catch (e) {
    console.error('登录失败', e)
    return false
  }
}

  return {
    db,
    _,
    getGoodsList,
    getGoodDetail,
    addToCart,
    wxLogin
  }
  // #endif

  // 非微信端返回空
  return {
    getGoodsList: () => [],
    getGoodDetail: () => null,
    addToCart: () => false
  }
}