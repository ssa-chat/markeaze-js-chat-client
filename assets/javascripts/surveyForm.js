module.exports = {
  trackShow (uid) {
    mkz('trackSurveyFormShow', {
      survey_form_uid: uid
    })
  },
  trackSubmit (uid, visitorInfo) {
    visitorInfo = Object.fromEntries(Object.entries(visitorInfo).filter((i) => i[1]))

    mkz('trackSurveyFormSubmit', {
      survey_form_uid: uid
    }, null, visitorInfo)
  }
}
