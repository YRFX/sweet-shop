import { ref } from 'vue'

// 全局用户状态
const userInfo = ref({
  openid: '',
  nickName: '',
  isLogin: false,
  isGuest: true,
  address: ""
})
// 登录
const login = async (info) => {
  const dbUser = await saveUserToCloud(info)

  userInfo.value = {
    ...dbUser,
    isLogin: true,
    isGuest: false
  }
  uni.setStorageSync('userInfo', userInfo.value)
}


// 新增：保存/更新用户到云数据库（自动创建记录 + 更新登录时间）
const saveUserToCloud = async (res) => {
  try {
    // #ifdef MP-WEIXIN
    const db = wx.cloud.database()

    // 先查数据库里有没有这个用户
    const { data } = await db.collection('users')
      .where({ _openid: res.userInfo.openId })
      .get()
    var userData = {
      openid: res.userInfo.openId,
      nickName: res.nickName,
      address: "",
      lastLoginTime: new Date(), // 👈 记录最近登录时间
    }

    if (data.length === 0) {
      // 无用户 → 新增
      const dbData = await db.collection('users').add({ data: userData })
      userData._id = dbData._id
      console.log('✅ 云数据库：新增用户成功')
    } else {
      // 有用户 → 更新最近登录时间
      await db.collection('users').doc(data[0]._id).update({
        data: { lastLoginTime: new Date() }
      })
      userData = data[0]
      console.log('✅ 云数据库：更新登录时间成功')
    }
    return userData
    // #endif
  } catch (err) {
    console.error('保存用户失败', err)
  }
}


export { login, userInfo }

// export function useUserStore() {
//   // 初始化用户（打开小程序就调用）
//   const initUser = () => {
//     const cache = uni.getStorageSync('userInfo')
//     if (cache && cache.openid) {
//       userInfo.value = { ...cache, isLogin: true, isGuest: false }
//       console.log('✅ 自动登录成功')
//     } else {
//       userInfo.value = {
//         openid: '',
//         isLogin: false,
//         isGuest: true,
//         addressList: []
//       }
//       console.log('👤 当前为游客模式')
//     }
//   }

//   // 登录
//   const login = async (info) => {
//     userInfo.value = {
//       ...info,
//       isLogin: true,
//       isGuest: false
//     }
//     uni.setStorageSync('userInfo', userInfo.value)
//   }

//   // 退出登录
//   const logout = () => {
//     uni.removeStorageSync('userInfo')
//     initUser()
//   }

//   return {
//     userInfo,
//     initUser,
//     login,
//     logout
//   }
// }