const emailService = (res, req) => {
  return res.status(200).json({
    message: "Email service test",
  });
};

export default emailService;
