const CustomerSubcription = require("./schema.customerSubcription");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One CustomerSubcription by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<CustomerSubcription>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return CustomerSubcription.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One CustomerSubcription by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<CustomerSubcription>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return CustomerSubcription.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * Create CustomerSubcription
 * @param {object} bodyData
 * @returns {Promise<CustomerSubcription>}
 */
const createNewData = async (bodyData) => {
  return CustomerSubcription.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id CustomerSubcription
 * @param {ObjectId} id
 * @returns {Promise<CustomerSubcription>}
 */
const getById = async (id) => {
  return CustomerSubcription.findById(id);
};
//-------------------------------------------

/**
 * Update CustomerSubcription by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<CustomerSubcription>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return CustomerSubcription.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<CustomerSubcription>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return CustomerSubcription.findOneAndUpdate(
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
 * @returns {Promise<CustomerSubcription>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return CustomerSubcription.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<CustomerSubcription>}
 */
const getByIdAndDelete = async (id) => {
  return CustomerSubcription.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<CustomerSubcription>}
 */
const getOneAndDelete = async (matchObj) => {
  return CustomerSubcription.findOneAndUpdate(
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
 * @returns {Promise<CustomerSubcription>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return CustomerSubcription.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<CustomerSubcription>}
 */
const findAll = async () => {
  return CustomerSubcription.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<CustomerSubcription>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return CustomerSubcription.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<CustomerSubcription>}
 */
const createMany = async (insertDataArray) => {
  return CustomerSubcription.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<CustomerSubcription>}
 */
const findCount = async (matchObj) => {
  return CustomerSubcription.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<CustomerSubcription>}
 */
const updateMany = async (matchObj, updateObject) => {
  return CustomerSubcription.updateMany(
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
 * @returns {Promise<CustomerSubcription>}
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
