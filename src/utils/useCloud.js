import { ref } from 'vue'
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

  const isShopOpen = async () => {
  try {
    const db = wx.cloud.database()
    const res = await db.collection('config')
      .doc('8d2e20b369bc022c00cc3b3e020bcc81')
      .get()
      console.log(res.data)
    return res.data?.isOpen ?? true
  } catch (e) {
    return true // 默认营业
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

const logging = ref(false)
// 点击登录
// 点击登录（防重复点击版）
// 点击登录（防重复点击 + 正常显示蒙层）
const toLogin = () => {
  if (logging.value) return

  uni.showModal({
    title: '微信登录',
    content: '是否授权微信快捷登录',
    success: async (res) => {
      if (res.confirm) {
        logging.value = true
        
        // 显示蒙层
        uni.showLoading({
          title: '登录中...',
          mask: true
        })

        try {
          // 等待登录完成
          await wxLogin()
          
          // 登录成功后再提示
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } catch (err) {
          uni.showToast({
            title: '登录失败',
            icon: 'none'
          })
        } finally {
          // 无论如何都关闭 loading 和锁
          logging.value = false
          uni.hideLoading()
        }
      }
    }
  })
}

  return {
    db,
    _,
    getGoodsList,
    getGoodDetail,
    addToCart,
    toLogin,
    isShopOpen
    // wxLogin
  }
  // #endif

  // 非微信端返回空
  return {
    getGoodsList: () => [],
    getGoodDetail: () => null,
    addToCart: () => false
  }
}