const SubsRenewalHistory = require("./schema.subsRenewalHistory");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One SubsRenewalHistory by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<SubsRenewalHistory>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return SubsRenewalHistory.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One SubsRenewalHistory by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SubsRenewalHistory>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return SubsRenewalHistory.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create SubsRenewalHistory
 * @param {object} bodyData
 * @returns {Promise<SubsRenewalHistory>}
 */
const createNewData = async (bodyData) => {
  return SubsRenewalHistory.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id SubsRenewalHistory
 * @param {ObjectId} id
 * @returns {Promise<SubsRenewalHistory>}
 */
const getById = async (id) => {
  return SubsRenewalHistory.findById(id);
};
//-------------------------------------------

/**
 * Update SubsRenewalHistory by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<SubsRenewalHistory>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return SubsRenewalHistory.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<SubsRenewalHistory>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return SubsRenewalHistory.findOneAndUpdate(
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
 * @returns {Promise<SubsRenewalHistory>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return SubsRenewalHistory.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<SubsRenewalHistory>}
 */
const getByIdAndDelete = async (id) => {
  return SubsRenewalHistory.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<SubsRenewalHistory>}
 */
const getOneAndDelete = async (matchObj) => {
  return SubsRenewalHistory.findOneAndUpdate(
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
 * @returns {Promise<SubsRenewalHistory>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return SubsRenewalHistory.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<SubsRenewalHistory>}
 */
const findAll = async () => {
  return SubsRenewalHistory.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<SubsRenewalHistory>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return SubsRenewalHistory.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<SubsRenewalHistory>}
 */
const createMany = async (insertDataArray) => {
  return SubsRenewalHistory.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<SubsRenewalHistory>}
 */
const findCount = async (matchObj) => {
  return SubsRenewalHistory.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<SubsRenewalHistory>}
 */
const updateMany = async (matchObj, updateObject) => {
  return SubsRenewalHistory.updateMany(
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
 * @returns {Promise<SubsRenewalHistory>}
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
