// Custom validation middleware for request data
const validateByteData = (req, res, next) => {
  const { title, summary, example, category, quiz } = req.body;

  // Check required fields
  if (!title || !summary || !example || !category || !quiz) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate summary length
  if (summary.length < 100 || summary.length > 200) {
    res.status(400);
    throw new Error('Summary must be between 100 and 200 characters');
  }

  // Validate example length
  if (example.length < 100 || example.length > 200) {
    res.status(400);
    throw new Error('Example must be between 100 and 200 characters');
  }

  // Validate quiz
  if (!quiz.question || !quiz.options || !quiz.correctAnswer) {
    res.status(400);
    throw new Error('Quiz must include question, options, and correctAnswer');
  }

  // Validate quiz options
  if (!Array.isArray(quiz.options) || quiz.options.length < 2 || quiz.options.length > 4) {
    res.status(400);
    throw new Error('Quiz must have between 2 and 4 options');
  }

  // Validate correct answer is in options
  if (!quiz.options.includes(quiz.correctAnswer)) {
    res.status(400);
    throw new Error('Correct answer must be one of the options');
  }

  next();
};

module.exports = { validateByteData };
