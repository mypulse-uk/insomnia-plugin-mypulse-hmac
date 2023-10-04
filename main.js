// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

const hmacRequestHook = (context) => {
    context.request.setHeader('X-Mp-Plugin-Test', 'HelloWorld');
}

module.exports.hmacRequestHook  = hmacRequestHook
module.exports.requestHooks = [hmacRequestHook];