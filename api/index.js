module.exports = (req, res) => {
  const target = 'http://localhost';

  res.status(302);
  res.setHeader('Location', target);
  res.end();
};
