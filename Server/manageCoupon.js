const {
    createCouponDatabase,
    insertCoupon,
    markCouponAsUsed,
    markCouponAsSold,
    isCouponUsed,
    findUnusedCoupon,
    deleteCoupon
  } = require('./couponDatabase');
  
  async function runTests() {
    try {
      // 创建兑换券数据库
      await createCouponDatabase();
      console.log('兑换券数据库已创建');

      // 生成并插入10个兑换券
      for (let i = 0; i < 10; i++) {
        const code = await insertCoupon();
        console.log(`生成兑换券: ${code}`);
      }
  
      // 测试返回一些兑换券并打印到控制台
      const numCouponsToReturn = 5;
      for (let i = 0; i < numCouponsToReturn; i++) {
        const couponCode = await findUnusedCoupon();
        console.log(`返回兑换券: ${couponCode}`);
      }
  
      // 模拟卖出一些兑换券
      const numCouponsToSell = 3;
      for (let i = 0; i < numCouponsToSell; i++) {
        const couponCode = await findUnusedCoupon();
        await markCouponAsSold(couponCode);
        console.log(`已卖出兑换券: ${couponCode}`);
      }
  
      // 模拟使用一些兑换券
      const numCouponsToUse = 2;
      for (let i = 0; i < numCouponsToUse; i++) {
        const couponCode = await findUnusedCoupon();
        await markCouponAsUsed(couponCode);
        console.log(`已使用兑换券: ${couponCode}`);
      }
  
      // 模拟使用一个已被使用的兑换券而返回失败
      const usedCouponCode = await findUnusedCoupon();
      await markCouponAsUsed(usedCouponCode);
      console.log(`尝试使用已被使用的兑换券: ${usedCouponCode}`);
  
      const isUsed = await isCouponUsed(usedCouponCode);
      if (isUsed) {
        console.log(`兑换券使用失败`);
      } else {
        console.log(`兑换券使用成功`);
      }
  
    } catch (error) {
      console.error('测试出错:', error);
    } finally {
      // 清理测试数据（可选）
      // 注意：这将删除数据库中的所有兑换券数据，请谨慎使用此代码段
      
      // const unusedCoupons = await findUnusedCoupon();
      // for (const couponCode of unusedCoupons) {
      //   await deleteCoupon(couponCode);
      // }
      // console.log('清理测试数据: 已删除所有未使用的兑换券');
      
    }
  }
  
  runTests();
  