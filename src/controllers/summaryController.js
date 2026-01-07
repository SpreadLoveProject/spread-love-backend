const createSummary = async (req, res, _next) => {
  res.json({
    hasImage: !!req.file,
    url: req.body.url,
  });
};

export { createSummary };
