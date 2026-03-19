const admin = require("../src/admins/schema.admin");

const collectionArrToMatch = [
  admin,
];

const checkIdInCollectionsThenDelete = async (
  collectionArrToMatch,
  IdToMatch,
  IdToDelete
) => {
  // Check for references in each collection
  let hasReferences = false;

  for (const collectionSchema of collectionArrToMatch) {
    const reference = await collectionSchema.findOne({
      [IdToMatch]: IdToDelete,
      isDeleted: false,
    });
    if (reference) {
      hasReferences = true;
      return {
        message: `This item cannot be deleted right now, because it is currently used in ${collectionSchema.modelName} collection`,
        status: false,
      };
    }
  }
  if (!hasReferences) {
    return {
      message: "Successfull.",
      status: true,
    };
  }
  return {
    message: "All OK",
    status: false,
  };
};

const checkIdExistOrNot = async (moduleName, IdsToCheck) => {
  const promises = await Promise.all(
    IdsToCheck.map(async (id) => {
      const isExists =
        IdsToCheck !== null || !IdsToCheck
          ? await moduleName.findCount({ _id: id, isDeleted: false })
          : null;
      if (isExists === 0 || isExists === null || !isExists) {
        throw new Error(`Invalid ${id}`);
      }
    })
  );
  return {
    message: "All ok",
    status: true,
  };
};

module.exports = {
  checkIdInCollectionsThenDelete,
  checkIdExistOrNot,
  collectionArrToMatch,
};
