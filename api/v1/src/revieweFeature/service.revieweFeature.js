const ReviewFeature = require("./schema.revieweFeature");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One ReviewFeature by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ReviewFeature>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ReviewFeature.findOne({ [fieldName]: fieldValue, isDeleted: false });
};

//-------------------------------------------

/**
 * Get One ReviewFeature by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ReviewFeature>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ReviewFeature.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create ReviewFeature
 * @param {object} bodyData
 * @returns {Promise<ReviewFeature>}
 */
const createNewData = async (bodyData) => {
  return ReviewFeature.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id ReviewFeature
 * @param {ObjectId} id
 * @returns {Promise<ReviewFeature>}
 */
const getById = async (id) => {
  return ReviewFeature.findById(id);
};
//-------------------------------------------

/**
 * Update ReviewFeature by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ReviewFeature>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ReviewFeature.findByIdAndUpdate(
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
 * @returns {Promise<ReviewFeature>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ReviewFeature.findOneAndUpdate(
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
 * @returns {Promise<ReviewFeature>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ReviewFeature.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ReviewFeature>}
 */
const getByIdAndDelete = async (id) => {
  return ReviewFeature.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ReviewFeature>}
 */
const getOneAndDelete = async (matchObj) => {
  return ReviewFeature.findOneAndUpdate(
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
 * @returns {Promise<ReviewFeature>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ReviewFeature.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<ReviewFeature>}
 */
const findAll = async () => {
  return ReviewFeature.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ReviewFeature>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return ReviewFeature.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ReviewFeature>}
 */
const createMany = async (insertDataArray) => {
  return ReviewFeature.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<ReviewFeature>}
 */
const findCount = async (matchObj) => {
  return ReviewFeature.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<ReviewFeature>}
 */
const updateMany = async (matchObj, updateObject) => {
  return ReviewFeature.updateMany(
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
 * @returns {Promise<ReviewFeature>}
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
