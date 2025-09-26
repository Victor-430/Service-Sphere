const routeNotFound = (req, res, next) => {
  const error = new Error("route not found");
  error.status = 404;
  next(error);
};

const globalErrorHandler = (res, req, next, error) => {
  if (error.status) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
  next(error);
};

export default { routeNotFound, globalErrorHandler };
