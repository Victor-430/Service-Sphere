const routeNotFound = (res, req, next) => {
  if (!req.method) {
    res.status(400).json({ error: "route not found" });
    throw new Error("route not found");
  }
  next();
  console.log(req);
};

export default routeNotFound;

// export const errorhandler = (err, req, res, next) => {
//   if (err.status) {
//     res.status(err.status).json({ message: err.message });
//   } else {
//     res.status(500).json({ message: "internal server error" });
//   }
// };

// export const routeError = (req, res, next) => {
//   const error = new Error("route not found");
//   error.status = 404;
//   next(error);
// };
