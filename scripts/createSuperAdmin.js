require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("../api/v1/src/admins/schema.admin");
const { userEnum } = require("../api/utils/enumUtils");

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connected");

    const exist = await Admin.findOne({
      userType: userEnum.superAdmin,
    });

    if (exist) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    await Admin.create({
      name: "Super Admin",
      mobile: "9999999999",
      email: "codiotictest@gmail.com",
      password: hashedPassword,
      userType: userEnum.superAdmin,
    });

    console.log("Super Admin Created Successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();