module.exports = (req, res) => {
  const target = 'https://google.com';

  res.status(302);
  res.setHeader('Location', target);
  res.end();
};
