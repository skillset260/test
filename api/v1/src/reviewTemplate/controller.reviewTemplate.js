const logger = require("../../../../config/logger");
const reviewTemplateService = require("./service.reviewTemplate");
const { errorRes } = require("../../../../utilities/resError");

//get api
exports.getReviewTemplates = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { language } = req.query;

    const data = await reviewTemplateService.generateReviewTemplates(
      businessId,
      language,
    );

    return res.status(200).json({
      message: "Review templates fetched successfully.",
      data,
      success: true,
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
