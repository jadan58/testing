module.exports = (req, res) => {
  const target = 'https://x.com';

  res.status(302);
  res.setHeader('Location', target);
  res.end();
};
