module.exports = {
  trackShow (uid) {
    mkz('trackSurveyFormShow', {
      survey_form_uid: uid
    })
  },
  trackSubmit (uid, visitorInfo) {
    mkz('trackSurveyFormSubmit', {
      survey_form_uid: uid
    }, visitorInfo)
  }
}
