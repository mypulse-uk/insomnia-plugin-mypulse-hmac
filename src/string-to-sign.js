const {createEncodedCanonicalRequest} = require("./canonical-request");
const createStringToSign = (timestamp, accessKeyId, request) => {
  const encodedCanonicalRequest = createEncodedCanonicalRequest(request)
  return `HMAC-SHA256\n${timestamp}\n${accessKeyId}\n${encodedCanonicalRequest}`
}

module.exports = {
  createStringToSign
}