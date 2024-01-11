const { verify } = require("jsonwebtoken");

const validateShopkeeperToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken && !req.user)
    return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "importantsecret");
    req.user = validToken;
    if (validToken && validToken.role === "shopkeeper") {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateShopkeeperToken };
