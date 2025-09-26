const globalErrorHandler = (res, req, next, error) => {
  if (error.status) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
  next(error);
};

export default globalErrorHandler;
