const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const customerSubcriptionService = require("./service.customerSubcription");
const customerService = require("../admins/service.admin");
const customerLedgerService = require("../customerLedger/service.customerLedger");
const transactionService = require("../transaction/service.transaction");
const { searchKeys } = require("./schema.customerSubcription");
const { errorRes } = require("../../../../utilities/resError");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");
const {
  addCustomerSubscription,
  createCustomerLedger,
  renewCustomerSubscription,
  logRenewalHistory,
  upgradeSubscription,
} = require("./helper.customerSubscription");
const {
  ledgertypeEnum,
  userEnum,
  planStatusEnum,
  transactionStatus,
} = require("../../../utils/enumUtils");
const {
  useGatewayVerifyPaymentApi,
} = require("../paymentGatewy/paymentGatewayHelper");

//add start
exports.add = async (req, res) => {
  try {
    let addSubscription = await addCustomerSubscription(req);

    if (addSubscription) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: addSubscription,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

exports.confirmOnlinePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    /* ================= VERIFY VIA GATEWAY ================= */
    const paymentResponse = await useGatewayVerifyPaymentApi({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (paymentResponse?.data?.status === false) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Unable to verify the payment. Please try again later.",
      );
    }
    const payment = paymentResponse?.data;

    /* ================= FIND PENDING SUBSCRIPTION ================= */
    const subscription = await customerSubcriptionService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(planId),
      planStatus: planStatusEnum.pending,
    });

    if (!subscription) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Pending subscription not found.",
      );
    }

    /* ================= ACTIVATE CURRENT PLAN ================= */
    subscription.planStatus = planStatusEnum.active;
    subscription.paymentStatus = transactionStatus.success;
    subscription.receivedAmt = payment.data.amount;
    subscription.razorpayPaymentId = payment.data.paymentId;
    subscription.razorpayOrderId = payment.data.orderId;

    const updatedPackage = await subscription.save();
    if (!updatedPackage) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Unable to process the payment. Please try again later.",
      );
    }

    /**
     * update transaction for online payment
     */
    await transactionService.getOneAndUpdate(
      {
        razorpayOrderId: subscription.razorpayOrderId,
      },
      {
        $set: {
          paymentStatus: transactionStatus.success,
          paymentId: subscription.razorpayPaymentId,
        },
      },
    );

    /* ================= EXPIRE PREVIOUS ACTIVE PLAN (NEW) ================= */
    await customerSubcriptionService.getOneAndUpdate(
      {
        customerId: subscription.customerId,
        planStatus: planStatusEnum.active,
        _id: { $ne: subscription._id }, // don't expire new plan
      },
      {
        $set: {
          planStatus: planStatusEnum.expired,
          isActive: false,
        },
      },
    );

    /* ================= LEDGER ================= */
    const isUpgrade =
      subscription.adjustmentAmount !== undefined &&
      Number(subscription.adjustmentAmount) > 0;

    const remainingAmount = Number(subscription.adjustmentAmount || 0);
    const adjustedAmount = Number(subscription.amtAfterDiscount || 0);
    const receivedAmt = Number(subscription.receivedAmt || 0);
    const dueAmt = Number(subscription.dueAmt || 0);
    const dueDate = subscription.dueDate || "";

    if (isUpgrade) {
      // Upgrade flow with adjustment (online payment)

      // 1) DR - Adjusted amount (new plan payable after adjustment)
      await createCustomerLedger({
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        amount: adjustedAmount,
        dueAmt: dueAmt,
        dueDate: dueDate,
        type: ledgertypeEnum.debit,
        remark: `Plan upgraded via Razorpay. Adjusted payable amount Rs.${adjustedAmount.toFixed(
          2,
        )}. Old plan remaining amount Rs.${remainingAmount.toFixed(
          2,
        )} is adjusted here.`,
        adjustmentAmount: remainingAmount,
      });

      // 2) CR - Combined credit: adjustment + payment received
      if (remainingAmount > 0 || receivedAmt > 0) {
        const combinedCredit = remainingAmount + receivedAmt;

        await createCustomerLedger({
          customerId: subscription.customerId,
          customerName: subscription.customerName,
          customerEmail: subscription.customerEmail,
          amount: combinedCredit,
          dueAmt: dueAmt,
          dueDate: dueDate,
          type: ledgertypeEnum.credit,
          remark:
            dueAmt > 0
              ? `Upgrade via Razorpay: Payment Rs.${receivedAmt.toFixed(
                  2,
                )}, adjustment from old plan Rs.${remainingAmount.toFixed(
                  2,
                )}, total credit Rs.${combinedCredit.toFixed(
                  2,
                )}, due amount Rs.${dueAmt.toFixed(2)}.`
              : `Upgrade via Razorpay: Payment Rs.${receivedAmt.toFixed(
                  2,
                )}, adjustment from old plan Rs.${remainingAmount.toFixed(
                  2,
                )}, total credit Rs.${combinedCredit.toFixed(
                  2,
                )}, no due amount remaining.`,
          adjustmentAmount: remainingAmount,
          adjustmentReason: `Old plan remaining amount Rs.${remainingAmount.toFixed(
            2,
          )} adjusted against new upgraded plan along with payment Rs.${receivedAmt.toFixed(
            2,
          )} (online).`,
        });
      }
    } else {
      // Normal activation flow (no adjustment)

      // 1) DR - Plan amount after discount
      await createCustomerLedger({
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        amount: adjustedAmount,
        dueAmt: dueAmt,
        dueDate: dueDate,
        type: ledgertypeEnum.debit,
        remark: `Plan purchased.`,
      });

      // 2) CR - Payment received
      if (receivedAmt > 0) {
        await createCustomerLedger({
          customerId: subscription.customerId,
          customerName: subscription.customerName,
          customerEmail: subscription.customerEmail,
          amount: receivedAmt,
          dueAmt: dueAmt,
          dueDate: dueDate,
          type: ledgertypeEnum.credit,
          remark:
            dueAmt > 0
              ? `Payment received of Rs.${receivedAmt.toFixed(
                  2,
                )} via Razorpay with due amount Rs.${dueAmt.toFixed(2)}.`
              : `Full payment received of Rs.${receivedAmt.toFixed(
                  2,
                )} via Razorpay.`,
        });
      }
    }

    /* ================= LOG ================= */
    let subscriptionObj = subscription.toObject();
    subscriptionObj["customerSubscriptionId"] = subscriptionObj._id;
    delete subscriptionObj._id;

    await logRenewalHistory(subscriptionObj);

    /* ================= RESPONSE ================= */
    return res.status(200).send({
      status: true,
      message: "Payment verified successfully",
      data: {
        subscription,
        razorpayPayment: {
          id: payment.id,
          status: payment.status,
          method: payment.method,
          amount: payment.amount / 100,
        },
      },
    });
  } catch (err) {
    console.error("confirmOnlinePayment error:", err);
    return res.status(err.statusCode || 500).send({
      status: false,
      message: err.message || "Payment verification failed",
      data: null,
    });
  }
};

//update payment
exports.updatePayment = async (req, res) => {
  try {
    const { receivedAmt, dueAmt, remark, dueDate } = req.body;
    let idToBeSearch = req.params.id;

    const customerExist = await customerService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(idToBeSearch),
    });

    if (!customerExist) {
      throw new ApiError(httpStatus.OK, "Customer not found.");
    }

    const prevDue = customerExist.dueAmt || 0;
    const newDueAmt = Math.max(prevDue - receivedAmt, 0);

    if (newDueAmt !== 0 && (!dueDate || dueDate === "")) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Due date is required when due amount is greater than 0.`,
      );
    }

    // Generate final remark
    const finalRemark =
      remark && remark.trim() !== ""
        ? remark
        : newDueAmt > 0
          ? `Payment received of Rs.${receivedAmt} with due amount Rs.${newDueAmt}.`
          : `Payment received of Rs.${receivedAmt}.`;

    // Add a customer ledger entry with type "CR"
    const addPayment = await createCustomerLedger({
      customerId: customerExist._id,
      customerName: customerExist.name,
      customerEmail: customerExist.email,
      amount: receivedAmt,
      type: ledgertypeEnumEnum.credit,
      remark: finalRemark,
      dueAmt: newDueAmt,
      dueDate: dueDate,
    });

    if (addPayment) {
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: addPayment,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Something went wrong.");
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update start
exports.update = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await customerSubcriptionService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Customer subcription not found.`);
    }

    let dataUpdated = await customerSubcriptionService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      },
    );

    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//renewal start
exports.renewSubscription = async (req, res) => {
  try {
    let dataUpdated = await renewCustomerSubscription(req);
    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//upgrade start
exports.upgradeSubscriptionPlan = async (req, res) => {
  try {
    let dataCreated = await upgradeSubscription(req);
    if (dataCreated) {
      return res.status(200).send({
        message: "Package upgraded successfully.",
        data: dataCreated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// all filter pagination api
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    if (req.userData.userType !== userEnum.superAdmin) {
      matchQuery = {
        $and: [
          { isDeleted: false },
          { customerId: new mongoose.Types.ObjectId(req.userData.Id) },
        ],
      };
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue,
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = ["customerId"];
    let withoutRegexFields = [];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields,
      withoutRegexFields,
    );

    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys,
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound =
      await customerSubcriptionService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired,
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result =
      await customerSubcriptionService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//get api
exports.get = async (req, res) => {
  try {
    let additionalQuery = [{ $match: { isDeleted: false, isActive: true } }];
    if (req.userData.userType !== userEnum.superAdmin) {
      additionalQuery = [
        {
          $match: {
            isDeleted: false,
            isActive: true,
            customerId: new mongoose.Types.ObjectId(req.userData.Id),
            planStatus: planStatusEnum.active,
          },
        },
      ];
    }

    let dataExist =
      await customerSubcriptionService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//get ledger api
exports.getLedgerById = async (req, res) => {
  try {
    let customerId = req.params.id;

    let additionalQuery = [
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          isDeleted: false,
          isActive: true,
        },
      },
    ];

    let dataExist = await customerLedgerService.aggregateQuery(additionalQuery);

    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Ledger data not found.");
    }

    const customer = await customerService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(customerId),
    });

    if (!customer) {
      throw new ApiError(httpStatus.OK, "Customer not found.");
    }

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      status: true,
      data: dataExist,
      dueAmt: customer.dueAmt ? customer.dueAmt : 0,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
    ];

    let dataExist =
      await customerSubcriptionService.aggregateQuery(additionalQuery);

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await customerSubcriptionService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let deleted = await customerSubcriptionService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull!",
      status: true,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await customerSubcriptionService.getOneByMultiField({
      _id,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await customerSubcriptionService.getOneAndUpdate(
      { _id },
      { isActive },
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
