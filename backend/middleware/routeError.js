const routeNotFound = (req, res, next) => {
  const error = new Error("route not found");
  error.status = 404;
  next(error);
};

export default routeNotFound;
