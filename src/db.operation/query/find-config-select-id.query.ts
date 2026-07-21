export const SHOPEE_PROJECT_ID = 1;

export const FIND_CONFIG_SELECT_ID_QUERY = `
  SELECT
    configId,
    projectId,
    clientId,
    accountName,
    shopeeCredential,
    shopeeSecretKey,
    shopeeAffiliateEndpoint,
    shopeeAffiliateTimeout,
    shopeeAffiliateSubids,
    shopeePage,
    shopeeSorttype,
    shopeeLimit,
    shopeeAppId,
    shopeeFlagClick,
    shopeeCurrency,
    shopeeLocation,
    activeFlag
  FROM tbl_config_shopee
  WHERE projectId = ?
    AND configId = ?
  LIMIT 1
`;
