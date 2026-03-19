const SubCategory = require("./schema.subcategory");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One SubCategory by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<SubCategory>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return SubCategory.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One SubCategory by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SubCategory>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return SubCategory.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create SubCategory
 * @param {object} bodyData
 * @returns {Promise<SubCategory>}
 */
const createNewData = async (bodyData) => {
  return SubCategory.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id SubCategory
 * @param {ObjectId} id
 * @returns {Promise<SubCategory>}
 */
const getById = async (id) => {
  return SubCategory.findById(id);
};
//-------------------------------------------

/**
 * Update SubCategory by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<SubCategory>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return SubCategory.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<SubCategory>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return SubCategory.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<SubCategory>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return SubCategory.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<SubCategory>}
 */
const getByIdAndDelete = async (id) => {
  return SubCategory.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<SubCategory>}
 */
const getOneAndDelete = async (matchObj) => {
  return SubCategory.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SubCategory>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return SubCategory.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<SubCategory>}
 */
const findAll = async () => {
  return SubCategory.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<SubCategory>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return SubCategory.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<SubCategory>}
 */
const createMany = async (insertDataArray) => {
  return SubCategory.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<SubCategory>}
 */
const findCount = async (matchObj) => {
  return SubCategory.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<SubCategory>}
 */
const updateMany = async (matchObj, updateObject) => {
  return SubCategory.updateMany(
    { ...matchObj, isDeleted: false },
    { ...updateObject },
    { multi: true, upsert: false },
  );
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<SubCategory>}
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
    }),
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" },
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
