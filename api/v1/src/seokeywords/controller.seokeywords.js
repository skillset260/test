const ReviewFeatureService = require("./service.seokeywords");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../../utilities/apiErrorUtils");
const { errorRes } = require("../../../../utilities/resError");
const {userEnum } = require("../../../utils/enumUtils");
const mongoose = require("mongoose");

class ReviewFeatureController {

// all filter pagination api
async allFilterPagination (req, res) {
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
         throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access.");

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
    let booleanFields = ["isActive"];
    let numberFileds = [];
    let objectIdFileds = [];
    let withoutRegexFields = [];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFileds,
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
    let dataFound = await adminService.aggregateQuery(finalAggregateQuery);
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

    let result = await adminService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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
 /**
   * GET /ReviewFeatures
   * List ReviewFeatures with pagination + search
   */
  async getAll(req, res) {
    try {
      const result = await ReviewFeatureService.getAllReviewFeatures(req.query);
      return res.status(httpStatus.OK).send({
          message: "ReviewFeatures fetched successfully",
          status: true,
          result,
          code: "OK",
          issue: null,
        });
      } catch (error) {
        console.log(error);
    
        let errData = errorRes(error);
        logger.info(errData.resData);
    
        let { message, status, data, code, issue } =
          errData.resData;
    
        return res.status(errData.statusCode).send({
          message,
          status,
          data,
          code,
          issue,
        });
      }
  }

  /**
   * GET /ReviewFeatures/:id
   * Get a single ReviewFeature by Mongo ID
   */
  async getById(req, res) {
    try {
      const ReviewFeature = await ReviewFeatureService.getReviewFeatureById(req.params.id);
      if (!ReviewFeature ) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
          message: "ReviewFeatures fetched successfully",
          status: true,
          ReviewFeature,
          code: "OK",
          issue: null,
        });
      } } catch (error) {
        console.log(error);
    
        let errData = errorRes(error);
        logger.info(errData.resData);
    
        let { message, status, data, code, issue } =
          errData.resData;
    
        return res.status(errData.statusCode).send({
          message,
          status,
          data,
          code,
          issue,
        });
      }
  }
 /**
   * POST /ReviewFeatures
   * Create a new ReviewFeature
   */
  async create(req, res) {
    try {
      const ReviewFeature = await ReviewFeatureService.createReviewFeature(req.body);
      if (!ReviewFeature ) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
    res.status(httpStatus.OK).send({ 
       message: `ReviewFeature added successfully.`,
        data: ReviewFeature,
        status: true,
        code: "OK",
        issue: null,
     });
  } 
} catch (error) {
     console.log(error);
    let errData = errorRes(error);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
}
  /**
   * PUT /ReviewFeatures/:id
   * Update a ReviewFeature
   */
  async update(req, res) {
    try {

      const ReviewFeature = await ReviewFeatureService.updateReviewFeature(req.params.id, req.body);
      if (!ReviewFeature) {
      throw new ApiError(httpStatus.OK, "Category not found.");
    }

    return res.status(httpStatus.OK).send({
      message: "ReviewFeature updated successfully.",
      status: true,
      ReviewFeature,
      code: "OK",
      issue: null,
    });
  } catch (error) {
    console.log(error);

    let errData = errorRes(error);
    logger.info(errData.resData);

    let { message, status, data, code, issue } =
      errData.resData;

    return res.status(errData.statusCode).send({
      message,
      status,
      data,
      code,
      issue,
    });
  } 
    
  }

  /**
   * DELETE /ReviewFeatures/:id
   * Delete a ReviewFeature
   */
  async delete(req, res) {
    try {
      const deletedReviewFeature = await ReviewFeatureService.deleteReviewFeature(req.params.id);


       if (!deletedReviewFeature) {
      throw new ApiError(httpStatus.OK, "ReviewFeature not found.");
    }
     return res.status(httpStatus.OK).send({
      message: "ReviewFeature deleted successfully.",
      status: true,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (error) {
    console.log(error);

    let errData = errorRes(error);
    logger.info(errData.resData);

    let { message, status, data, code, issue } =
      errData.resData;

    return res.status(errData.statusCode).send({
      message,
      status,
      data,
      code,
      issue,
    });
  }
  }
}


module.exports = new ReviewFeatureController();
