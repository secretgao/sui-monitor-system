// Monitor Service 消息模式
export const MONITOR_PATTERNS = {
  GET_STATUS: 'monitor.get_status',
  START_MONITORING: 'monitor.start',
  STOP_MONITORING: 'monitor.stop',
  RESET_MONITORING: 'monitor.reset',
  TEST_CONNECTION: 'monitor.test_connection',
  GET_NETWORK_INFO: 'monitor.get_network_info',
  GET_NETWORKS: 'monitor.get_networks',
  GET_NETWORK: 'monitor.get_network',
};

// Transaction Service 消息模式
export const TRANSACTION_PATTERNS = {
  GET_LATEST: 'transaction.get_latest',
  GET_BY_DIGEST: 'transaction.get_by_digest',
  GET_BY_BLOCK: 'transaction.get_by_block',
  GET_BY_SENDER: 'transaction.get_by_sender',
  GET_COUNT: 'transaction.get_count',
  GET_STATISTICS: 'transaction.get_statistics',
  GET_TIME_RANGE: 'transaction.get_time_range',
  GET_PARSED_LATEST: 'transaction.get_parsed_latest',
  GET_PARSED_BY_DIGEST: 'transaction.get_parsed_by_digest',
  GET_PARSED_BY_BLOCK: 'transaction.get_parsed_by_block',
  GET_PARSED_BY_SENDER: 'transaction.get_parsed_by_sender',
  GET_PARSED_BY_TYPE: 'transaction.get_parsed_by_type',
  GET_PARSED_STATISTICS: 'transaction.get_parsed_statistics',
  GET_PARSED_COUNT: 'transaction.get_parsed_count',
  GET_TRANSACTION_TYPES: 'transaction.get_types',
};

// Wallet Service 消息模式
export const WALLET_PATTERNS = {
  GET_ALL: 'wallet.get_all',
  GET_BY_ADDRESS: 'wallet.get_by_address',
  GET_DETAILS: 'wallet.get_details',
  GET_ASSETS: 'wallet.get_assets',
  SEARCH: 'wallet.search',
  GET_STATISTICS: 'wallet.get_statistics',
  TEST_FUNCTIONALITY: 'wallet.test',
};

// Block Service 消息模式
export const BLOCK_PATTERNS = {
  GET_LATEST: 'block.get_latest',
  GET_BY_NUMBER: 'block.get_by_number',
  GET_COUNT: 'block.get_count',
  GET_STATISTICS: 'block.get_statistics',
  GET_TIME_RANGE: 'block.get_time_range',
}; 