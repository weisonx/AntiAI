<template>
  <div>
    <!-- Set up a container element for the button -->
    <div id="paypal-button-container"></div>
  </div>
</template>

<script>
export default {
/* global paypal */
  mounted() {
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AX22c4WWVXa2EBXq97e0KcvMNYxeDgnWBJEuFps9XQNoUjE6bJlY-SbjsteCUzvtJZnkhyK4Ek0qBuAM&currency=USD";
    script.addEventListener("load", () => {
      this.initializePaypal();
    });
    document.body.appendChild(script);
  },
  methods: {
    initializePaypal() {
      paypal
        .Buttons({
          // Order is created on the server and the order id is returned
          createOrder() {
            return fetch("/antiai/create-paypal-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              // use the "body" param to optionally pass additional order information
              // like product skus and quantities
              body: JSON.stringify({
                cart: [
                  {
                    sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
                    quantity: "YOUR_PRODUCT_QUANTITY",
                  },
                ],
              }),
            })
              .then((response) => response.json())
              .then((order) => order.id);
          },
          // Finalize the transaction on the server after payer approval
          onApprove(data) {
            return fetch("/antiai/capture-paypal-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            })
              .then((response) => response.json())
              .then((orderData) => {
                // Successful capture! For dev/demo purposes:
                console.log(
                  "Capture result",
                  orderData,
                  JSON.stringify(orderData, null, 2)
                );
                const transaction =
                  orderData.purchase_units[0].payments.captures[0];
                alert(
                  `Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`
                );
                // When ready to go live, remove the alert and show a success message within this page. For example:
                // const element = document.getElementById('paypal-button-container');
                // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                // Or go to another URL:  window.location.href = 'thank_you.html';
              });
          },
        })
        .render("#paypal-button-container");
    },
  },
};
</script>
