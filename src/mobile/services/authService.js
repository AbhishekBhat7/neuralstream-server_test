// const argon2 = require("argon2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const pool = require("../../config/db");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/authJwt");

/**
 * SIGNUP
 */
const signup = async ({ email, password }) => {

  const existingUser = await pool.query(
    `
    SELECT user_id
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  // const passwordHash = await argon2.hash(password);
  const SALT_ROUNDS = 12;

const passwordHash = await bcrypt.hash(
  password,
  SALT_ROUNDS
);

  const result = await pool.query(
    `
    INSERT INTO users
    (
      email,
      password_hash
    )
    VALUES
    (
      $1,
      $2
    )
    RETURNING
      user_id,
      email,
      created_at
    `,
    [
      email,
      passwordHash,
    ]
  );

  return result.rows[0];
};

/**
 * LOGIN
 */
const login = async (
  email,
  password,
  fingerprint,
  deviceInfo
) => {

  // Find user
  const userResult = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = userResult.rows[0];

  // Verify password
  // const validPassword =
  //   await argon2.verify(
  //     user.password_hash,
  //     password
  //   );

  const validPassword =
  await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  // Find existing device
  let deviceResult = await pool.query(
    `
    SELECT *
    FROM user_devices
    WHERE user_id = $1
    AND device_fingerprint = $2
    `,
    [
      user.user_id,
      fingerprint,
    ]
  );

  let device = deviceResult.rows[0];

  /**
   * New Device
   * Enforce max 3 ACTIVE devices
   */
  if (!device) {

    const activeDevices =
      await pool.query(
        `
        SELECT COUNT(DISTINCT device_id)::INT AS count
        FROM refresh_tokens
        WHERE user_id = $1
        AND revoked = FALSE
        AND expires_at > NOW()
        `,
        [user.user_id]
      );

    if (
      activeDevices.rows[0].count >= 3
    ) {
      throw new Error(
        "Maximum 3 devices allowed"
      );
    }

    const newDevice =
      await pool.query(
        `
        INSERT INTO user_devices
        (
          user_id,
          device_fingerprint,
          device_name,
          platform,
          browser,
          ip_address
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
        [
          user.user_id,
          fingerprint,
          deviceInfo.device_name,
          deviceInfo.platform,
          deviceInfo.browser,
          deviceInfo.ip_address,
        ]
      );

    device = newDevice.rows[0];
  }

  /**
   * Existing Device
   * Update last activity
   */
  await pool.query(
    `
    UPDATE user_devices
    SET
      last_active_at = NOW(),
      ip_address = $1
    WHERE device_id = $2
    `,
    [
      deviceInfo.ip_address,
      device.device_id,
    ]
  );

  /**
   * Revoke any existing active token
   * for this device
   */
  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked = TRUE
    WHERE user_id = $1
    AND device_id = $2
    AND revoked = FALSE
    `,
    [
      user.user_id,
      device.device_id,
    ]
  );

  /**
   * Create new refresh token
   */
  const refreshToken =
    generateRefreshToken();

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt =
    new Date(
      Date.now() +
      30 * 24 * 60 * 60 * 1000
    );

  await pool.query(
    `
    INSERT INTO refresh_tokens
    (
      user_id,
      device_id,
      token_hash,
      expires_at
    )
    VALUES
    (
      $1,$2,$3,$4
    )
    `,
    [
      user.user_id,
      device.device_id,
      tokenHash,
      expiresAt,
    ]
  );

  /**
   * Update login timestamp
   */
  await pool.query(
    `
    UPDATE users
    SET last_login_at = NOW()
    WHERE user_id = $1
    `,
    [user.user_id]
  );

  return {
    accessToken:
      generateAccessToken(user),
    refreshToken,
    deviceId:
      device.device_id,
  };
};

/**
 * LOGOUT SINGLE DEVICE
 */
// const logout = async (
//   userId,
//   deviceId
// ) => {

//   await pool.query(
//     `
//     UPDATE refresh_tokens
//     SET revoked = TRUE
//     WHERE user_id = $1
//     AND device_id = $2
//     AND revoked = FALSE
//     `,
//     [
//       userId,
//       deviceId,
//     ]
//   );

//   return true;
// };


const logout = async (
  userId,
  deviceFingerprint
) => {

  const deviceResult =
    await pool.query(
      `
      SELECT device_id
      FROM user_devices
      WHERE user_id = $1
      AND device_fingerprint = $2
      `,
      [
        userId,
        deviceFingerprint
      ]
    );

  if (
    deviceResult.rows.length === 0
  ) {
    throw new Error(
      "Device not found"
    );
  }

  const deviceId =
    deviceResult.rows[0].device_id;

  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked = TRUE
    WHERE user_id = $1
    AND device_id = $2
    AND revoked = FALSE
    `,
    [
      userId,
      deviceId
    ]
  );

  return true;
};

/**
 * LOGOUT ALL DEVICES
 */
const logoutAllDevices =
  async (userId) => {

    await pool.query(
      `
      UPDATE refresh_tokens
      SET revoked = TRUE
      WHERE user_id = $1
      AND revoked = FALSE
      `,
      [userId]
    );

    return true;
};

/**
 * CLEANUP EXPIRED TOKENS
 */
const cleanupExpiredTokens =
  async () => {

    await pool.query(
      `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
      `
    );

    return true;
};

module.exports = {
  signup,
  login,
  logout,
  logoutAllDevices,
  cleanupExpiredTokens,
};