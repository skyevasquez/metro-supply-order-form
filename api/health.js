module.exports = async (req, res) => {
  return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};

