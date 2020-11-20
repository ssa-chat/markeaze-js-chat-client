declare global {
  interface Window {
    mkz: any
  }
}

export const trackShow = (uid: string): void => {
  window.mkz('trackSurveyFormShow', {
    survey_form_uid: uid
  })
}
export const trackSubmit = (uid: string, visitorInfo: any): void => {
  window.mkz('trackSurveyFormSubmit', {
    survey_form_uid: uid
  }, visitorInfo)
}
