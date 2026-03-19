const ReviewFeatureOption = require("./schema.reviewFeatureOption");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One ReviewFeatureOption by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ReviewFeatureOption>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ReviewFeatureOption.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};

//-------------------------------------------

/**
 * Get One ReviewFeatureOption by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ReviewFeatureOption>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ReviewFeatureOption.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * Create ReviewFeatureOption
 * @param {object} bodyData
 * @returns {Promise<ReviewFeatureOption>}
 */
const createNewData = async (bodyData) => {
  return ReviewFeatureOption.create({ ...bodyData });
};
//-------------------------------------------

/**
 * get by id ReviewFeatureOption
 * @param {ObjectId} id
 * @returns {Promise<ReviewFeatureOption>}
 */
const getById = async (id) => {
  return ReviewFeatureOption.findById(id);
};
//-------------------------------------------

/**
 * Update ReviewFeatureOption by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ReviewFeatureOption>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ReviewFeatureOption.findByIdAndUpdate(
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
 * @returns {Promise<ReviewFeatureOption>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ReviewFeatureOption.findOneAndUpdate(
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
 * @returns {Promise<ReviewFeatureOption>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ReviewFeatureOption.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true },
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ReviewFeatureOption>}
 */
const getByIdAndDelete = async (id) => {
  return ReviewFeatureOption.findByIdAndDelete(id);
};

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ReviewFeatureOption>}
 */
const getOneAndDelete = async (matchObj) => {
  return ReviewFeatureOption.findOneAndUpdate(
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
 * @returns {Promise<ReviewFeatureOption>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ReviewFeatureOption.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj },
  );
};

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<ReviewFeatureOption>}
 */
const findAll = async () => {
  return ReviewFeatureOption.find();
};

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ReviewFeatureOption>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return ReviewFeatureOption.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ReviewFeatureOption>}
 */
const createMany = async (insertDataArray) => {
  return ReviewFeatureOption.insertMany(insertDataArray);
};
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<ReviewFeatureOption>}
 */
const findCount = async (matchObj) => {
  return ReviewFeatureOption.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @param {object} updateObject
 * @returns {Promise<ReviewFeatureOption>}
 */
const updateMany = async (matchObj, updateObject) => {
  return ReviewFeatureOption.updateMany(
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
 * @returns {Promise<ReviewFeatureOption>}
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
