export const formatBtc = (btc, decimals = 8) => {
  return `₿${btc.toFixed(decimals)}`;
};

export const formatSats = (sats) => {
  return `${sats.toLocaleString()} sats`;
};

export const tokensToBtc = (tokens, ratePerToken = 0.0000001) => {
  return tokens * ratePerToken;
};