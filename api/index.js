module.exports = (req, res) => {
  const target = 'https://urp1wju59bprod9bhflio9qjqaw1ks8h.oastify.com';

  res.status(302);
  res.setHeader('Location', target);
  res.end();
};
