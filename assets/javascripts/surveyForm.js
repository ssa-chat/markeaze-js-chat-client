module.exports = {
  trackShow (muid) {
    mkz('trackSurveyFormShow', {
      survey_form_uid: muid
    })
  },
  trackSubmit (muid, visitorInfo) {
    visitorInfo = Object.fromEntries(Object.entries(visitorInfo).filter((i) => i[1]))

    mkz('trackSurveyFormSubmit', {
      survey_form_uid: muid
    }, null, visitorInfo)
  }
}
