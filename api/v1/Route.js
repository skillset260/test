const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const config = require("../../config/config");

/* define all routes */
const adminRoute = require("../v1/src/admins/route.admin");
const categoryRoute = require("../v1/src/category/route.category");
const subCategoryRoute = require("./src/subcategory/route.subcategory");
const revieweFeatureRoute = require("./src/revieweFeature/route.revieweFeature");
const reviewFeatureOptionRoute = require("./src/reviewFeatureOption/route.reviewFeatureOption");
const seoKeywordRoute = require("./src/seoKeyword/route.seoKeyword");
const profileRoute = require("./src/profile/route.profile");
const reviewTemplateRoute = require("./src/reviewTemplate/route.reviewTemplate");

const devRoutes = [
  // routes available only in development mode
  {
    path: "/api-docs",
    route: docsRoute,
  },
];
const defaultRoutes = [
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  {
    path: "/sub-category",
    route: subCategoryRoute,
  },
  {
    path: "/review-feature",
    route: revieweFeatureRoute,
  },
  {
    path: "/review-feature-option",
    route: reviewFeatureOptionRoute,
  },
  {
    path: "/seo-keyword",
    route: seoKeywordRoute,
  },
  {
    path: "/profile",
    route: profileRoute,
  },
  {
    path: "/review-template",
    route: reviewTemplateRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
