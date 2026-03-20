const { default: mongoose } = require("mongoose");
const moment = require("moment");
const ApiError = require("../../../../utilities/apiErrorUtils");
const httpStatus = require("http-status");
const subscriptionPlanService = require("../subscriptionPlan/service.subscriptionPlan");
const customerService = require("../admins/service.admin");
const customerSubscriptionService = require("./service.customerSubcription");
const customerLedgerService = require("../customerLedger/service.customerLedger");
const transactionService = require("../transaction/service.transaction");
const subsRenewalHistoryService = require("../subsRenewalHistory/service.customerSubcription");
const {
  discountTypeEnum,
  ledgertypeEnum,
  planDurationEnum,
  paymentMethod,
  planStatusEnum,
  transactionStatus,
} = require("../../../utils/enumUtils");
const { useGatewayApi } = require("../paymentGatewy/paymentGatewayHelper");

/**
 * get customer details by id
 */
const getCustomerDetailsById = async (customerId) => {
  try {
    const customerExist = await customerService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(customerId),
    });

    if (!customerExist) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Customer not found.`);
    }
    return customerExist;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * get subscription details by id
 */
const getSubscriptionDetailsById = async (subscriptionPlanId) => {
  try {
    const subscriptionPlanExist =
      await subscriptionPlanService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(subscriptionPlanId),
      });

    if (!subscriptionPlanExist) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Subscription not found.`);
    }

    return subscriptionPlanExist;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * get plan expiry date
 */
const calculatePlanExpiryDate = (planStartDate, planDuration) => {
  const durationMap = {
    [planDurationEnum.monthly]: { value: 1, unit: "months" },
    [planDurationEnum.quarterly]: { value: 3, unit: "months" },
    [planDurationEnum.halfYearly]: { value: 6, unit: "months" },
    [planDurationEnum.yearly]: { value: 1, unit: "years" },
  };

  const duration = durationMap[planDuration];

  if (!duration) {
    throw new Error("Invalid plan duration");
  }

  return moment(planStartDate, "YYYY-MM-DD")
    .add(duration.value, duration.unit)
    .format("YYYY-MM-DD");
};

/**
 * calculate discount amount
 */
const calculateDiscount = (baseAmount, disType, disValue) => {
  if (!baseAmount || baseAmount <= 0) return 0;

  if (
    disType === discountTypeEnum.none ||
    disValue === undefined ||
    disValue === null ||
    disValue === "" ||
    disValue === 0 ||
    disValue === "0"
  ) {
    return 0;
  }

  let value =
    typeof disValue === "string" ? disValue.trim().replace("%", "") : disValue;

  value = parseFloat(value);

  if (isNaN(value) || value < 0) {
    throw new Error("Invalid discount value.");
  }

  if (disType === discountTypeEnum.percentage) {
    if (value > 100) {
      throw new Error("Invalid percentage discount value. Must be <= 100.");
    }
    return (baseAmount * value) / 100;
  }

  if (disType === discountTypeEnum.flat) {
    return value;
  }
  return 0;
};

/**
 * add customer ledger
 */
const createCustomerLedger = async (ledgerDetails) => {
  try {
    ledgerDetails = JSON.parse(JSON.stringify(ledgerDetails));
    let addLedger = await customerLedgerService.createNewData(ledgerDetails);

    if (addLedger) {
      const currentCustomer = await customerService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(ledgerDetails.customerId),
      });
      const prevDue = currentCustomer ? currentCustomer?.dueAmt : 0;

      const newDueAmt =
        ledgerDetails.type === ledgertypeEnum.debit
          ? prevDue + ledgerDetails.amount
          : prevDue - ledgerDetails.amount;
      await customerService.getByIdAndUpdate(
        new mongoose.Types.ObjectId(ledgerDetails.customerId),
        {
          $set: {
            dueAmt: newDueAmt,
            dueDate: ledgerDetails.dueDate,
          },
        },
      );
    }
    return addLedger;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * log renewal history
 */
const logRenewalHistory = async (logDetails) => {
  try {
    logDetails = JSON.parse(JSON.stringify(logDetails));
    delete logDetails._id;
    let addLog = await subsRenewalHistoryService.createNewData(logDetails);

    return addLog;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * add subscription plan for customer
 */
const addCustomerSubscription = async (req) => {
  try {
    let {
      customerId,
      subscriptionPlanId,
      planStartDate,
      discountType,
      discountValue,
      receivedAmt,
      dueDate,
      paymentMode,
    } = req.body;

    /**
     * get customer details
     */
    let customerDoc = await getCustomerDetailsById(customerId);
    req.body.customerName = customerDoc.name;
    req.body.customerEmail = customerDoc.email;

    /**
     * get subscription details
     */
    let susbcriptionExist =
      await getSubscriptionDetailsById(subscriptionPlanId);
    req.body["planName"] = susbcriptionExist.planName;
    req.body["planPrice"] = susbcriptionExist.planPrice;
    req.body["planDuration"] = susbcriptionExist.planDuration;

    /**
     * add plan expiry date
     */
    req.body["planExpiryDate"] = calculatePlanExpiryDate(
      planStartDate,
      susbcriptionExist.planDuration,
    );
    req.body["planAddedOn"] = moment().format("YYYY-MM-DD");

    /**
     * calculate discount and other final amounts
     */
    let calculatedDiscountAmount = await calculateDiscount(
      susbcriptionExist.planPrice,
      discountType,
      discountValue,
    );
    req.body["calculatedDisAmt"] = Math.min(
      calculatedDiscountAmount,
      susbcriptionExist.planPrice,
    );

    if (calculatedDiscountAmount > susbcriptionExist.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Discount (${calculatedDiscountAmount}) cannot be greater than plan price (${susbcriptionExist.planPrice})`,
      );
    }

    const amtAfterDiscount =
      susbcriptionExist.planPrice - calculatedDiscountAmount;
    req.body["amtAfterDiscount"] = Math.max(amtAfterDiscount, 0);
    const dueAmtTotal = req.body["amtAfterDiscount"] - receivedAmt;
    const dueAmt = Math.max(dueAmtTotal, 0);
    req.body["dueAmt"] = dueAmt;
    receivedAmt = Number(receivedAmt) || 0;

    if (dueAmt !== 0 && (!dueDate || dueDate === "")) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Due date is required when due amount is greater than 0.`,
      );
    }

    if (receivedAmt > amtAfterDiscount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Received amount (${receivedAmt}) cannot be greater than payable amount (${amtAfterDiscount}).`,
      );
    }

    /* ================= RAZORPAY FLOW ================= */
    if (paymentMode === paymentMethod.razorpay && amtAfterDiscount > 0) {
      req.body.planStatus = planStatusEnum.pending;
      req.body.paymentStatus = transactionStatus.pending;

      const subscription = await customerSubscriptionService.createNewData({
        ...req.body,
      });

      const order = await useGatewayApi({
        planId: subscription._id,
        productName: "REVIEWEE",
        amount: amtAfterDiscount,
      });

      /**
       * create transaction for online payment
       */
      let orderData = order?.data;
      await transactionService.createNewData({
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        planId: subscription._id,
        amount: amtAfterDiscount,
        paymentMode: paymentMethod.razorpay,
        paymentStatus: transactionStatus.pending,
        razorpayOrderId: orderData?.data?.id,
      });

      return {
        paymentRequired: true,
        planId: subscription._id,
        razorpayOrder: order.data,
      };
    }

    /**
     * add subscription
     */
    req.body.planStatus = planStatusEnum.active;
    req.body.paymentStatus = transactionStatus.success;
    let addCusSubscription = await customerSubscriptionService.createNewData({
      ...req.body,
    });
    if (!addCusSubscription) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Unable to add subscription. Please try again after some time.`,
      );
    }

    /**
     * create transaction for offline payment
     */
    await transactionService.createNewData({
      customerId: addCusSubscription.customerId,
      customerName: addCusSubscription.customerName,
      customerEmail: addCusSubscription.customerEmail,
      planId: addCusSubscription._id,
      amount: addCusSubscription.receivedAmt,
      paymentMode: paymentMethod.offline,
      paymentStatus: transactionStatus.success,
    });

    /**
     * add single ledger entry for the paid amount (after discount)
     */
    // 1. DR entry: Customer owes money for the plan (after discount)
    await createCustomerLedger({
      customerId: addCusSubscription.customerId,
      customerName: addCusSubscription.customerName,
      customerEmail: addCusSubscription.customerEmail,
      amount: addCusSubscription.amtAfterDiscount,
      type: ledgertypeEnum.debit,
      dueAmt: addCusSubscription.dueAmt,
      dueDate: dueDate,
      remark:
        addCusSubscription.calculatedDisAmt > 0
          ? `Buy plan ${addCusSubscription.planName} of Rs.${addCusSubscription.planPrice} with discount of Rs.${addCusSubscription.calculatedDisAmt}.`
          : `Buy plan ${addCusSubscription.planName} of Rs.${addCusSubscription.planPrice}.`,
    });

    // 2. CR entry: Customer paid partial/full amount
    if (receivedAmt > 0) {
      await createCustomerLedger({
        customerId: addCusSubscription.customerId,
        customerName: addCusSubscription.customerName,
        customerEmail: addCusSubscription.customerEmail,
        amount: receivedAmt,
        type: ledgertypeEnum.credit,
        dueAmt: addCusSubscription.dueAmt,
        dueDate: dueDate,
        remark:
          dueAmt > 0
            ? `Payment received of Rs.${receivedAmt} with due amount Rs.${dueAmt} when subscription added.`
            : `Full payment received of Rs.${receivedAmt} when subscription added.`,
      });
    }

    //add subscription log history
    let logDetails = {
      ...addCusSubscription.toObject(),
      customerSubscriptionId: addCusSubscription._id,
      planStartDate,
    };

    await logRenewalHistory(logDetails);
    return addCusSubscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * renew subscription plan for customer
 */
const renewCustomerSubscription = async (req) => {
  try {
    const customerSubscriptionId = req.params.id;
    let { planStartDate, discountType, discountValue, receivedAmt, dueDate } =
      req.body;

    /**
     * Fetch existing subscription
     */
    const existingSubscription =
      await customerSubscriptionService.getOneByMultiField({
        _id: customerSubscriptionId,
        isActive: true,
      });

    if (!existingSubscription) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer subscription not found.",
      );
    }

    /**
     * Extract necessary values from subscription
     */
    const { customerId, subscriptionPlanId, planDuration } =
      existingSubscription;

    const subscriptionPlan =
      await getSubscriptionDetailsById(subscriptionPlanId);

    const planExpiryDate = calculatePlanExpiryDate(planStartDate, planDuration);
    const planAddedOn = moment().format("YYYY-MM-DD");

    const calculatedDisAmt = await calculateDiscount(
      subscriptionPlan.planPrice,
      discountType,
      discountValue,
    );
    if (calculatedDisAmt > subscriptionPlan.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Discount (${calculatedDisAmt}) cannot be greater than plan price (${subscriptionPlan.planPrice}).`,
      );
    }

    const amtAfterDiscount = subscriptionPlan.planPrice - calculatedDisAmt;
    const dueAmt = Math.max(amtAfterDiscount - receivedAmt, 0);
    receivedAmt = Number(receivedAmt) || 0;

    if (dueAmt > 0 && (!dueDate || dueDate === "")) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Due date is required when due amount is greater than 0.",
      );
    }

    if (receivedAmt > amtAfterDiscount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Received amount (${receivedAmt}) cannot be greater than payable amount (${amtAfterDiscount}).`,
      );
    }

    /**
     * Update subscription
     */
    const updatedSubscription =
      await customerSubscriptionService.getByIdAndUpdate(
        customerSubscriptionId,
        {
          planExpiryDate,
          planStartDate,
          planRenewalDate: planAddedOn, // new field for tracking renewal
          discountType,
          discountValue,
          calculatedDisAmt,
          amtAfterDiscount,
          receivedAmt,
          dueAmt,
          dueDate,
        },
      );

    if (!updatedSubscription) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Failed to renew the subscription.",
      );
    }

    // Ledger entry for plan
    // Ledger entry: DR - plan amount after discount
    await createCustomerLedger({
      customerId,
      customerName: updatedSubscription.customerName,
      customerEmail: updatedSubscription.customerEmail,
      amount: amtAfterDiscount,
      type: ledgertypeEnum.debit,
      dueAmt: dueAmt,
      dueDate: dueDate,
      remark:
        calculatedDisAmt > 0
          ? `Renewed plan "${subscriptionPlan.planName}" of Rs.${subscriptionPlan.planPrice} with discount Rs.${calculatedDisAmt}. Start Date: ${planStartDate}, Renewal Date: ${planAddedOn}.`
          : `Renewed plan "${subscriptionPlan.planName}" of Rs.${subscriptionPlan.planPrice}. Start Date: ${planStartDate}, Renewal Date: ${planAddedOn}.`,
    });

    // Ledger entry for received amount
    // Ledger entry: CR - payment received
    if (receivedAmt > 0) {
      await createCustomerLedger({
        customerId,
        customerName: updatedSubscription.customerName,
        customerEmail: updatedSubscription.customerEmail,
        amount: receivedAmt,
        type: ledgertypeEnum.credit,
        dueAmt: dueAmt,
        dueDate: dueDate,
        remark:
          dueAmt > 0
            ? `Payment received of Rs.${receivedAmt} with due amount Rs.${dueAmt} for renewed subscription. Start Date: ${planStartDate}, Renewal Date: ${planAddedOn}.`
            : `Full payment received of Rs.${receivedAmt} for renewed subscription. Start Date: ${planStartDate}, Renewal Date: ${planAddedOn}.`,
      });
    }

    //log renewal history
    let logDetails = {
      ...updatedSubscription.toObject(),
      customerSubscriptionId: updatedSubscription._id,
      planStartDate,
    };

    await logRenewalHistory(logDetails);
    return updatedSubscription;
  } catch (err) {
    console.error("Error in renewCustomerSubscription:", err);
    throw err;
  }
};

/**
 * UPGRADE subscription plan with amount adjustment
 */
const upgradeSubscription = async (req) => {
  try {
    const activeSubscriptionPlanId = req.params.id;
    let {
      newPlanId,
      planStartDate,
      discountType,
      discountValue = 0,
      paymentMode,
      receivedAmt,
      dueDate,
    } = req.body;

    /* ================= FETCH CURRENT ACTIVE PLAN ================= */
    const currentActivePlan =
      await customerSubscriptionService.getOneByMultiField({
        _id: new mongoose.Types.ObjectId(activeSubscriptionPlanId),
        planStatus: planStatusEnum.active,
        isActive: true,
      });

    if (!currentActivePlan) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Active subscription plan not found.",
      );
    }

    const {
      customerId,
      customerName,
      customerEmail,
      planStartDate: currentPlanStartDate,
      planExpiryDate: currentPlanExpiryDate,
      planPrice: currentPlanPrice,
    } = currentActivePlan;

    /**
     * get subscription details
     */
    let newPackage = await getSubscriptionDetailsById(newPlanId);

    if (newPackage.planPrice <= currentPlanPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "You can only upgrade to a higher-priced plan.",
      );
    }

    /* ================= CALCULATE PLAN USAGE ================= */
    const today = moment().startOf("day");
    const startDate = moment(currentPlanStartDate, "YYYY-MM-DD");
    const expiryDate = moment(currentPlanExpiryDate, "YYYY-MM-DD");

    const totalDays = expiryDate.diff(startDate, "days");
    const daysUsed = Math.max(0, today.diff(startDate, "days"));
    const daysRemaining = Math.max(0, expiryDate.diff(today, "days"));

    const remainingAmount =
      totalDays > 0 ? (currentPlanPrice / totalDays) * daysRemaining : 0;

    const usedAmount =
      totalDays > 0 ? (currentPlanPrice / totalDays) * daysUsed : 0;

    /* ================= APPLY DISCOUNT ================= */
    const discountAmt = await calculateDiscount(
      newPackage.planPrice,
      discountType,
      discountValue,
    );

    if (discountAmt > newPackage.planPrice) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Discount cannot be greater than the plan price.",
      );
    }

    const newPlanAmountAfterDiscount = Math.max(
      newPackage.planPrice - discountAmt,
      0,
    );

    /* ================= FINAL AMOUNT CALCULATION ================= */
    const adjustedAmount = Math.max(
      newPlanAmountAfterDiscount - remainingAmount,
      0,
    );

    receivedAmt = Number(receivedAmt) || 0;
    const dueAmt = Math.max(adjustedAmount - receivedAmt, 0);

    if (receivedAmt > adjustedAmount) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Received amount cannot exceed payable amount.",
      );
    }

    if (dueAmt > 0 && !dueDate) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Due date is required when there is a pending due amount.",
      );
    }

    /* ================= CREATE NEW SUBSCRIPTION ================= */
    const planExpiryDate = moment(planStartDate, "YYYY-MM-DD")
      .add(newPackage.durationInDays, "days")
      .format("YYYY-MM-DD");

    const adjustmentDate = moment().format("YYYY-MM-DD");

    const newSubscriptionData = {
      customerId,
      customerName,
      customerEmail,
      subscriptionPlanId: new mongoose.Types.ObjectId(newPlanId),
      planName: newPackage.planName,
      planPrice: newPackage.planPrice,
      planDuration: newPackage.planDuration,
      planStartDate,
      planExpiryDate,
      amtAfterDiscount: adjustedAmount,
      receivedAmt,
      dueAmt,
      dueDate: dueDate || "",
      paymentMode: paymentMode || paymentMethod.offline,
      adjustmentAmount: remainingAmount,
      adjustmentDate,
      discountType,
      discountValue: discountValue.toString(),
    };

    /* ================= RAZORPAY FLOW ================= */
    if (paymentMode === paymentMethod.razorpay && adjustedAmount > 0) {
      newSubscriptionData.planStatus = planStatusEnum.pending;
      newSubscriptionData.paymentStatus = transactionStatus.pending;

      const subscription =
        await customerSubscriptionService.createNewData(newSubscriptionData);

      const order = await useGatewayApi({
        planId: subscription._id,
        productName: "REVIEWEE",
        amount: adjustedAmount,
      });

      await transactionService.createNewData({
        customerId,
        customerName,
        customerEmail,
        planId: subscription._id,
        amount: adjustedAmount,
        paymentMode: paymentMethod.razorpay,
        paymentStatus: transactionStatus.pending,
        razorpayOrderId: order.data.id,
      });

      return {
        paymentRequired: true,
        planId: subscription._id,
        razorpayOrder: order.data,
        adjustedAmount,
        remainingAmountFromOldPlan: remainingAmount,
      };
    }

    /* ================= OFFLINE FLOW ================= */
    newSubscriptionData.planStatus = planStatusEnum.active;
    newSubscriptionData.paymentStatus = transactionStatus.success;

    const subscription =
      await customerSubscriptionService.createNewData(newSubscriptionData);

    await customerSubscriptionService.getOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(activeSubscriptionPlanId) },
      { $set: { planStatus: planStatusEnum.expired, isActive: false } },
    );

    /* ================= TRANSACTION ================= */
    await transactionService.createNewData({
      customerId,
      customerName,
      customerEmail,
      planId: subscription._id,
      amount: receivedAmt,
      paymentMode: paymentMode || paymentMethod.offline,
      paymentStatus: transactionStatus.success,
    });

    /* ================= LEDGER ENTRIES ================= */

    // Credit: Adjustment from old plan
    if (remainingAmount > 0) {
      await createAdminLedger({
        customerId,
        customerName,
        customerEmail,
        type: ledgertypeEnum.credit,
        amount: remainingAmount,
        remark: `Unused balance of Rs.${remainingAmount.toFixed(
          2,
        )} from the previous plan "${
          currentActivePlan.planName
        }" has been credited.`,
        adjustmentAmount: remainingAmount,
        adjustmentReason: `The customer used ${daysUsed} days out of ${totalDays}. 
        The unused amount has been adjusted against the new plan.`,
        daysUsed,
        daysRemaining,
        oldPlanName: currentActivePlan.planName,
        newPlanName: newPackage.planName,
        oldPlanPrice: currentPlanPrice,
        newPlanPrice: newPackage.planPrice,
      });
    }

    // Debit: New plan charge
    await createAdminLedger({
      customerId,
      customerName,
      customerEmail,
      type: ledgertypeEnum.debit,
      amount: adjustedAmount,
      dueAmt,
      dueDate,
      remark: `Subscription upgraded to "${newPackage.planName}". 
      Net payable amount after adjustment is Rs.${adjustedAmount.toFixed(2)}.`,
      adjustmentAmount: remainingAmount,
      adjustmentReason: `Plan upgraded from "${currentActivePlan.planName}" to 
      "${newPackage.planName}". Previous balance adjusted.`,
      daysUsed,
      daysRemaining,
      oldPlanName: currentActivePlan.planName,
      newPlanName: newPackage.planName,
      oldPlanPrice: currentPlanPrice,
      newPlanPrice: newPackage.planPrice,
    });

    // Credit: Payment received
    if (receivedAmt > 0) {
      await createAdminLedger({
        customerId,
        customerName,
        customerEmail,
        type: ledgertypeEnum.credit,
        amount: receivedAmt,
        dueAmt,
        dueDate,
        remark:
          dueAmt > 0
            ? `Payment of Rs.${receivedAmt} received. Remaining due is Rs.${dueAmt}.`
            : `Full payment of Rs.${receivedAmt} received for the upgraded plan.`,
      });
    }

    return {
      ...subscription.toObject(),
      remainingAmountFromOldPlan: remainingAmount,
      adjustedAmount,
    };
  } catch (error) {
    console.error("Error in upgradeSubscription:", error);
    throw error;
  }
};

module.exports = {
  addCustomerSubscription,
  calculateDiscount,
  getCustomerDetailsById,
  getSubscriptionDetailsById,
  createCustomerLedger,
  renewCustomerSubscription,
  calculatePlanExpiryDate,
  logRenewalHistory,
  upgradeSubscription,
};
