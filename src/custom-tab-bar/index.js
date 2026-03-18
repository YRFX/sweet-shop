Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/home/index", text: "首页" },
      { pagePath: "/pages/category/index", text: "甜品" },
      { pagePath: "/pages/cart/index", text: "购物车" },
      { pagePath: "/pages/mine/index", text: "我的" },
    ]
  },

  methods: {
    switchTab(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      
      // 🔥 防止重复点击（关键修复）
      if (this.data.selected === index) return;

      const url = this.data.list[index].pagePath;

      // 🔥 先更新选中状态，再跳转（点击瞬间高亮，不卡顿）
      this.setData({ selected: index });

      wx.switchTab({ url });
    }
  }
});