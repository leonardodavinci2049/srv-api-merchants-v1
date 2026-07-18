/**
 * Query parameterizada para sp_config_select_id_v1.
 *
 * Os valores de PROJECT_ID e CONFIG_ID sao passados como placeholders '?'
 * (execute) pelo DatabaseService, evitando interpolacao de valores
 * controlados pelo caller na string SQL.
 */
export const FIND_CONFIG_SELECT_ID_QUERY = 'CALL sp_config_select_id_v1(?, ?)';
