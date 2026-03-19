const getOrderByAndItsValue = (orderBy, orderByValue) => {
  // default sorting
  const defaultOrderBy = "createdAt";
  const defaultOrderValue = -1;

  return {
    orderBy: orderBy ? orderBy : defaultOrderBy,
    orderByValue:
      orderByValue && [1, -1, "1", "-1"].includes(orderByValue)
        ? orderByValue
        : defaultOrderValue,
  };
};

module.exports = {
  getOrderByAndItsValue,
};