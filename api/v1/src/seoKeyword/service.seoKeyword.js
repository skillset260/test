const SeoKeyword = require("./schema.seoKeyword");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One SeoKeyword by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<SeoKeyword>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return SeoKeyword.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One SeoKeyword by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SeoKeyword>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return SeoKeyword.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create SeoKeyword
 * @param {object} bodyData
 * @returns {Promise<SeoKeyword>}
 */
const createNewData = async (bodyData) => {
  return SeoKeyword.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id SeoKeyword
 * @param {ObjectId} id
 * @returns {Promise<SeoKeyword>}
 */
const getById = async (id) => {
  return SeoKeyword.findById(id);
};
//-------------------------------------------

/**
 * Update SeoKeyword by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<SeoKeyword>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return SeoKeyword.findByIdAndUpdate(
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
 * @returns {Promise<SeoKeyword>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return SeoKeyword.findOneAndUpdate(
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
 * @returns {Promise<SeoKeyword>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return SeoKeyword.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<SeoKeyword>}
 */
const getByIdAndDelete = async (id) => {
  return SeoKeyword.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<SeoKeyword>}
 */
const getOneAndDelete = async (matchObj) => {
  return SeoKeyword.findOneAndUpdate(
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
 * @returns {Promise<SeoKeyword>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return SeoKeyword.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<SeoKeyword>}
 */
const findAll = async () => {
  return SeoKeyword.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<SeoKeyword>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return SeoKeyword.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<SeoKeyword>}
 */
const createMany = async (insertDataArray) => {
  return SeoKeyword.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<SeoKeyword>}
 */
const findCount = async (matchObj) => {
  return SeoKeyword.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<SeoKeyword>}
 */
const updateMany = async (matchObj, updateObject) => {
  return SeoKeyword.updateMany(
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
 * @returns {Promise<SeoKeyword>}
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
