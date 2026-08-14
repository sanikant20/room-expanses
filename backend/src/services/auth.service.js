export const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "Strict" : "Lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "Strict" : "Lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
