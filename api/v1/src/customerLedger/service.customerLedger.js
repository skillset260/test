const CustomerLedger = require("./schema.customerLedger");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One CustomerLedger by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<CustomerLedger>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return CustomerLedger.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One CustomerLedger by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<CustomerLedger>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return CustomerLedger.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create CustomerLedger
 * @param {object} bodyData
 * @returns {Promise<CustomerLedger>}
 */
const createNewData = async (bodyData) => {
  return CustomerLedger.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id CustomerLedger
 * @param {ObjectId} id
 * @returns {Promise<CustomerLedger>}
 */
const getById = async (id) => {
  return CustomerLedger.findById(id);
};
//-------------------------------------------

/**
 * Update CustomerLedger by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<CustomerLedger>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return CustomerLedger.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<CustomerLedger>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return CustomerLedger.findOneAndUpdate(
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
 * @returns {Promise<CustomerLedger>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return CustomerLedger.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<CustomerLedger>}
 */
const getByIdAndDelete = async (id) => {
  return CustomerLedger.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<CustomerLedger>}
 */
const getOneAndDelete = async (matchObj) => {
  return CustomerLedger.findOneAndUpdate(
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
 * @returns {Promise<CustomerLedger>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return CustomerLedger.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<CustomerLedger>}
 */
const findAll = async () => {
  return CustomerLedger.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<CustomerLedger>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return CustomerLedger.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<CustomerLedger>}
 */
const createMany = async (insertDataArray) => {
  return CustomerLedger.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<CustomerLedger>}
 */
const findCount = async (matchObj) => {
  return CustomerLedger.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<CustomerLedger>}
 */
const updateMany = async (matchObj, updateObject) => {
  return CustomerLedger.updateMany(
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
 * @returns {Promise<CustomerLedger>}
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

const findByHash = async (hash) => {
  return CustomerLedger.findOne({ latLngHash: hash });
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
  findByHash
};
