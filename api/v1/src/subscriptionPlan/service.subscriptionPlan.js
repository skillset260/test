const SubscriptionPlan = require("./schema.subscriptionPlan");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One SubscriptionPlan by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<SubscriptionPlan>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return SubscriptionPlan.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One SubscriptionPlan by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SubscriptionPlan>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return SubscriptionPlan.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create SubscriptionPlan
 * @param {object} bodyData
 * @returns {Promise<SubscriptionPlan>}
 */
const createNewData = async (bodyData) => {
  return SubscriptionPlan.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id SubscriptionPlan
 * @param {ObjectId} id
 * @returns {Promise<SubscriptionPlan>}
 */
const getById = async (id) => {
  return SubscriptionPlan.findById(id);
};
//-------------------------------------------

/**
 * Update SubscriptionPlan by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<SubscriptionPlan>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return SubscriptionPlan.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<SubscriptionPlan>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return SubscriptionPlan.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<SubscriptionPlan>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return SubscriptionPlan.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<SubscriptionPlan>}
 */
const getByIdAndDelete = async (id) => {
  return SubscriptionPlan.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<SubscriptionPlan>}
 */
const getOneAndDelete = async (matchObj) => {
  return SubscriptionPlan.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SubscriptionPlan>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return SubscriptionPlan.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<SubscriptionPlan>}
 */
const findAll = async () => {
  return SubscriptionPlan.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<SubscriptionPlan>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return SubscriptionPlan.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<SubscriptionPlan>}
 */
const createMany = async (insertDataArray) => {
  return SubscriptionPlan.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<SubscriptionPlan>}
 */
const findCount = async (matchObj) => {
  return SubscriptionPlan.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<SubscriptionPlan>}
 */
const updateMany = async (matchObj, updateObject) => {
  return SubscriptionPlan.updateMany(
    { ...matchObj, isDeleted: false },
    { ...updateObject },
    { multi: true, upsert: false }
  );
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<SubscriptionPlan>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds };
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    })
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" }
  );
};

//-------------------------------------------
module.exports = {
  getOneBySingleField,
  getOneByMultiField,
  createNewData,
  getById,
  getByIdAndUpdate,
  getOneAndUpdate,
  getByIdAndDelete,
  getOneAndDelete,
  aggregateQuery,
  findAllWithQuery,
  findAll,
  onlyUpdateOne,
  createMany,
  findCount,
  isExists,
  updateMany,
};
