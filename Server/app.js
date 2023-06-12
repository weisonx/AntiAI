
const http = require('http');
const fs = require('fs');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const {
  createCouponDatabase,
  insertCoupon,
  markCouponAsUsed,
  markCouponAsSold,
  isCouponUsed,
  findUnusedCoupon,
  checkCouponExistence
} = require('./couponDatabase');

//API KEY
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
// allow json body
app.use(express.json());
const server = http.createServer(app);

// 处理充值订单*******************************************************
// create a new order
app.post("/antiai/create-paypal-order", async (req, res) => {
  const order = await createOrder(5.00);
  res.json(order);
});

// capture payment & store order information or fullfill order
app.post("/antiai/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);

  //更新字符数,5元5000字符
  updateFreeTokens(getFreeTokens() + 5000);

});

// {url:"", prompt:"", coupon:""}

app.post('/antiai/api/data', async (req, res) => {
  const requestData = req.body;
  let len = 0;
  // let freeTokens = getFreeTokens();
  let responseData = '';

  len = requestData.text.length;
  const isExist = await checkCouponExistence(requestData.coupon);
  if (isExist)
  {
    const isUsed = await isCouponUsed(requestData.coupon);
    if (isUsed) {
      const errorMessage = `无效的兑换券: ${requestData.coupon}`;
      responseData = { content: errorMessage };
      res.status(200).json(responseData);
    }
    else {
      requestData.text = getMagic() + requestData.text;
      try {
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: requestData.text }],
        });
  
        const responseData = response.data.choices[0].message;
        // freeTokens -= 5000;
        // updateFreeTokens(freeTokens);
        res.status(200).json(responseData);
      } catch (error) {
        console.error('OpenAI API request error:', error);
        res.status(500).json(`OpenAI API request error: ${error}`);
      }
    }
  }
  else {
    const errorMessage = `兑换券不存在: ${requestData.coupon}`;
    responseData = { content: errorMessage };
    res.status(200).json(responseData);
  }
});

app.post('/antiai/conf/parameter', async (req, res) => {
  const data = req.body;

  fs.writeFile(magicFilePath, data, err => {
    if (err) {
      res.status(500).json(`Error writing to file: ${err}`);
    } else {
      res.status(200).json('File written successfully');
    }
  });
});

app.use((req, res) => {
  res.status(404).json('Not found');
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

//antiai接口**************************************************

// 魔鬼字文件路径
const magicFilePath = 'conf/magic';

function getFreeTokens() {
  let tokens = 0;
  tokens = parseInt(readFileContent('conf/free_tokens'));
  if (!isNaN(tokens)) {
    tokens = tokens;
  } else {
    tokens = 0;
  }
  return tokens;
}

function updateFreeTokens(tokens) {
  try {
    writeFileContent('conf/free_tokens', tokens.toString());
  } catch(error) {
    console.error('Eroor updating free tokens:', error);
    throw error;
  }
}

function getMagic() {
  let magic = ''
  magic =  readFileContent(magicFilePath);
  if(magic == null)
  {
    magic = "";
  }
  return magic;
}

//读取文件接口
function readFileContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

//写文件接口
function writeFileContent(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    console.error('Error writting file:', error);
    throw error;
  }
}

// paypal接口*************************************************************************

// For a fully working example, please see:
// https://github.com/paypal-examples/docs-examples/tree/main/standard-integration

// const { CLIENT_ID, APP_SECRET } = process.env;
const { CLIENT_ID, APP_SECRET } = {'CLIENT_ID': 'AX22c4WWVXa2EBXq97e0KcvMNYxeDgnWBJEuFps9XQNoUjE6bJlY-SbjsteCUzvtJZnkhyK4Ek0qBuAM',
                                    'APP_SECRET' : 'EFYi4_Z31JtZoPfl6N_laV2WRWSeOnmud437Y7KGPY1ufghzVgcZMK26-Dr1IF01Ih4e_S9ZykzlltDk'};
const baseURL = {
    sandbox: "https://api-m.sandbox.paypal.com",
    production: "https://api-m.paypal.com"
};

//////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
async function createOrder(value) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: value.toString(),
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
}


// use the orders api to capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
  const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}
