module.exports = (req, res) => {
  const target = 'https://localhost';

  res.status(302);
  res.setHeader('Location', target);
  res.end();
};
