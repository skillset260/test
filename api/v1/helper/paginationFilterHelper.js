const httpStatus = require("http-status");
const moment = require("moment");
const { ObjectId } = require("mongodb");
const ApiError = require("../../../utilities/apiErrorUtils");
const mongoose = require("mongoose");

const checkInvalidParams = (searchIn, searchKeys) => {
  if (!searchIn) {
    searchIn = [];
  } else if (!Array.isArray(searchIn)) {
    return {
      message: `Search in params must be an array.`,
      status: false,
      data: null,
      code: httpStatus.OK,
      issue: "INVALID_REQUEST",
    };
  }

  if (searchIn.length) {
    for (let key in searchIn) {
      if (!searchIn[key] || searchIn[key] === "") {
        return {
          message: `Search in params key should not be blank`,
          status: false,
          data: null,
          code: httpStatus.OK,
          issue: "INVALID_REQUEST",
        };
      } else if (!searchKeys.includes(searchIn[key])) {
        return {
          message: `Invalid field ${searchIn[key]} in params to be search.`,
          status: false,
          data: null,
          code: httpStatus.OK,
          issue: "INVALID_REQUEST",
        };
      }
    }
  }
  return {
    message: `All OK`,
    status: true,
    data: null,
    code: "OK",
    issue: null,
  };
};

const getSearchQuery = (searchIn, searchKeys, searchValue) => {
  let queryArray = [];
  if (searchValue !== undefined && searchValue !== "" && searchValue !== null) {
    let value = { $regex: `.*${searchValue}.*`, $options: "i" };
    // let searchFields = searchIn && searchIn.length ? searchIn : searchKeys;
    let searchFields = searchKeys;
    for (let each in searchFields) {
      let key = searchFields[each];
      let val = value;
      queryArray.push({ [key]: val });
    }
  }

  return queryArray.length ? queryArray : null;
};

const getRangeQuery = (rangeFilterBy) => {
  let queryArray = [];
  if (
    rangeFilterBy !== undefined &&
    rangeFilterBy !== null &&
    !Object.keys(rangeFilterBy).length &&
    typeof rangeFilterBy === "object"
  ) {
    if (
      rangeFilterBy.rangeFilterKey !== undefined &&
      rangeFilterBy.rangeFilterKey !== "" &&
      rangeFilterBy.rangeFilterKey !== null &&
      typeof rangeFilterBy.rangeFilterKey === "string"
    ) {
      if (
        rangeFilterBy.rangeInitial !== undefined &&
        rangeFilterBy.rangeInitial !== "" &&
        rangeFilterBy.rangeInitial !== null &&
        !isNaN(parseFloat(rangeFilterBy.rangeInitial))
      ) {
        if (
          rangeFilterBy.rangeEnd !== undefined &&
          rangeFilterBy.rangeEnd !== "" &&
          rangeFilterBy.rangeEnd !== null &&
          !isNaN(parseFloat(rangeFilterBy.rangeEnd))
        ) {
          queryArray.push({
            [`${rangeFilterBy.rangeFilterKey}`]: {
              $gte: rangeFilterBy.rangeInitial,
            },
          });
          queryArray.push({
            [`${rangeFilterBy.rangeFilterKey}`]: {
              $lte: rangeFilterBy.rangeEnd,
            },
          });
        }
      }
    }
  }
  return queryArray.length ? queryArray : null;
};

const getFilterQuery = (
  filterBy,
  booleanFields,
  numberFileds,
  objectIdFields,
  withoutRegexFields
) => {
  let queryArray = [];
  objectIdFields =
    objectIdFields && Array.isArray(objectIdFields) ? objectIdFields : [];
  withoutRegexFields =
    withoutRegexFields && Array.isArray(withoutRegexFields)
      ? withoutRegexFields
      : [];

  let invalidData = ["null", null, undefined, "undefined", ""];

  if (filterBy !== undefined) {
    if (!Array.isArray(filterBy)) {
      return {
        message: `filterBy must be an array.`,
        status: true,
        data: null,
      };
    }

    if (filterBy.length > 0) {
      for (let each in filterBy) {
        if (!invalidData.includes(filterBy[each].fieldName)) {
          let fieldName = filterBy[each].fieldName;
          let filterValue = filterBy[each].value;

          if (
            withoutRegexFields.includes(fieldName) &&
            filterValue !== "" &&
            filterValue !== null &&
            filterValue !== undefined
          ) {
            let orQuery = [];

            filterValue.forEach((val) => {
              orQuery.push({
                [fieldName]: val,
              });
            });
            queryArray.push(...orQuery);
          } else if (
            Array.isArray(filterValue) &&
            filterValue.length &&
            !booleanFields.includes(fieldName) &&
            !numberFileds.includes(fieldName) &&
            !objectIdFields.includes(fieldName)
          ) {
            let orQuery = [];
            filterValue.forEach((val) => {
              orQuery.push({
                [fieldName]: {
                  $regex: `.*${val}.*`,
                  $options: "i",
                },
              });
            });
            queryArray.push({ $or: orQuery });
          } else if (filterValue !== "") {
            if (
              typeof filterValue === "string" &&
              !booleanFields.includes(fieldName) &&
              !numberFileds.includes(fieldName) &&
              !objectIdFields.includes(fieldName)
            ) {
              queryArray.push({
                [fieldName]: {
                  $regex: `.*${filterValue}.*`,
                  $options: "i",
                },
              });
            } else if (
              numberFileds.includes(fieldName) &&
              !isNaN(parseInt(filterValue))
            ) {
              let filterValue = filterBy[each].value;
              if (Array.isArray(filterValue) && filterValue.length) {
                let orQuery = [];
                filterValue.forEach((val) => {
                  orQuery.push({
                    [fieldName]: parseInt(val),
                  });
                });
                queryArray.push({ $or: orQuery });
              } else {
                queryArray.push({
                  [fieldName]: parseInt(filterValue),
                });
              }
            } else if (objectIdFields.includes(fieldName)) {
              let filterValue = filterBy[each].value;
              if (filterValue) {
                filterValue = JSON.parse(JSON.stringify(filterValue));

                if (Array.isArray(filterValue)) {
                  if (filterValue.length) {
                    let orQuery = [];
                    filterValue.forEach((val) => {
                      orQuery.push({
                        [fieldName]: new mongoose.Types.ObjectId(val),
                      });
                    });
                    queryArray.push({ $or: orQuery });
                  }
                } else if (typeof filterValue === "string") {
                  queryArray.push({
                    [fieldName]: new mongoose.Types.ObjectId(filterValue),
                  });
                }
              }
            } else if (
              typeof filterValue === "boolean" ||
              booleanFields.includes(fieldName)
            ) {
              queryArray.push({
                [fieldName]:
                  filterValue === true || filterValue === "true" ? true : false,
              });
            }
          }
        }
      }
    }
  }
  return queryArray.length ? queryArray : null;
  //----------------------------
};

const getDateFilterQuery = (dateFilter, allowedDateFiletrKeys) => {
  let queryArray = [];

  if (
    dateFilter !== undefined &&
    dateFilter !== null &&
    Object.keys(dateFilter).length
  ) {
    if (dateFilter.dateFilterKey && dateFilter.dateFilterKey !== "") {
      if (!allowedDateFiletrKeys.includes(dateFilter.dateFilterKey)) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Date filter key is invalid.`
        );
      }
    } else {
      dateFilter["dateFilterKey"] = "createdAt";
    }

    if (
      dateFilter.startDate !== undefined &&
      dateFilter.startDate !== "" &&
      (dateFilter.endDate === undefined || dateFilter.endDate === "")
    ) {
      dateFilter.endDate = dateFilter.startDate;
    } else if (
      dateFilter.endDate !== undefined &&
      dateFilter.endDate !== "" &&
      (dateFilter.startDate === undefined || dateFilter.startDate === "")
    ) {
      dateFilter.startDate = dateFilter.endDate;
    }
    if (dateFilter.startDate !== "" && dateFilter.endDate !== "") {
      if (dateFilter.dateFilterKey === "createdAt") {
        queryArray.push({
          [dateFilter.dateFilterKey]: {
            $gte: new Date(`${moment(dateFilter.startDate).startOf("day")}`),
            $lte: new Date(`${moment(dateFilter.endDate).endOf("day")}`),
          },
        });
      } else {
        queryArray.push({
          [dateFilter.dateFilterKey]: {
            $gte: moment(dateFilter.startDate).format("YYYY-MM-DD"),
            $lte: moment(dateFilter.endDate).format("YYYY-MM-DD"),
          },
        });
      }
    }
  }

  return queryArray.length ? queryArray : null;
};

const getLimitAndTotalCount = (
  limit,
  page,
  totalData,
  isPaginationRequired
) => {
  limit = parseInt(limit);
  page = parseInt(page);

  if (
    limit === undefined ||
    !limit ||
    limit < 1 ||
    isNaN(limit) ||
    Math.sign(limit) === -1
  ) {
    limit = 10;
  }

  if (
    page === undefined ||
    !page ||
    isNaN(page) ||
    page < 1 ||
    Math.sign(page) === -1
  ) {
    page = 1;
  }
  let skip = page * limit - limit;

  let totalpages = 1;
  if (isPaginationRequired) {
    totalpages = Math.ceil(totalData / (limit === "" ? totalData : limit));
  } else {
    limit = totalData;
  }
  return {
    limit,
    page,
    totalData,
    skip,
    totalpages,
  };
};

const getOrderByAndItsValue = (orderBy, orderByValue) => {
  if (orderBy === undefined || orderBy === "" || typeof orderBy !== "string") {
    orderBy = "createdAt";
  }

  if (
    orderByValue === undefined ||
    orderByValue === "" ||
    isNaN(parseInt(orderByValue))
  ) {
    orderByValue = -1;
  }
  return {
    orderBy,
    orderByValue,
  };
};

module.exports = {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
};
