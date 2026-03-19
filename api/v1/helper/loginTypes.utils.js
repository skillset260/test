const { OAuth2Client } = require("google-auth-library");
const { loginTypeEnum } = require("../../utils/enumUtils");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Detects loginType dynamically from the request body.
 *
 * Rules:
 *  - has googleToken  → "google"
 *  - has facebookToken → "facebook"
 *  - has appleToken   → "apple"
 *  - has email + password → "email"
 */
const detectLoginType = (body) => {
  if (body.googleToken)   return loginTypeEnum.GOOGLE;
  if (body.facebookToken) return loginTypeEnum.FACEBOOK;
  if (body.appleToken)    return loginTypeEnum.APPLE;
  if (body.email && body.password) return loginTypeEnum.EMAIL;
  return null;
};

/**
 * Verifies SSO token and returns { email, name, ssoId }
 * based on detected loginType.
 */

const verifySSOToken = async (loginType, body) => {
  switch (loginType) {

    case loginTypeEnum.GOOGLE: {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: body.googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

   console.log("GOOGLE VERIFY SUCCESS:", ticket.getPayload());

    const payload = ticket.getPayload();

    return {
      email: payload.email,
      name: payload.name,
      ssoId: payload.sub,
    };

  } catch (err) {
    console.error("GOOGLE VERIFY ERROR:", err);
    throw new ApiError(200, "Invalid google token.");
  }
}

    case loginTypeEnum.FACEBOOK: {
      // Verify Facebook token via Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${body.facebookToken}`
      );
      const payload = await response.json();
      if (payload.error) throw { status: 401, message: "Invalid Facebook token." };
      return {
        email: payload.email,
        name:  payload.name,
        ssoId: payload.id,           // Facebook unique user ID
      };
    }

    case loginTypeEnum.APPLE: {
      // Apple token verification (using apple-signin-auth package)
      const appleSignin = require("apple-signin-auth");
      const payload = await appleSignin.verifyIdToken(body.appleToken, {
        audience:          process.env.APPLE_CLIENT_ID,
        ignoreExpiration:  false,
      });
      return {
        email: payload.email,
        name:  body.name || "Apple User",  // Apple only sends name on first login
        ssoId: payload.sub,                // Apple unique user ID
      };
    }

    default:
      return null;
  }
};

module.exports = { detectLoginType, verifySSOToken };