const mysql = require('mysql2');
const crypto = require('crypto');

// 生成兑换券码
function generateCouponCode() {
    const randomBytes = crypto.randomBytes(48); // 生成48字节的随机字节序列
    const couponCode = randomBytes.toString('base64') // 将随机字节序列转换为Base64编码
      .replace(/\+/g, '-') // 替换+为-
      .replace(/\//g, '_') // 替换/为_
      .replace(/=+$/, '') // 去除末尾的=
      .slice(0, 64); // 截取前64个字符
  
    return couponCode;
}

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'antiai',
  password: '35gd2hyqn',
  database: 'coupon_database'
});

// 新建兑换券数据库
function createCouponDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(255) UNIQUE,
      isUsed BOOLEAN DEFAULT false,
      isSold BOOLEAN DEFAULT false
    )
  `;

  return new Promise((resolve, reject) => {
    pool.query(createTableQuery, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// 插入新的兑换券
function insertCoupon() {
  const code = generateCouponCode();
  const insertQuery = `
    INSERT INTO coupons (code) VALUES (?)
  `;

  return new Promise((resolve, reject) => {
    pool.query(insertQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(code);
      }
    });
  });
}

// 删除已存在的兑换券
function deleteCoupon(code) {
  const deleteQuery = `
    DELETE FROM coupons WHERE code = ?
  `;

  return new Promise((resolve, reject) => {
    pool.query(deleteQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.affectedRows > 0);
      }
    });
  });
}

// 将兑换券标记为已使用
function markCouponAsUsed(code) {
  const updateQuery = `
    UPDATE coupons SET isUsed = true WHERE code = ?
  `;

  return new Promise((resolve, reject) => {
    pool.query(updateQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.affectedRows > 0);
      }
    });
  });
}

// 将兑换券标记为已卖出
function markCouponAsSold(code) {
  const updateQuery = `
    UPDATE coupons SET isSold = true WHERE code = ?
  `;

  return new Promise((resolve, reject) => {
    pool.query(updateQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.affectedRows > 0);
      }
    });
  });
}

// 将兑换券标记为未卖出
function markCouponAsNotSold(code) {
  const updateQuery = `
    UPDATE coupons SET isSold = false WHERE code = ?
  `;

  return new Promise((resolve, reject) => {
    pool.query(updateQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.affectedRows > 0);
      }
    });
  });
}

// 查询某个兑换券是否被使用
function isCouponUsed(code) {
  const selectQuery = `
    SELECT isUsed FROM coupons WHERE code = ?
  `;

  return new Promise((resolve, reject) => {
    pool.query(selectQuery, [code], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          resolve(results[0].isUsed);
        } else {
          resolve(false);
        }
      }
    });
  });
}

// 随机查找第一个未被使用的兑换券码
function findUnusedCoupon() {
  const selectQuery = `
    SELECT code FROM coupons WHERE isUsed = false AND isSold = false ORDER BY RAND() LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    pool.query(selectQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          resolve(results[0].code);
        } else {
          resolve(null);
        }
      }
    });
  });
}

// 检查兑换券是否存在
function checkCouponExistence(code) {
    const selectQuery = `
      SELECT EXISTS(SELECT 1 FROM coupons WHERE code = ?) AS existence
    `;
  
    return new Promise((resolve, reject) => {
      pool.query(selectQuery, [code], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].existence === 1);
        }
      });
    });
}
  
module.exports = {
createCouponDatabase,
insertCoupon,
deleteCoupon,
markCouponAsUsed,
markCouponAsSold,
markCouponAsNotSold,
isCouponUsed,
findUnusedCoupon,
checkCouponExistence // 添加新的接口
};
  