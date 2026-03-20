const transaction = require("./schema.transaction");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One transaction by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<transaction>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return transaction.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};

//-------------------------------------------

/**
 * Get One transaction by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<transaction>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return transaction.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------

/**
 * Create transaction
 * @param {object} bodyData
 * @returns {Promise<transaction>}
 */
const createNewData = async (bodyData) => {
  return transaction.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id transaction
 * @param {ObjectId} id
 * @returns {Promise<transaction>}
 */
const getById = async (id) => {
  return transaction.findById(id);
};
//-------------------------------------------

/**
 * Update transaction by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<transaction>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return transaction.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<transaction>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return transaction.findOneAndUpdate(
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
 * @returns {Promise<transaction>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return transaction.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<transaction>}
 */
const getByIdAndDelete = async (id) => {
  return transaction.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<transaction>}
 */
const getOneAndDelete = async (matchObj) => {
  return transaction.findOneAndUpdate(
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
 * @returns {Promise<transaction>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return transaction.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<transaction>}
 */
const findAll = async () => {
  return transaction.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<transaction>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return transaction.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<transaction>}
 */
const createMany = async (insertDataArray) => {
  return transaction.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<transaction>}
 */
const findCount = async (matchObj) => {
  return transaction.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<transaction>}
 */
const updateMany = async (matchObj, updateObject) => {
  return transaction.updateMany(
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
 * @returns {Promise<transaction>}
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
