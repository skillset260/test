const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const reviewFeatureOptionService = require("./service.reviewFeatureOption");
const reviewFeatureService = require("../revieweFeature/service.revieweFeature");
const { searchKeys } = require("./schema.reviewFeatureOption");
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
const { userEnum } = require("../../../utils/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let { reviewFeatureId, options } = req.body;

    /**
     * check reviewFeature exist
     */
    let reviewFeatureExist = await reviewFeatureService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(reviewFeatureId),
    });
    if (!reviewFeatureExist) {
      throw new ApiError(httpStatus.OK, "Please select valid review feature.");
    }

    //------------------create data-------------------
    let insertData = [];

    for (let opt of options) {
      let { language, featureOption } = opt;

      // check duplicate
      let alreadyExist = await reviewFeatureOptionService.getOneByMultiField({
        reviewFeatureId: new mongoose.Types.ObjectId(reviewFeatureId),
        language,
        featureOption,
      });

      if (!alreadyExist) {
        insertData.push({
          reviewFeatureId,
          reviewFeatureName: reviewFeatureExist.featureName,
          categoryId: reviewFeatureExist.categoryId,
          categoryName: reviewFeatureExist.categoryName,
          subCategoryId: reviewFeatureExist.subCategoryId,
          subCategoryName: reviewFeatureExist.subCategoryName,
          featureOption,
          language,
        });
      }
    }

    if (!insertData.length) {
      throw new ApiError(httpStatus.OK, "All options already exist.");
    }

    // insert
    let dataCreated = await reviewFeatureOptionService.createMany(insertData);

    if (dataCreated.length) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
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

//update start
exports.update = async (req, res) => {
  try {
    let { reviewFeatureId, featureOption, language } = req.body;
    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await reviewFeatureOptionService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Sub reviewFeature not found.`);
    }

    /**
     * check duplicate exist
     */
    let dataExist = await reviewFeatureOptionService.getOneByMultiField({
      _id: { $ne: new mongoose.Types.ObjectId(idToBeSearch) },
      reviewFeatureId: reviewFeatureId,
      featureOption: featureOption,
      language: language,
    });
    if (dataExist) {
      throw new ApiError(httpStatus.OK, "Review feature option already exist.");
    }

    /**
     * check reviewFeature exist
     */
    let reviewFeatureExist = await reviewFeatureService.getOneByMultiField({
      _id: new mongoose.Types.ObjectId(reviewFeatureId),
    });
    if (!reviewFeatureExist) {
      throw new ApiError(httpStatus.OK, "Please select valid review feature.");
    }
    req.body.reviewFeatureName = reviewFeatureExist.featureName;
    req.body.categoryId = reviewFeatureExist.categoryId;
    req.body.categoryName = reviewFeatureExist.categoryName;
    req.body.subCategoryId = reviewFeatureExist.subCategoryId;
    req.body.subCategoryName = reviewFeatureExist.subCategoryName;

    let dataUpdated = await reviewFeatureOptionService.getOneAndUpdate(
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
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have permission to access this.",
      );
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
    let objectIdFields = [];
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
      await reviewFeatureOptionService.aggregateQuery(finalAggregateQuery);
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
      await reviewFeatureOptionService.aggregateQuery(finalAggregateQuery);
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

    let dataExist =
      await reviewFeatureOptionService.aggregateQuery(additionalQuery);

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
      await reviewFeatureOptionService.aggregateQuery(additionalQuery);

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
    if (!(await reviewFeatureOptionService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let deleted = await reviewFeatureOptionService.getOneAndDelete({ _id });
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
    let dataExist = await reviewFeatureOptionService.getOneByMultiField({
      _id,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await reviewFeatureOptionService.getOneAndUpdate(
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
