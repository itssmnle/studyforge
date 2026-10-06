export const isResponseCorrect = (response) => Boolean(
  response?.selfMarked ? response.selfMarkedCorrect : response?.correct
);

export const correctPercentage = (submission) => {
  const responses = submission?.responses;
  if (Array.isArray(responses) && responses.length) {
    return Math.round((responses.filter(isResponseCorrect).length / responses.length) * 100);
  }
  if (Number.isFinite(submission?.selfAssessedScore)) return submission.selfAssessedScore;
  return Number.isFinite(submission?.score) ? submission.score : 0;
};
