
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
async function createOrder() {
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
            value: "100.00",
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
