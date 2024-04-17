const info = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`INFO: ${message}`);
  }
}

const error = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`ERROR: ${message}`);
  }
}

module.exports = {
  info, error
}