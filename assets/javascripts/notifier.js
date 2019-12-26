if(process.env && process.env.NODE_ENV === 'production') {
    const Notifier = require('@airbrake/browser').Notifier
    const airbrake = new Notifier({
        projectId: 229028,
        projectKey: '3927498a0d17867a76acf5aa97eba72d',
        environment: process.env.NODE_ENV,
    })
    // airbrake-js automatically setups window.onerror
    // https://github.com/airbrake/airbrake-js/tree/master/packages/browser#integration
    module.exports = airbrake
} else {
    module.exports = {}
}
