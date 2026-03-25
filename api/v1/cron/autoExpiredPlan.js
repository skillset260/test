const moment = require("moment");
const customerSubscriptionService = require("../src/customerSubcription/service.customerSubcription");
const { planStatusEnum } = require("../../utils/enumUtils");

const autoExpirePlans = async () => {
  try {
    const today = moment().startOf("day").format("YYYY-MM-DD");
    const result = await customerSubscriptionService.updateMany(
      {
        planStatus: planStatusEnum.active,
        planExpiryDate: { $lt: today },
        isActive: true,
        isDeleted: false,
      },
      {
        $set: {
          planStatus: planStatusEnum.expired,
          isActive: false,
        },
      },
    );

    console.log(
      `[CRON] Auto plan expiry done | Modified: ${result.modifiedCount}`,
    );
    return true;
  } catch (error) {
    console.error("[CRON ERROR] autoExpirePlans failed:", error);
    return false;
  }
};

module.exports = { autoExpirePlans };
