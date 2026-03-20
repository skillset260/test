const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const { transactionStatus } = require("../../../utils/enumUtils");
const crypto = require("crypto");
const axios = require("axios");
const config = require("../../../../config/config");
const transactionService = require("../transaction/service.transaction");

/**
 * handle razorpay webhook
 */
exports.handleRazorpayWebhook = async (payload, signature) => {
  try {
    console.log("Razorpay Webhook Payload:", payload);
    /* ================= VERIFY WEBHOOK SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay_webhook_secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid webhook signature");
    }

    /* ================= EXTRACT DATA ================= */
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;

    if (!payment || !payment.order_id) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid Razorpay webhook payload",
      );
    }

    /* ================= UPDATE TRANSACTION ================= */
    if (event === "payment.captured" || event === "payment.failed") {
      await transactionService.getOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          $set: {
            paymentStatus:
              payment.status === "captured"
                ? transactionStatus.success
                : transactionStatus.failed,
            paymentId: payment.id,
            // paymentMode: payment.method,
            amount: payment.amount / 100,
            res: payment,
          },
        },
      );
    } else {
      console.log("Unhandled Razorpay event:", event);
    }

    return true;
  } catch (err) {
    console.error("Razorpay Webhook Error:", err);
    throw err;
  }
};

/**
 * use payment gateway
 */
exports.useGatewayApi = async ({ planId, productName, amount }) => {
  try {
    const secret = config.gateway_hash_secret;
    const payload = `${planId}|${amount}`;

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const response = await axios.post(
      "https://pay.codiotic.com/v1/order/create",
      {
        planId,
        productName,
        paymentGatewayName: "RAZORPAY",
        amount,
        hash,
      },
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    console.log("Gateway API Error:", err.response?.data || err.message);

    return {
      success: false,
      message: err.response?.data?.message || "Payment API failed",
    };
  }
};

/**
 * use payment gateway verify api
 */
exports.useGatewayVerifyPaymentApi = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const response = await axios.post(
      "https://pay.codiotic.com/v1/order/verify",
      {
        paymentGatewayName: "RAZORPAY",
        requestedData: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    console.log("Gateway API Error:", err.response?.data || err.message);

    return {
      success: false,
      message: err.response?.data?.message || "Payment API failed",
    };
  }
};
